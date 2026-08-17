import "dotenv/config";

import path from "node:path";

import { Worker } from "bullmq";
import { Prisma, ReportStatus } from "@prisma/client";

import { prisma } from "@archive/database";
import {
  CURRENT_REPORT_SCHEMA_VERSION,
} from "@archive/types";

import {
  EXECUTIVE_REPORT_QUEUE_NAME,
  redisConnection,
} from "@archive/queue";

import type {
  GenerateExecutiveReportJob,
} from "@archive/queue";

import {
  buildExecutiveSummary,
} from "../reports/executive-summary";

import {
  buildExecutiveKpis,
} from "../reports/kpi-builder";

import {
  buildRiskBreakdown,
} from "../reports/risk-analysis";

import {
  buildTechnologyAnalysis,
} from "../reports/technology-analysis";

import {
  buildEngineeringTrendAnalysis,
} from "../reports/trend-analysis";

import {
  buildRepositoryHighlights,
} from "../reports/repository-highlights";

import {
  generateReportPdf,
} from "../reports/pdf-generator";

import {
  generateReportCsv,
} from "../reports/csv-generator";

/**
 * Both the user Organization Dashboard and Team Dashboard return
 * JSON objects that the report analytics builders can consume.
 */
type ReportDashboard = Record<string, unknown>;

type ReportSource =
  GenerateExecutiveReportJob["source"];

/**
 * The report worker calls the ArcHive API because the API owns the
 * dashboard services and repository intelligence queries.
 *
 * In the free closed-beta deployment, API and Worker run as separate
 * processes inside the same Render container. In that mode, use localhost
 * plus Render's injected PORT instead of routing through the public internet.
 *
 * In a future split deployment, API_BASE_URL can point to the standalone
 * public/private API service.
 */
const API_BASE_URL =
  process.env.RUN_WORKERS_IN_API ===
    "true"
    ? `http://127.0.0.1:${process.env.PORT ||
    "6800"
    }`
    : process.env.API_BASE_URL ||
    "http://localhost:6800";

/**
 * Converts a normal JavaScript object into a value Prisma can safely
 * persist inside a Json column.
 */
const toPrismaJson = (
  value: unknown,
): Prisma.InputJsonValue => {
  return JSON.parse(
    JSON.stringify(value),
  ) as Prisma.InputJsonValue;
};

/**
 * Builds the correct dashboard endpoint for the report source.
 *
 * USER reports use the existing Organization Intelligence dashboard.
 * TEAM reports use the Team Intelligence dashboard.
 */
const buildDashboardEndpoint = (
  source: ReportSource,
): string => {
  if (source.type === "USER") {
    if (!source.userId?.trim()) {
      throw new Error(
        "A USER report source requires a userId.",
      );
    }

    return (
      `${API_BASE_URL}/api/users/` +
      `${encodeURIComponent(source.userId)}` +
      "/organization/dashboard"
    );
  }

  if (source.type === "TEAM") {
    if (!source.teamId?.trim()) {
      throw new Error(
        "A TEAM report source requires a teamId.",
      );
    }

    return (
      `${API_BASE_URL}/api/teams/` +
      `${encodeURIComponent(source.teamId)}` +
      "/dashboard"
    );
  }

  throw new Error(
    "Unsupported Executive Report source.",
  );
};

/**
 * Fetches the correct dashboard without making the rest of the report
 * pipeline care whether the source is a user or a team.
 */
const fetchDashboardForReport = async (
  source: ReportSource,
): Promise<ReportDashboard> => {
  const endpoint =
    buildDashboardEndpoint(source);

  const response = await fetch(endpoint, {
    method: "GET",

    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorBody =
      await response.text();

    throw new Error(
      `Executive Report dashboard request failed with status ` +
      `${response.status}: ${errorBody}`,
    );
  }

  const dashboard =
    await response.json();

  if (
    !dashboard ||
    typeof dashboard !== "object" ||
    Array.isArray(dashboard)
  ) {
    throw new Error(
      "The Executive Report dashboard response was not a valid object.",
    );
  }

  return dashboard as ReportDashboard;
};

/**
 * Produces a Prisma filter that confirms the report belongs to the
 * same user or team carried by the BullMQ job.
 *
 * This prevents a malformed job from processing an unrelated report.
 */
const buildReportOwnershipFilter = (
  reportId: string,
  source: ReportSource,
): Prisma.ReportWhereInput => {
  if (source.type === "USER") {
    if (!source.userId?.trim()) {
      throw new Error(
        "A USER report source requires a userId.",
      );
    }

    return {
      id: reportId,
      userId: source.userId,
      teamId: null,
    };
  }

  if (source.type === "TEAM") {
    if (!source.teamId?.trim()) {
      throw new Error(
        "A TEAM report source requires a teamId.",
      );
    }

    return {
      id: reportId,
      teamId: source.teamId,
      userId: null,
    };
  }

  throw new Error(
    "Unsupported Executive Report source.",
  );
};

/**
 * Returns readable source information for logs and report snapshots.
 */
const getSourceMetadata = (
  source: ReportSource,
) => {
  if (source.type === "USER") {
    return {
      sourceType: "USER" as const,
      sourceId: source.userId,
      userId: source.userId,
      teamId: null,
    };
  }

  return {
    sourceType: "TEAM" as const,
    sourceId: source.teamId,
    userId: null,
    teamId: source.teamId,
  };
};

/**
 * Generates and persists one Executive Report.
 *
 * The same pipeline is used for user and team reports:
 *
 * 1. Validate report ownership.
 * 2. Mark the report as GENERATING.
 * 3. Fetch the appropriate dashboard.
 * 4. Build immutable analytics.
 * 5. Generate PDF and CSV files.
 * 6. Persist everything.
 * 7. Mark the report as COMPLETED.
 */
const generateExecutiveReport = async ({
  reportId,
  source,
}: GenerateExecutiveReportJob): Promise<void> => {
  const ownershipFilter =
    buildReportOwnershipFilter(
      reportId,
      source,
    );

  const report =
    await prisma.report.findFirst({
      where: ownershipFilter,

      select: {
        id: true,
        status: true,
        title: true,
        description: true,
        userId: true,
        teamId: true,
      },
    });

  if (!report) {
    const metadata =
      getSourceMetadata(source);

    throw new Error(
      `Executive Report ${reportId} was not found for ` +
      `${metadata.sourceType.toLowerCase()} ` +
      `${metadata.sourceId}.`,
    );
  }

  /**
   * A completed report is immutable.
   *
   * This also protects against accidental duplicate queue processing.
   */
  if (
    report.status ===
    ReportStatus.COMPLETED
  ) {
    console.log(
      "Executive Report is already completed:",
      {
        reportId,
        ...getSourceMetadata(source),
      },
    );

    return;
  }

  await prisma.report.update({
    where: {
      id: reportId,
    },

    data: {
      status:
        ReportStatus.GENERATING,

      error: null,
    },
  });

  const dashboard =
    await fetchDashboardForReport(
      source,
    );

  /**
   * These analytics are calculated once and stored with the report.
   *
   * The frontend, PDF and CSV therefore consume the same immutable
   * analytical result.
   */
  const executiveSummary =
    buildExecutiveSummary(dashboard);

  const executiveKpis =
    buildExecutiveKpis(dashboard);

  const riskBreakdown =
    buildRiskBreakdown(dashboard);

  const technologyAnalysis =
    buildTechnologyAnalysis(dashboard);

  const trendAnalysis =
    buildEngineeringTrendAnalysis(
      dashboard,
    );

  const repositoryHighlights =
    buildRepositoryHighlights(
      dashboard,
    );

  const generatedAt =
    new Date();

  /**
   * In production, REPORT_STORAGE_DIR can point to mounted storage.
   *
   * During local development, generated files are written under:
   * apps/worker/storage/reports
   */
  const reportOutputDirectory =
    path.resolve(
      process.env.REPORT_STORAGE_DIR ??
      path.join(
        process.cwd(),
        "storage",
        "reports",
      ),
    );

  const sourceMetadata =
    getSourceMetadata(source);

  const reportSnapshot = {
    /*
     * The persisted Executive Report schema version is owned by the
     * shared contract package.
     *
     * This prevents the worker and report consumers from independently
     * drifting onto different "current" schema versions.
     */
    schemaVersion:
      CURRENT_REPORT_SCHEMA_VERSION,

    reportId,

    title: report.title,

    description:
      report.description ?? null,

    generatedAt:
      generatedAt.toISOString(),

    source: sourceMetadata,

    executiveSummary,

    executiveKpis,

    riskBreakdown,

    technologyAnalysis,

    trendAnalysis,

    repositoryHighlights,

    /**
     * Preserve the original dashboard used for this report.
     */
    organization: dashboard,
  };

  /**
   * PDF and CSV are generated in parallel because neither depends
   * on the other.
   */
  const [pdfPath, csvPath] =
    await Promise.all([
      generateReportPdf({
        reportId,

        title: report.title,

        description:
          report.description,

        generatedAt,

        executiveSummary,

        executiveKpis,

        riskBreakdown,

        technologyAnalysis,

        trendAnalysis,

        repositoryHighlights,

        organization:
          dashboard as Record<
            string,
            any
          >,

        outputDirectory:
          reportOutputDirectory,
      }),

      generateReportCsv({
        reportId,

        reportSnapshot,

        outputDirectory:
          reportOutputDirectory,
      }),
    ]);

  /**
   * COMPLETED is written only after:
   *
   * - analytics have been built,
   * - reportData is ready,
   * - the PDF exists,
   * - the CSV exists.
   */
  await prisma.report.update({
    where: {
      id: reportId,
    },

    data: {
      status:
        ReportStatus.COMPLETED,

      reportData:
        toPrismaJson(
          reportSnapshot,
        ),

      pdfPath,

      csvPath,

      generatedAt,

      error: null,
    },
  });
};

const reportWorker =
  new Worker<GenerateExecutiveReportJob>(
    EXECUTIVE_REPORT_QUEUE_NAME,

    async (job) => {
      const sourceMetadata =
        getSourceMetadata(
          job.data.source,
        );

      console.log(
        "Executive Report generation started:",
        {
          jobId: job.id,

          reportId:
            job.data.reportId,

          ...sourceMetadata,

          attempt:
            job.attemptsMade + 1,
        },
      );

      await generateExecutiveReport(
        job.data,
      );

      return {
        success: true,

        reportId:
          job.data.reportId,

        sourceType:
          sourceMetadata.sourceType,

        sourceId:
          sourceMetadata.sourceId,

        message:
          "Executive Report generated successfully.",
      };
    },

    {
      connection:
        redisConnection as any,

      /**
       * Report generation performs database queries and file creation,
       * so concurrency remains deliberately lower than event processing.
       */
      concurrency: 2,
    },
  );

reportWorker.on(
  "completed",
  (job) => {
    console.log(
      "Executive Report job completed:",
      {
        jobId: job.id,

        reportId:
          job.data.reportId,

        ...getSourceMetadata(
          job.data.source,
        ),
      },
    );
  },
);

reportWorker.on(
  "failed",
  async (job, error) => {
    console.error(
      "Executive Report job failed:",
      {
        jobId: job?.id,

        reportId:
          job?.data.reportId,

        source:
          job?.data.source,

        message:
          error.message,
      },
    );

    const reportId =
      job?.data.reportId;

    if (!reportId) {
      return;
    }

    /**
     * The queue may retry a failed job.
     *
     * We only persist FAILED after the final configured attempt.
     */
    const maximumAttempts =
      typeof job.opts.attempts ===
        "number"
        ? job.opts.attempts
        : 1;

    const hasMoreAttempts =
      job.attemptsMade <
      maximumAttempts;

    if (hasMoreAttempts) {
      console.log(
        "Executive Report will be retried:",
        {
          reportId,

          attemptsMade:
            job.attemptsMade,

          maximumAttempts,
        },
      );

      return;
    }

    try {
      await prisma.report.update({
        where: {
          id: reportId,
        },

        data: {
          status:
            ReportStatus.FAILED,

          error:
            error.message,
        },
      });
    } catch (databaseError) {
      console.error(
        "Unable to store Executive Report failure:",
        databaseError,
      );
    }
  },
);

reportWorker.on(
  "error",
  (error) => {
    console.error(
      "Executive Report worker connection error:",
      error,
    );
  },
);

console.log(
  "ArcHive report worker is waiting for Executive Report jobs...",
);
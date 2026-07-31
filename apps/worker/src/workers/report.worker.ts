import "dotenv/config";

import { Worker } from "bullmq";
import { Prisma, ReportStatus } from "@prisma/client";

import { prisma } from "@archive/database";
import {
  EXECUTIVE_REPORT_QUEUE_NAME,
  redisConnection,
} from "@archive/queue";

import type { GenerateExecutiveReportJob } from "@archive/queue";

/**
 * The worker needs access to the ArcHive API because the API already owns
 * the complete Organization Intelligence dashboard service.
 *
 * Keeping one source of truth prevents the report worker from rebuilding
 * overview, rankings, risks, trends, and recommendations differently.
 */
const API_BASE_URL =
  process.env.API_BASE_URL || "http://localhost:6800";

/**
 * Fetches the complete Organization Intelligence dashboard for a user.
 *
 * This endpoint already combines:
 * - organization overview
 * - repository rankings
 * - technology inventory
 * - recommendations
 * - risks
 * - activity
 * - trends
 */
const fetchOrganizationDashboard = async (
  userId: string,
): Promise<Prisma.InputJsonValue> => {
  const encodedUserId = encodeURIComponent(userId);

  const endpoint =
    `${API_BASE_URL}/api/users/${encodedUserId}` +
    "/organization/dashboard";

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Organization Intelligence request failed with status ` +
        `${response.status}: ${errorBody}`,
    );
  }

  const dashboard = await response.json();

  return dashboard as Prisma.InputJsonValue;
};

/**
 * Generates and stores one Executive Report snapshot.
 *
 * Important:
 * We store the dashboard as JSON rather than recalculating it whenever
 * someone opens the report. This means a generated report represents the
 * exact state of the organization at the time it was created.
 */
const generateExecutiveReport = async ({
  reportId,
  userId,
}: GenerateExecutiveReportJob): Promise<void> => {
  const report = await prisma.report.findFirst({
    where: {
      id: reportId,
      userId,
    },
    select: {
      id: true,
      status: true,
      title: true,
    },
  });

  if (!report) {
    throw new Error(
      `Executive Report ${reportId} was not found for user ${userId}.`,
    );
  }

  /**
   * A completed report should not be generated again accidentally.
   *
   * This protects us if BullMQ retries or the same job somehow runs twice.
   */
  if (report.status === ReportStatus.COMPLETED) {
    console.log("Executive Report is already completed:", {
      reportId,
      userId,
    });

    return;
  }

  await prisma.report.update({
    where: {
      id: reportId,
    },
    data: {
      status: ReportStatus.GENERATING,
      error: null,
    },
  });

  const organizationDashboard =
    await fetchOrganizationDashboard(userId);

  const generatedAt = new Date();

  /**
   * Versioning gives us room to change the report structure later.
   *
   * For example, future reports may include AI summaries, comparisons,
   * business impact analysis, or additional organization metrics.
   */
  const reportSnapshot: Prisma.InputJsonValue = {
    schemaVersion: 1,
    reportId,
    title: report.title,
    generatedAt: generatedAt.toISOString(),
    organization: organizationDashboard,
  };

  await prisma.report.update({
    where: {
      id: reportId,
    },
    data: {
      status: ReportStatus.COMPLETED,
      reportData: reportSnapshot,
      generatedAt,
      error: null,
    },
  });
};

const reportWorker = new Worker<GenerateExecutiveReportJob>(
  EXECUTIVE_REPORT_QUEUE_NAME,

  async (job) => {
    console.log("Executive Report generation started:", {
      jobId: job.id,
      reportId: job.data.reportId,
      userId: job.data.userId,
      attempt: job.attemptsMade + 1,
    });

    await generateExecutiveReport(job.data);

    return {
      success: true,
      reportId: job.data.reportId,
      message: "Executive Report generated successfully.",
    };
  },

  {
    connection: redisConnection as any,

    /**
     * Report generation can involve several database queries and later
     * PDF creation, so we keep concurrency lower than engineering events.
     */
    concurrency: 2,
  },
);

reportWorker.on("completed", (job) => {
  console.log("Executive Report job completed:", {
    jobId: job.id,
    reportId: job.data.reportId,
  });
});

reportWorker.on("failed", async (job, error) => {
  console.error("Executive Report job failed:", {
    jobId: job?.id,
    reportId: job?.data.reportId,
    message: error.message,
  });

  const reportId = job?.data.reportId;

  if (!reportId) {
    return;
  }

  /**
   * BullMQ may retry the job.
   *
   * We only mark it permanently FAILED after the final attempt has failed.
   */
  const maximumAttempts =
    typeof job.opts.attempts === "number"
      ? job.opts.attempts
      : 1;

  const hasMoreAttempts =
    job.attemptsMade < maximumAttempts;

  if (hasMoreAttempts) {
    console.log("Executive Report will be retried:", {
      reportId,
      attemptsMade: job.attemptsMade,
      maximumAttempts,
    });

    return;
  }

  try {
    await prisma.report.update({
      where: {
        id: reportId,
      },
      data: {
        status: ReportStatus.FAILED,
        error: error.message,
      },
    });
  } catch (databaseError) {
    console.error(
      "Unable to store Executive Report failure:",
      databaseError,
    );
  }
});

reportWorker.on("error", (error) => {
  console.error(
    "Executive Report worker connection error:",
    error,
  );
});

console.log(
  "ArcHive report worker is waiting for Executive Report jobs...",
);
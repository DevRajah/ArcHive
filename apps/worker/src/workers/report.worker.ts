import "dotenv/config";

import { Worker } from "bullmq";
import {
  Prisma,
  ReportStatus,
} from "@prisma/client";

import { prisma } from "@archive/database";

import {
  EXECUTIVE_REPORT_QUEUE_NAME,
  GenerateExecutiveReportJob,
  redisConnection,
} from "@archive/queue";

/**
 * Address of the ArcHive API.
 *
 * The worker calls the existing Organization Dashboard endpoint
 * instead of duplicating organization-intelligence calculations.
 */
const API_BASE_URL =
  process.env.API_BASE_URL || "http://localhost:6800";

/**
 * Fetches the complete Organization Intelligence dashboard.
 *
 * This endpoint already combines:
 *
 * - overview
 * - rankings
 * - technologies
 * - recommendations
 * - risks
 * - activity
 * - trends
 */
async function fetchOrganizationDashboard(
  userId: string,
): Promise<Prisma.InputJsonValue> {
  const endpoint =
    `${API_BASE_URL}/api/users/${encodeURIComponent(userId)}` +
    "/organization/dashboard";

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const responseText = await response.text();

    throw new Error(
      `Organization dashboard request failed with status ` +
      `${response.status}: ${responseText}`,
    );
  }

  const dashboard = await response.json();

  /**
   * Prisma requires JSON written to a Json column to be compatible
   * with InputJsonValue.
   */
  return dashboard as Prisma.InputJsonValue;
}

/**
 * Generates an immutable Executive Report snapshot.
 */
async function generateExecutiveReport(
  reportId: string,
  userId: string,
): Promise<void> {
  const report = await prisma.report.findFirst({
    where: {
      id: reportId,
      userId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!report) {
    throw new Error(
      `Report ${reportId} could not be found for user ${userId}.`,
    );
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

  /**
   * Versioning lets ArcHive evolve the report format later while
   * keeping old generated reports understandable.
   */
  const snapshot: Prisma.InputJsonValue = {
    version: 1,
    generatedAt: new Date().toISOString(),
    organization: organizationDashboard,
  };

  await prisma.report.update({
    where: {
      id: reportId,
    },
    data: {
      status: ReportStatus.COMPLETED,
      reportData: snapshot,
      generatedAt: new Date(),
      error: null,
    },
  });
}

const reportWorker =
  new Worker<GenerateExecutiveReportJob>(
    EXECUTIVE_REPORT_QUEUE_NAME,

    async (job) => {
      const { reportId, userId } = job.data;

      console.log("Executive Report generation started:", {
        jobId: job.id,
        reportId,
        userId,
      });

      await generateExecutiveReport(
        reportId,
        userId,
      );

      return {
        message:
          "Executive Report generated successfully.",
        reportId,
      };
    },

    {
      connection: redisConnection as any,
      concurrency: 2,
    },
  );

reportWorker.on("completed", (job) => {
  console.log(
    `Executive Report job completed: ${job.id}`,
  );
});

reportWorker.on(
  "failed",
  async (job, error) => {
    console.error(
      `Executive Report job failed: ${job?.id}`,
      error,
    );

    const reportId = job?.data.reportId;

    if (!reportId) {
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
        "Failed to update the report failure status:",
        databaseError,
      );
    }
  },
);

console.log(
  "ArcHive report worker is waiting for Executive Report jobs...",
);
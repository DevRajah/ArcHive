import { ReportStatus } from "@prisma/client";
import { executiveReportQueue } from "@archive/queue";

import { prisma } from "@archive/database";

import type {
  GenerateReportRequest,
  GenerateReportResponse,
} from "../../types/report.types";

/**
 * Creates and queues a new Executive Report.
 *
 * Flow:
 *
 * 1. Confirm that the user exists.
 * 2. Create the Report row with QUEUED status.
 * 3. Add a BullMQ job.
 * 4. Return immediately to the frontend.
 */
export async function createReport(
  request: GenerateReportRequest,
): Promise<GenerateReportResponse> {
  const title = request.title.trim();
  const description = request.description?.trim() || null;

  if (!request.userId?.trim()) {
    throw new Error("A userId is required to generate a report.");
  }

  if (!title) {
    throw new Error("A report title is required.");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: request.userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error("The selected ArcHive user does not exist.");
  }

  const report = await prisma.report.create({
    data: {
      userId: request.userId,
      title,
      description,
      status: ReportStatus.QUEUED,
    },
  });

  try {
    await executiveReportQueue.add(
      "generate-executive-report",
      {
        reportId: report.id,
        userId: report.userId,
      },
      {
        /**
         * Using the report ID as the BullMQ job ID prevents the same
         * report from accidentally being queued more than once.
         */
        jobId: report.id,
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The report could not be added to the generation queue.";

    await prisma.report.update({
      where: {
        id: report.id,
      },
      data: {
        status: ReportStatus.FAILED,
        error: message,
      },
    });

    throw error;
  }

  return {
    success: true,
    reportId: report.id,
    status: ReportStatus.QUEUED,
    message: "Executive Report queued successfully.",
  };
}
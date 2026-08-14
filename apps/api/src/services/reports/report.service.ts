import { ReportStatus } from "@prisma/client";
import { executiveReportQueue } from "@archive/queue";

import { prisma } from "@archive/database";

import type {
  GenerateReportRequest,
  GenerateReportResponse,
} from "../../types/report.types";

import {
  ReportSourceType,
  type ReportSource,
} from "@archive/types";

/**
 * Creates and queues a new personal Executive Report.
 *
 * Flow:
 *
 * 1. Validate the request.
 * 2. Confirm that the user exists.
 * 3. Create the Report row with QUEUED status.
 * 4. Add a BullMQ job using a USER report source.
 * 5. Return immediately to the frontend.
 */
export async function createReport(
  request: GenerateReportRequest,
): Promise<GenerateReportResponse> {
  const userId = request.userId?.trim();
  const title = request.title?.trim();
  const description =
    request.description?.trim() || null;

  if (!userId) {
    throw new Error(
      "A userId is required to generate a report.",
    );
  }

  if (!title) {
    throw new Error(
      "A report title is required.",
    );
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
      },
    });

  if (!user) {
    throw new Error(
      "The selected ArcHive user does not exist.",
    );
  }

  const report =
    await prisma.report.create({
      data: {
        userId,

        /**
         * A personal report does not belong to a team.
         */
        teamId: null,

        title,

        description,

        status:
          ReportStatus.QUEUED,
      },
    });

  try {
    /**
     * Report.userId is optional in Prisma because Team Reports use teamId.
     *
     * For this personal-report service, it must always exist.
     */
    if (!report.userId) {
      throw new Error(
        "A personal Executive Report requires a userId.",
      );
    }

    await executiveReportQueue.add(
      "generate-executive-report",

      {
        reportId:
          report.id,

        source: {
          type:
            ReportSourceType.USER,

          userId:
            report.userId,
        },
      },

      {
        /**
         * Using the report ID as the BullMQ job ID prevents the same
         * report from accidentally being queued more than once.
         */
        jobId:
          report.id,
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
        status:
          ReportStatus.FAILED,

        error:
          message,
      },
    });

    throw error;
  }

  return {
    success: true,

    reportId:
      report.id,

    status:
      ReportStatus.QUEUED,

    message:
      "Executive Report queued successfully.",
  };
}
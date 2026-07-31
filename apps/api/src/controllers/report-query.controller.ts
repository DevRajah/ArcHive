import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  deleteReport,
  getReportById,
  getReportStatus,
  getUserReports,
  ReportNotFoundError,
} from "../services/reports/report-query.service";

type UserParams = {
  userId: string;
};

type ReportParams = {
  userId: string;
  reportId: string;
};

/**
 * Returns report history for one user.
 */
export const listUserReportsController = async (
  request: FastifyRequest<{
    Params: UserParams;
  }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const { userId } = request.params;

    if (!userId?.trim()) {
      reply.status(400).send({
        success: false,
        message: "A userId is required.",
      });

      return;
    }

    const reports = await getUserReports(userId);

    reply.status(200).send({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    request.log.error(
      error,
      "Failed to retrieve Executive Reports",
    );

    reply.status(500).send({
      success: false,
      message: "Unable to retrieve Executive Reports.",
    });
  }
};

/**
 * Returns the complete stored snapshot for one report.
 */
export const getReportController = async (
  request: FastifyRequest<{
    Params: ReportParams;
  }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const { userId, reportId } = request.params;

    if (!userId?.trim() || !reportId?.trim()) {
      reply.status(400).send({
        success: false,
        message: "Both userId and reportId are required.",
      });

      return;
    }

    const report = await getReportById(
      reportId,
      userId,
    );

    reply.status(200).send({
      success: true,
      report,
    });
  } catch (error) {
    if (error instanceof ReportNotFoundError) {
      reply.status(404).send({
        success: false,
        message: error.message,
      });

      return;
    }

    request.log.error(
      error,
      "Failed to retrieve Executive Report",
    );

    reply.status(500).send({
      success: false,
      message: "Unable to retrieve the Executive Report.",
    });
  }
};

/**
 * Returns the current generation state of one report.
 */
export const getReportStatusController = async (
  request: FastifyRequest<{
    Params: ReportParams;
  }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const { userId, reportId } = request.params;

    if (!userId?.trim() || !reportId?.trim()) {
      reply.status(400).send({
        success: false,
        message: "Both userId and reportId are required.",
      });

      return;
    }

    const reportStatus = await getReportStatus(
      reportId,
      userId,
    );

    reply.status(200).send({
      success: true,
      report: reportStatus,
    });
  } catch (error) {
    if (error instanceof ReportNotFoundError) {
      reply.status(404).send({
        success: false,
        message: error.message,
      });

      return;
    }

    request.log.error(
      error,
      "Failed to retrieve Executive Report status",
    );

    reply.status(500).send({
      success: false,
      message:
        "Unable to retrieve the Executive Report status.",
    });
  }
};

/**
 * Deletes one Executive Report.
 */
export const deleteReportController = async (
  request: FastifyRequest<{
    Params: ReportParams;
  }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const { userId, reportId } = request.params;

    if (!userId?.trim() || !reportId?.trim()) {
      reply.status(400).send({
        success: false,
        message: "Both userId and reportId are required.",
      });

      return;
    }

    await deleteReport(reportId, userId);

    reply.status(200).send({
      success: true,
      reportId,
      message: "Executive Report deleted successfully.",
    });
  } catch (error) {
    if (error instanceof ReportNotFoundError) {
      reply.status(404).send({
        success: false,
        message: error.message,
      });

      return;
    }

    request.log.error(
      error,
      "Failed to delete Executive Report",
    );

    reply.status(500).send({
      success: false,
      message: "Unable to delete the Executive Report.",
    });
  }
};
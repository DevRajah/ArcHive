import {
  createReadStream,
} from "node:fs";

import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  getReportFile,
  ReportFileNotReadyError,
  type ReportFileType,
} from "../services/reports/report-download.service";

import {
  ReportNotFoundError,
} from "../services/reports/report-query.service";

type ReportDownloadParams = {
  userId: string;
  reportId: string;
  fileType: string;
};

export const downloadReportController =
  async (
    request: FastifyRequest<{
      Params: ReportDownloadParams;
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    try {
      const {
        userId,
        reportId,
        fileType,
      } = request.params;

      if (
        fileType !== "pdf" &&
        fileType !== "csv"
      ) {
        reply.status(400).send({
          success: false,
          message:
            "Supported report file types are pdf and csv.",
        });

        return;
      }

      const reportFile =
        await getReportFile({
          reportId,
          userId,
          fileType:
            fileType as ReportFileType,
        });

      const contentType =
        fileType === "pdf"
          ? "application/pdf"
          : "text/csv; charset=utf-8";

      reply.header(
        "Content-Type",
        contentType,
      );

      reply.header(
        "Content-Disposition",
        `attachment; filename="${reportFile.downloadName}"`,
      );

      return reply.send(
        createReadStream(
          reportFile.filePath,
        ),
      );
    } catch (error) {
      if (
        error instanceof
        ReportNotFoundError
      ) {
        reply.status(404).send({
          success: false,
          message: error.message,
        });

        return;
      }

      if (
        error instanceof
        ReportFileNotReadyError
      ) {
        reply.status(409).send({
          success: false,
          message: error.message,
        });

        return;
      }

      request.log.error(
        error,
        "Failed to download Executive Report",
      );

      reply.status(500).send({
        success: false,
        message:
          "Unable to download the Executive Report.",
      });
    }
  };
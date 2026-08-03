import {
  createReadStream,
} from "node:fs";

import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  createTeamReport,
  deleteTeamReport,
  getTeamReportById,
  getTeamReports,
} from "../services/reports/team-report.service";

import {
  getTeamReportFile,
  TeamReportFileNotReadyError,
  type TeamReportFileType,
} from "../services/reports/team-report-download.service";

import {
  TeamAccessDeniedError,
  TeamNotFoundError,
  TeamValidationError,
} from "../services/teams/team-permission.service";

const sendTeamReportError = (
  error: unknown,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  if (
    error instanceof
    TeamValidationError
  ) {
    return reply.status(400).send({
      success: false,
      message: error.message,
    });
  }

  if (
    error instanceof
    TeamAccessDeniedError
  ) {
    return reply.status(403).send({
      success: false,
      message: error.message,
    });
  }

  if (
    error instanceof
    TeamNotFoundError
  ) {
    return reply.status(404).send({
      success: false,
      message: error.message,
    });
  }

  if (
    error instanceof
    TeamReportFileNotReadyError
  ) {
    return reply.status(409).send({
      success: false,
      message: error.message,
    });
  }

  request.log.error(
    error,
    "Team Executive Report request failed",
  );

  return reply.status(500).send({
    success: false,
    message:
      "The Team Executive Report request could not be completed.",
  });
};

export const generateTeamReportController =
  async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const { teamId } =
        request.params as {
          teamId: string;
        };

      const result =
        await createTeamReport({
          teamId,

          input:
            request.body as {
              actorUserId: string;
              title: string;
              description?: string;
            },
        });

      return reply
        .status(202)
        .send(result);
    } catch (error) {
      return sendTeamReportError(
        error,
        request,
        reply,
      );
    }
  };

export const listTeamReportsController =
  async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const { teamId } =
        request.params as {
          teamId: string;
        };

      const { userId } =
        request.query as {
          userId: string;
        };

      const reports =
        await getTeamReports({
          teamId,
          actorUserId: userId,
        });

      return reply.send({
        success: true,
        count: reports.length,
        reports,
      });
    } catch (error) {
      return sendTeamReportError(
        error,
        request,
        reply,
      );
    }
  };

export const getTeamReportController =
  async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const {
        teamId,
        reportId,
      } = request.params as {
        teamId: string;
        reportId: string;
      };

      const { userId } =
        request.query as {
          userId: string;
        };

      const report =
        await getTeamReportById({
          teamId,
          reportId,
          actorUserId: userId,
        });

      return reply.send({
        success: true,
        report,
      });
    } catch (error) {
      return sendTeamReportError(
        error,
        request,
        reply,
      );
    }
  };

export const deleteTeamReportController =
  async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const {
        teamId,
        reportId,
      } = request.params as {
        teamId: string;
        reportId: string;
      };

      const { actorUserId } =
        request.query as {
          actorUserId: string;
        };

      await deleteTeamReport({
        teamId,
        reportId,
        actorUserId,
      });

      return reply.send({
        success: true,
        reportId,
        message:
          "Team Executive Report deleted successfully.",
      });
    } catch (error) {
      return sendTeamReportError(
        error,
        request,
        reply,
      );
    }
  };

export const downloadTeamReportController =
  async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const {
        teamId,
        reportId,
        fileType,
      } = request.params as {
        teamId: string;
        reportId: string;
        fileType: string;
      };

      const { userId } =
        request.query as {
          userId: string;
        };

      if (
        fileType !== "pdf" &&
        fileType !== "csv"
      ) {
        return reply.status(400).send({
          success: false,
          message:
            "Supported file types are pdf and csv.",
        });
      }

      const file =
        await getTeamReportFile({
          teamId,
          reportId,
          actorUserId: userId,
          fileType:
            fileType as TeamReportFileType,
        });

      reply.header(
        "Content-Type",
        fileType === "pdf"
          ? "application/pdf"
          : "text/csv; charset=utf-8",
      );

      reply.header(
        "Content-Disposition",
        `attachment; filename="${file.downloadName}"`,
      );

      return reply.send(
        createReadStream(
          file.filePath,
        ),
      );
    } catch (error) {
      return sendTeamReportError(
        error,
        request,
        reply,
      );
    }
  };
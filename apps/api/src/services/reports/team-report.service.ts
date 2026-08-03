import {
  ReportStatus,
  TeamMemberRole,
} from "@prisma/client";

import { prisma } from "@archive/database";

import {
  executiveReportQueue,
} from "@archive/queue";

import {
  requireTeamMembership,
  requireTeamRole,
  TeamNotFoundError,
  TeamValidationError,
} from "../teams/team-permission.service";

import {
  ReportSourceType,
} from "../../types/report-source.types";

export interface GenerateTeamReportInput {
  actorUserId: string;
  title: string;
  description?: string;
}

/**
 * Creates a Team Executive Report and sends it to BullMQ.
 *
 * OWNER, ADMIN and MEMBER can generate reports.
 * VIEWER remains read-only.
 */
export const createTeamReport = async ({
  teamId,
  input,
}: {
  teamId: string;
  input: GenerateTeamReportInput;
}) => {
  await requireTeamRole({
    teamId,
    userId: input.actorUserId,
    allowedRoles: [
      TeamMemberRole.OWNER,
      TeamMemberRole.ADMIN,
      TeamMemberRole.MEMBER,
    ],
  });

  const title =
    input.title?.trim();

  const description =
    input.description?.trim() || null;

  if (!title) {
    throw new TeamValidationError(
      "A report title is required.",
    );
  }

  const team =
    await prisma.team.findUnique({
      where: {
        id: teamId,
      },

      select: {
        id: true,
      },
    });

  if (!team) {
    throw new TeamNotFoundError();
  }

  const report =
    await prisma.report.create({
      data: {
        teamId,

        /**
         * A Team Report belongs to the team, not to one individual user.
         */
        userId: null,

        title,

        description,

        status:
          ReportStatus.QUEUED,
      },
    });

  try {
    await executiveReportQueue.add(
      "generate-executive-report",

      {
        reportId:
          report.id,

        source: {
          type: ReportSourceType.TEAM,
          teamId,
        },
      },

      {
        jobId:
          report.id,
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The Team Report could not be added to the queue.";

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

    teamId,

    status:
      ReportStatus.QUEUED,

    message:
      "Team Executive Report queued successfully.",
  };
};

/**
 * Returns lightweight Team Report history.
 */
export const getTeamReports = async ({
  teamId,
  actorUserId,
}: {
  teamId: string;
  actorUserId: string;
}) => {
  await requireTeamMembership({
    teamId,
    userId: actorUserId,
  });

  const reports =
    await prisma.report.findMany({
      where: {
        teamId,
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        teamId: true,
        title: true,
        description: true,
        status: true,
        generatedAt: true,
        createdAt: true,
        updatedAt: true,
        pdfPath: true,
        csvPath: true,
        error: true,
      },
    });

  return reports.map((report) => ({
    id:
      report.id,

    teamId:
      report.teamId,

    title:
      report.title,

    description:
      report.description,

    status:
      report.status,

    generatedAt:
      report.generatedAt,

    createdAt:
      report.createdAt,

    updatedAt:
      report.updatedAt,

    error:
      report.error,

    hasPdf:
      Boolean(report.pdfPath),

    hasCsv:
      Boolean(report.csvPath),
  }));
};

/**
 * Returns one Team Report with its complete stored analytics snapshot.
 */
export const getTeamReportById = async ({
  teamId,
  reportId,
  actorUserId,
}: {
  teamId: string;
  reportId: string;
  actorUserId: string;
}) => {
  await requireTeamMembership({
    teamId,
    userId: actorUserId,
  });

  const report =
    await prisma.report.findFirst({
      where: {
        id: reportId,
        teamId,
      },

      select: {
        id: true,
        teamId: true,
        title: true,
        description: true,
        status: true,
        reportData: true,
        pdfPath: true,
        csvPath: true,
        error: true,
        generatedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  if (!report) {
    throw new TeamNotFoundError(
      "Team Executive Report not found.",
    );
  }

  return {
    ...report,

    hasPdf:
      Boolean(report.pdfPath),

    hasCsv:
      Boolean(report.csvPath),
  };
};

/**
 * Deletes one Team Report.
 *
 * Only OWNER and ADMIN may delete reports from the shared archive.
 */
export const deleteTeamReport = async ({
  teamId,
  reportId,
  actorUserId,
}: {
  teamId: string;
  reportId: string;
  actorUserId: string;
}) => {
  await requireTeamRole({
    teamId,
    userId: actorUserId,
    allowedRoles: [
      TeamMemberRole.OWNER,
      TeamMemberRole.ADMIN,
    ],
  });

  const report =
    await prisma.report.findFirst({
      where: {
        id: reportId,
        teamId,
      },

      select: {
        id: true,
      },
    });

  if (!report) {
    throw new TeamNotFoundError(
      "Team Executive Report not found.",
    );
  }

  await prisma.report.delete({
    where: {
      id: report.id,
    },
  });
};
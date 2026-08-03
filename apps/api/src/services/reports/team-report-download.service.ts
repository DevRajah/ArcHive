import {
  access,
} from "node:fs/promises";

import {
  constants,
} from "node:fs";

import { prisma } from "@archive/database";

import {
  requireTeamMembership,
  TeamNotFoundError,
} from "../teams/team-permission.service";

export type TeamReportFileType =
  | "pdf"
  | "csv";

export class TeamReportFileNotReadyError
  extends Error {
  constructor(message: string) {
    super(message);

    this.name =
      "TeamReportFileNotReadyError";
  }
}

export const getTeamReportFile = async ({
  teamId,
  reportId,
  actorUserId,
  fileType,
}: {
  teamId: string;
  reportId: string;
  actorUserId: string;
  fileType: TeamReportFileType;
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
        title: true,
        pdfPath: true,
        csvPath: true,
      },
    });

  if (!report) {
    throw new TeamNotFoundError(
      "Team Executive Report not found.",
    );
  }

  const filePath =
    fileType === "pdf"
      ? report.pdfPath
      : report.csvPath;

  if (!filePath) {
    throw new TeamReportFileNotReadyError(
      `The ${fileType.toUpperCase()} file has not been generated yet.`,
    );
  }

  try {
    await access(
      filePath,
      constants.R_OK,
    );
  } catch {
    throw new TeamReportFileNotReadyError(
      `The generated ${fileType.toUpperCase()} file could not be found on the server.`,
    );
  }

  const safeTitle =
    report.title
      .trim()
      .replace(
        /[^a-zA-Z0-9]+/g,
        "-",
      )
      .replace(
        /^-|-$/g,
        "",
      )
      .toLowerCase() ||
    "team-executive-report";

  return {
    filePath,

    downloadName:
      `${safeTitle}.${fileType}`,
  };
};
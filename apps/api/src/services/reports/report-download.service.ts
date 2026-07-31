import {
  access,
} from "node:fs/promises";

import { constants } from "node:fs";

import {
  prisma,
} from "@archive/database";

import {
  ReportNotFoundError,
} from "./report-query.service";

export type ReportFileType =
  | "pdf"
  | "csv";

export class ReportFileNotReadyError
  extends Error {
  constructor(
    message =
      "The requested report file is not available.",
  ) {
    super(message);

    this.name =
      "ReportFileNotReadyError";
  }
}

export const getReportFile = async ({
  reportId,
  userId,
  fileType,
}: {
  reportId: string;
  userId: string;
  fileType: ReportFileType;
}) => {
  const report =
    await prisma.report.findFirst({
      where: {
        id: reportId,
        userId,
      },
      select: {
        id: true,
        title: true,
        status: true,
        pdfPath: true,
        csvPath: true,
      },
    });

  if (!report) {
    throw new ReportNotFoundError();
  }

  const filePath =
    fileType === "pdf"
      ? report.pdfPath
      : report.csvPath;

  if (!filePath) {
    throw new ReportFileNotReadyError(
      `The ${fileType.toUpperCase()} file has not been generated yet.`,
    );
  }

  try {
    await access(
      filePath,
      constants.R_OK,
    );
  } catch {
    throw new ReportFileNotReadyError(
      `The generated ${fileType.toUpperCase()} file could not be found on the server.`,
    );
  }

  return {
    filePath,
    downloadName:
      `${report.title
        .trim()
        .replace(
          /[^a-zA-Z0-9]+/g,
          "-",
        )
        .replace(
          /^-|-$/g,
          "",
        )
        .toLowerCase() || "executive-report"}.${fileType}`,
  };
};
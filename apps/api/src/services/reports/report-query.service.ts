import { prisma } from "@archive/database";

import type {
  ReportListItem,
  ReportStatusResult,
} from "../../types/report.types";

/**
 * Custom application error for a report that cannot be found.
 *
 * This allows the controller to return a proper 404 response instead
 * of treating an expected missing record as an internal server error.
 */
export class ReportNotFoundError extends Error {
  constructor(message = "Executive Report not found.") {
    super(message);
    this.name = "ReportNotFoundError";
  }
}

/**
 * Returns lightweight report history for one user.
 *
 * We intentionally exclude reportData here. The list page only needs
 * metadata such as title, status, and generation time.
 */
export const getUserReports = async (
  userId: string,
): Promise<ReportListItem[]> => {
  const reports = await prisma.report.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      generatedAt: true,
      createdAt: true,
      updatedAt: true,
      pdfPath: true,
      csvPath: true,
    },
  });

  return reports.map((report) => ({
    id: report.id,
    title: report.title,
    description: report.description,
    status: report.status,
    generatedAt: report.generatedAt,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    hasPdf: Boolean(report.pdfPath),
    hasCsv: Boolean(report.csvPath),
  }));
};

/**
 * Returns one complete report, including its immutable JSON snapshot.
 *
 * Matching both reportId and userId prevents a user from accessing a
 * report belonging to someone else simply by knowing its ID.
 */
export const getReportById = async (
  reportId: string,
  userId: string,
) => {
  const report = await prisma.report.findFirst({
    where: {
      id: reportId,
      userId,
    },
    select: {
      id: true,
      userId: true,
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
    throw new ReportNotFoundError();
  }

  return {
    ...report,
    hasPdf: Boolean(report.pdfPath),
    hasCsv: Boolean(report.csvPath),
  };
};

/**
 * Returns only the values required for report-generation polling.
 */
export const getReportStatus = async (
  reportId: string,
  userId: string,
): Promise<ReportStatusResult> => {
  const report = await prisma.report.findFirst({
    where: {
      id: reportId,
      userId,
    },
    select: {
      id: true,
      status: true,
      generatedAt: true,
      error: true,
    },
  });

  if (!report) {
    throw new ReportNotFoundError();
  }

  return report;
};

/**
 * Deletes one report belonging to the specified user.
 *
 * We first verify ownership because Prisma's delete operation accepts a
 * unique identifier and should not be allowed to bypass user scoping.
 */
export const deleteReport = async (
  reportId: string,
  userId: string,
): Promise<void> => {
  const report = await prisma.report.findFirst({
    where: {
      id: reportId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!report) {
    throw new ReportNotFoundError();
  }

  await prisma.report.delete({
    where: {
      id: report.id,
    },
  });
};
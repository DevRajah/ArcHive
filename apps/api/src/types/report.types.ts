import type { ReportStatus } from "@prisma/client";

/**
 * Request accepted when a user generates a report.
 */
export interface GenerateReportRequest {
  userId: string;
  title: string;
  description?: string;
}

/**
 * Response returned immediately after a report is queued.
 */
export interface GenerateReportResponse {
  success: boolean;
  reportId: string;
  status: ReportStatus;
  message: string;
}

/**
 * Lightweight report information used on the report history page.
 *
 * reportData is deliberately excluded because the complete snapshot
 * could become large as Organization Intelligence grows.
 */
export interface ReportListItem {
  id: string;
  title: string;
  description: string | null;
  status: ReportStatus;
  generatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  hasPdf: boolean;
  hasCsv: boolean;
}

/**
 * Small status response used by frontend polling.
 *
 * The frontend should use this while a report is QUEUED or GENERATING
 * rather than repeatedly downloading the complete report snapshot.
 */
export interface ReportStatusResult {
  id: string;
  status: ReportStatus;
  generatedAt: Date | null;
  error: string | null;
}
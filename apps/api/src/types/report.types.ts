import type { ReportStatus } from "@prisma/client";

/**
 * Request accepted by POST /api/reports/generate.
 */
export interface GenerateReportRequest {
  userId: string;
  title: string;
  description?: string;
}

/**
 * Response returned after the report has been queued.
 */
export interface GenerateReportResponse {
  success: boolean;
  reportId: string;
  status: ReportStatus;
  message: string;
}
import { api } from "@/lib/api";

import type {
  DeleteReportResponse,
  ExecutiveReport,
  GenerateReportPayload,
  GenerateReportResponse,
  GetReportResponse,
  ReportsResponse,
  ReportStatusResponse,
} from "@/types/report.types";

class ReportService {
  /**
   * Fetch every Executive Report belonging to one user.
   *
   * Backend:
   * GET /api/users/:userId/reports
   *
   * The shared Axios client already includes /api in its base URL,
   * so service paths must not add another /api prefix.
   */
  async getReports(
    userId: string,
  ): Promise<ReportsResponse> {
    const { data } =
      await api.get<ReportsResponse>(
        `/users/${userId}/reports`,
      );

    return data;
  }

  /**
   * Queue a new Executive Report.
   *
   * Backend:
   * POST /api/reports/generate
   */
  async generateReport(
    payload: GenerateReportPayload,
  ): Promise<GenerateReportResponse> {
    const { data } =
      await api.post<GenerateReportResponse>(
        "/reports/generate",
        payload,
      );

    return data;
  }

  /**
   * Fetch one completed or in-progress report.
   *
   * The backend stores analytics inside reportData, while the
   * existing frontend drawer reads snapshot. We normalize that
   * here so the UI does not need duplicate backend-specific logic.
   */
  async getReport(
    userId: string,
    reportId: string,
  ): Promise<ExecutiveReport> {
    const { data } =
      await api.get<GetReportResponse>(
        `/users/${userId}/reports/${reportId}`,
      );

    return {
      ...data.report,
      snapshot:
        data.report.reportData ?? null,
      failureReason:
        data.report.error ?? null,
    };
  }

  /**
   * Fetch only the current generation state of one report.
   */
  async getReportStatus(
    userId: string,
    reportId: string,
  ): Promise<ReportStatusResponse> {
    const { data } =
      await api.get<ReportStatusResponse>(
        `/users/${userId}/reports/${reportId}/status`,
      );

    return data;
  }

  /**
   * Delete a report and its generated files.
   */
  async deleteReport(
    userId: string,
    reportId: string,
  ): Promise<DeleteReportResponse> {
    const { data } =
      await api.delete<DeleteReportResponse>(
        `/users/${userId}/reports/${reportId}`,
      );

    return data;
  }

  /**
   * Download a completed report as PDF.
   */
  async downloadPdf(
    userId: string,
    reportId: string,
  ): Promise<Blob> {
    const { data } = await api.get<Blob>(
      `/users/${userId}/reports/${reportId}/download/pdf`,
      {
        responseType: "blob",
      },
    );

    return data;
  }

  /**
   * Download a completed report as CSV.
   */
  async downloadCsv(
    userId: string,
    reportId: string,
  ): Promise<Blob> {
    const { data } = await api.get<Blob>(
      `/users/${userId}/reports/${reportId}/download/csv`,
      {
        responseType: "blob",
      },
    );

    return data;
  }
}

export const reportService =
  new ReportService();
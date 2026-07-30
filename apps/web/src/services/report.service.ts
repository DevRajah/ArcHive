import { api } from "@/lib/api";

import type {
  ExecutiveReport,
  GenerateReportResponse,
  ReportsResponse,
} from "@/types/report.types";

class ReportService {
  async getReports(): Promise<ReportsResponse> {
    const { data } =
      await api.get<ReportsResponse>(
        "/reports",
      );

    return data;
  }

  async generateReport(): Promise<GenerateReportResponse> {
    const { data } =
      await api.post<GenerateReportResponse>(
        "/reports/generate",
      );

    return data;
  }

  async getReport(
    reportId: string,
  ): Promise<ExecutiveReport> {
    const { data } =
      await api.get<ExecutiveReport>(
        `/reports/${reportId}`,
      );

    return data;
  }

  async downloadPdf(
    reportId: string,
  ) {
    return api.get(
      `/reports/${reportId}/pdf`,
      {
        responseType: "blob",
      },
    );
  }

  async downloadCsv(
    reportId: string,
  ) {
    return api.get(
      `/reports/${reportId}/csv`,
      {
        responseType: "blob",
      },
    );
  }
}

export const reportService =
  new ReportService();
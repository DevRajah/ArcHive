export type ReportStatus =
  | "GENERATING"
  | "READY"
  | "FAILED";

export interface ExecutiveReport {
  id: string;
  title: string;
  generatedAt: string;
  generatedBy: string;
  status: ReportStatus;

  summary: {
    repositories: number;
    engineeringScore: number;
    architectureScore: number;
    productionReadiness: number;
    riskScore: number;
  };
}

export interface GenerateReportResponse {
  report: ExecutiveReport;
}

export interface ReportsResponse {
  reports: ExecutiveReport[];
}
export type ReportStatus =
  | "QUEUED"
  | "GENERATING"
  | "COMPLETED"
  | "FAILED";

export interface ExecutiveReport {
  id: string;
  userId: string;

  title: string;
  description: string | null;

  status: ReportStatus;

  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportsResponse {
  reports: ExecutiveReport[];
}

export interface GenerateReportPayload {
  userId: string;
  title: string;
  description?: string;
}

export interface GenerateReportResponse {
  report: ExecutiveReport;
}
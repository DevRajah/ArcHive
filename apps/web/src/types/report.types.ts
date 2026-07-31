export type ReportStatus =
  | "QUEUED"
  | "GENERATING"
  | "COMPLETED"
  | "FAILED";

export interface ReportKpis {
  repositories: number;
  averageArchitectureScore: number;
  engineeringEvents: number;
  recommendations: number;
  technologies: number;
  highRiskRepositories: number;
}

export interface ReportRiskBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
  unknown: number;
  totalRisks: number;
}

export interface ReportTechnology {
  name: string;
  count: number;
}

export interface ReportTechnologyAnalysis {
  dominantTechnology: string | null;
  totalTechnologies: number;
  topTechnologies: ReportTechnology[];
}

export type EngineeringTrendDirection =
  | "UP"
  | "DOWN"
  | "STABLE"
  | "UNKNOWN";

export interface ReportEngineeringTrend {
  direction: EngineeringTrendDirection;
  latestValue: number;
  previousValue: number;
  percentageChange: number;
}

export interface ReportRepositoryHighlight {
  repositoryId: string;
  repositoryName: string;
  summary?: string | null;
  score?: number | null;
  riskLevel?: string | null;
}

export interface ReportRepositoryHighlights {
  strongestRepositories: ReportRepositoryHighlight[];
  repositoriesRequiringAttention: ReportRepositoryHighlight[];
}

/*
 * The backend currently describes these nested snapshot sections
 * as unknown. These frontend shapes represent the contract used by
 * the report drawer. They may need small adjustments after inspecting
 * the first completed report payload.
 */
export interface ExecutiveReportSnapshot {
  schemaVersion?: number;
  reportId?: string;
  title?: string;
  description?: string | null;
  generatedAt?: string;

  executiveSummary: string[];
  kpis: ReportKpis;
  riskBreakdown: ReportRiskBreakdown;
  technologyAnalysis: ReportTechnologyAnalysis;
  engineeringTrend: ReportEngineeringTrend;
  repositoryHighlights: ReportRepositoryHighlights;

  organization?: Record<string, unknown>;
}

export interface ExecutiveReport {
  id: string;
  userId?: string;

  title: string;
  description: string | null;
  status: ReportStatus;

  /*
   * List responses do not contain reportData.
   * The full report endpoint does.
   */
  reportData?: ExecutiveReportSnapshot | null;

  /*
   * Normalized alias used by the existing details drawer.
   */
  snapshot?: ExecutiveReportSnapshot | null;

  pdfPath?: string | null;
  csvPath?: string | null;

  error?: string | null;
  failureReason?: string | null;

  generatedAt: string | null;
  createdAt: string;
  updatedAt: string;

  hasPdf: boolean;
  hasCsv: boolean;
}

export interface ReportsResponse {
  success: true;
  count: number;
  reports: ExecutiveReport[];
}

export interface GetReportResponse {
  success: true;
  report: ExecutiveReport;
}

export interface GenerateReportPayload {
  userId: string;
  title: string;
  description?: string;
}

export interface GenerateReportResponse {
  success: true;
  reportId: string;
  status: ReportStatus;
  message: string;
}

export interface DeleteReportResponse {
  success: true;
  reportId: string;
  message: string;
}

export interface ReportStatusResponse {
  success: true;
  report: {
    id: string;
    status: ReportStatus;
    generatedAt: string | null;
    error: string | null;
  };
}
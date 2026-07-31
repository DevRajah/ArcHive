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

export interface ExecutiveReportSnapshot {
  executiveSummary: string[];
  kpis: ReportKpis;
  riskBreakdown: ReportRiskBreakdown;
  technologyAnalysis: ReportTechnologyAnalysis;
  engineeringTrend: ReportEngineeringTrend;
  repositoryHighlights: ReportRepositoryHighlights;
}

export interface ExecutiveReport {
  id: string;
  userId: string;

  title: string;
  description: string | null;

  status: ReportStatus;

  generatedAt: string | null;
  createdAt: string;
  updatedAt: string;

  snapshot?: ExecutiveReportSnapshot | null;
  failureReason?: string | null;
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
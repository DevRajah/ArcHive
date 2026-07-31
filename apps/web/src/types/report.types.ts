export type ReportStatus =
  | "QUEUED"
  | "GENERATING"
  | "COMPLETED"
  | "FAILED";

export type ReportSchemaVersion = 1 | 2;

export type ReportRiskSeverity =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW";

export type ReportTrendDirection =
  | "IMPROVING"
  | "DECLINING"
  | "STABLE"
  | "UNKNOWN";

export interface ExecutiveSummary {
  headline: string;
  overallHealth: string;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
}

export interface ExecutiveKpis {
  repositories: number;
  averageArchitectureScore: number;
  highRiskRepositories: number;
  recommendations: number;
  technologies: number;
  engineeringEvents: number;
}

export interface RiskBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
  unknown: number;
  total: number;
  highestSeverity: ReportRiskSeverity | null;
}

export interface TechnologyInsight {
  name: string;
  usageCount: number;
  category: string | null;
  percentage: number | null;
}

export interface TechnologyAnalysis {
  totalTechnologies: number;
  topTechnologies: TechnologyInsight[];
  dominantTechnology: string | null;
  categories: Record<string, number>;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface EngineeringTrendAnalysis {
  direction: ReportTrendDirection;
  percentageChange: number | null;
  latestValue: number | null;
  previousValue: number | null;
  points: TrendPoint[];
}

export interface RepositoryHighlight {
  repositoryId: string | null;
  name: string;
  score: number;
  riskLevel: string | null;
}

export interface RepositoryHighlights {
  strongest: RepositoryHighlight[];
  needsAttention: RepositoryHighlight[];
}

export interface OrganizationDashboardSnapshot {
  overview: Record<string, unknown>;
  rankings: unknown[];
  technology: Record<string, unknown>;
  recommendations: unknown[];
  risks: Record<string, unknown>;
  activity: Record<string, unknown>;
  trends: Record<string, unknown>;
}

export interface ExecutiveReportSnapshotV2 {
  schemaVersion: 2;

  reportId: string;
  title: string;
  description: string | null;
  generatedAt: string;

  executiveSummary: ExecutiveSummary;
  executiveKpis: ExecutiveKpis;
  riskBreakdown: RiskBreakdown;
  technologyAnalysis: TechnologyAnalysis;
  trendAnalysis: EngineeringTrendAnalysis;
  repositoryHighlights: RepositoryHighlights;

  organization: OrganizationDashboardSnapshot;
}

/**
 * Older reports may only contain the raw organization snapshot.
 *
 * We keep this type so legacy reports remain visible without
 * pretending they contain Schema v2 executive analytics.
 */
export interface ExecutiveReportSnapshotV1 {
  schemaVersion: 1;

  reportId: string;
  title: string;
  description?: string | null;
  generatedAt: string;

  organization: OrganizationDashboardSnapshot;
}

export type ExecutiveReportSnapshot =
  | ExecutiveReportSnapshotV1
  | ExecutiveReportSnapshotV2;

export interface ReportListItem {
  id: string;
  title: string;
  description: string | null;
  status: ReportStatus;

  generatedAt: string | null;
  createdAt: string;
  updatedAt: string;

  hasPdf: boolean;
  hasCsv: boolean;
}

export interface ExecutiveReport
  extends ReportListItem {
  userId: string;

  reportData: ExecutiveReportSnapshot | null;

  pdfPath: string | null;
  csvPath: string | null;

  error: string | null;
}

export interface ListReportsResponse {
  success: true;
  count: number;
  reports: ReportListItem[];
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

/**
 * Single frontend model consumed by the report drawer.
 *
 * Both Schema v1 and Schema v2 reports are normalized into this
 * shape by report.service.ts.
 */
export interface NormalizedExecutiveReport
  extends ExecutiveReport {
  schemaVersion: ReportSchemaVersion | null;
  isLegacy: boolean;

  analytics: {
    executiveSummary: ExecutiveSummary;
    executiveKpis: ExecutiveKpis;
    riskBreakdown: RiskBreakdown;
    technologyAnalysis: TechnologyAnalysis;
    trendAnalysis: EngineeringTrendAnalysis;
    repositoryHighlights: RepositoryHighlights;
  } | null;
}
/**
 * Canonical Executive Report schema contract shared across ArcHive.
 *
 * Future me:
 * Report schema versions are deliberate compatibility boundaries.
 * Do not increment this value merely because the report implementation
 * changes internally.
 *
 * Introduce a new schema version only when the persisted report snapshot
 * contract changes in a way that consumers need to distinguish.
 */
export const CURRENT_REPORT_SCHEMA_VERSION =
  4 as const;

/**
 * Executive Report schema versions that this ArcHive codebase
 * deliberately understands.
 *
 * V1:
 * Historical organization snapshot before executive analytics.
 *
 * V2:
 * First executive analytics snapshot.
 *
 * V3:
 * Current shared USER / TEAM Executive Report snapshot with
 * explicit source metadata.
 */
export type ReportSchemaVersion =
  | 1
  | 2
  | 3
  | typeof CURRENT_REPORT_SCHEMA_VERSION;

export type ReportRiskSeverity =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW";
/**
 * Risk-assessment context persisted in Schema V4 reports.
 *
 * Important semantics:
 *
 * assessedRepositories:
 * Repositories for which ArcHive has a canonical risk assessment.
 *
 * unassessedRepositories:
 * Repositories where engineering analysis may exist, but there is not
 * enough canonical Advisor evidence to claim a risk level.
 *
 * assessmentCoveragePercentage:
 * Percentage of repositories with a canonical risk assessment.
 *
 * averageRiskScore:
 * Average across assessed repositories only.
 *
 * A null averageRiskScore means no trustworthy aggregate risk score is
 * available. It must never be converted to zero because zero represents
 * genuinely low measured risk.
 */
export interface RiskAssessmentContext {
  totalRepositories: number;

  assessedRepositories: number;
  unassessedRepositories: number;

  assessmentCoveragePercentage: number;

  averageRiskScore: number | null;

  overallRiskLevel:
  | ReportRiskSeverity
  | null;
}

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

/**
 * Common executive analytics included by supported Executive Report
 * snapshots.
 *
 * Keeping this contract source-agnostic allows USER and TEAM reports
 * to share the same analytics structures while preserving their own
 * dashboard snapshot types.
 */
export interface ExecutiveReportAnalytics {
  executiveSummary: ExecutiveSummary;
  executiveKpis: ExecutiveKpis;
  riskBreakdown: RiskBreakdown;
  technologyAnalysis: TechnologyAnalysis;
  trendAnalysis: EngineeringTrendAnalysis;
  repositoryHighlights: RepositoryHighlights;
}

/**
 * Source metadata persisted inside Schema V3 Executive Reports.
 *
 * Future me:
 * This is intentionally different from ReportSource, which represents
 * the input used when requesting report generation.
 *
 * The worker resolves that input into this immutable metadata shape
 * before storing the report snapshot.
 */
export type ExecutiveReportSourceMetadata =
  | {
    sourceType: "USER";
    sourceId: string;
    userId: string;
    teamId: null;
  }
  | {
    sourceType: "TEAM";
    sourceId: string;
    userId: null;
    teamId: string;
  };

/**
 * Shared fields emitted by the current V3 report worker.
 *
 * TSource describes who the report belongs to.
 * TOrganization describes the immutable dashboard snapshot stored
 * with the report.
 */
export interface ExecutiveReportSnapshotV3<
  TOrganization,
> extends ExecutiveReportAnalytics {
  schemaVersion:
  typeof CURRENT_REPORT_SCHEMA_VERSION;

  reportId: string;
  title: string;
  description: string | null;
  generatedAt: string;

  source: ExecutiveReportSourceMetadata;

  organization: TOrganization;
}

/**
 * Schema V4 extends the shared Executive Report contract with explicit
 * risk-assessment context.
 *
 * Future me:
 * Engineering analysis coverage and risk-assessment coverage are not
 * equivalent.
 *
 * A repository may have engineering intelligence while still lacking
 * sufficient canonical Advisor evidence for a trustworthy risk
 * assessment.
 *
 * V4 persists that distinction so the frontend, PDF and CSV can all
 * represent unavailable risk honestly instead of treating it as zero.
 */
export interface ExecutiveReportSnapshotV4<
  TOrganization,
> extends ExecutiveReportAnalytics {
  schemaVersion:
    typeof CURRENT_REPORT_SCHEMA_VERSION;

  reportId: string;
  title: string;
  description: string | null;
  generatedAt: string;

  source: ExecutiveReportSourceMetadata;

  riskAssessment: RiskAssessmentContext;

  organization: TOrganization;
}
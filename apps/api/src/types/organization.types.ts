/**
 * Shared response contracts for ArcHive's
 * organization-level engineering intelligence.
 */

export type OrganizationRiskLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type RepositoryHealthStatus =
  | "HEALTHY"
  | "WARNING"
  | "CRITICAL"
  | "UNKNOWN";

export type TrendDirection =
  | "IMPROVING"
  | "DECLINING"
  | "STABLE"
  | "UNKNOWN";

/**
 * Score summary for one tracked repository.
 */
export interface OrganizationRepositoryScore {
  repositoryId: string;

  repositoryName: string;

  repositoryFullName: string;

  language: string | null;

  analysisStatus: "COMPLETED" | "PENDING";

  architectureScore: number | null;

  engineeringQualityScore: number | null;

  productionReadinessScore: number | null;

  maturityScore: number | null;

  confidenceScore: number | null;

  riskScore: number | null;

  overallScore: number | null;

  recommendationCount: number;

  architectureChangeCount: number;

  engineeringEventCount: number;
}

/**
 * High-level organization statistics.
 */
export interface OrganizationOverview {
  totalRepositories: number;

  analyzedRepositories: number;

  unanalyzedRepositories: number;

  healthyRepositories: number;

  warningRepositories: number;

  criticalRepositories: number;

  unassessedRiskRepositories: number;

  decliningRepositories: number;

  improvingRepositories: number;

  stableRepositories: number;

  averageArchitectureScore: number | null;

  averageEngineeringQualityScore: number | null;

  averageProductionReadinessScore: number | null;

  averageMaturityScore: number | null;

  averageRiskScore: number | null;

  overallRiskLevel:
  OrganizationRiskLevel | null;

  analysisCoveragePercentage: number;

  riskAssessmentCoveragePercentage: number;
}

/**
 * A technology detected in one or more repositories.
 */
export interface OrganizationTechnologyItem {
  technology: string;

  repositoryCount: number;

  repositories: string[];
}

/**
 * Technology inventory across the user's tracked repositories.
 */
export interface OrganizationTechnologyInventory {
  totalTechnologies: number;

  technologies: OrganizationTechnologyItem[];
}

/**
 * An organization-level recommendation.
 *
 * Recommendations may come from stored engineering recommendations
 * or the latest Architecture Advisor snapshot.
 */
export interface OrganizationRecommendation {
  repositoryId: string;

  repositoryName: string;

  recommendationKey: string;

  title: string;

  description: string;

  evidence: string | null;

  createdAt: Date;
}

/**
 * Risk information for one repository.
 */
export interface OrganizationRepositoryRisk {
  repositoryId: string;

  repositoryName: string;

  repositoryFullName: string;

  overallRiskScore: number;

  overallAssessment: string;

  maturityLabel: string;

  riskLevel: OrganizationRiskLevel;

  generatedAt: Date;
}

/**
 * Risk distribution across repositories that have
 * an Architecture Advisor snapshot.
 */
export interface OrganizationRiskSummary {
  totalRepositories: number;

  criticalRepositories: number;

  highRiskRepositories: number;

  mediumRiskRepositories: number;

  lowRiskRepositories: number;

  repositories: OrganizationRepositoryRisk[];
}

export type OrganizationActivityType =
  | "ENGINEERING_EVENT"
  | "ARCHITECTURE_CHANGE"
  | "INTELLIGENCE_SNAPSHOT"
  | "ADVISOR_SNAPSHOT"
  | "TIMELINE_ENTRY"
  | "RECOMMENDATION";

/**
 * A normalized item shown in the organization activity feed.
 */
export interface OrganizationActivityItem {
  id: string;

  repositoryId: string;

  repositoryName: string;

  repositoryFullName: string;

  type: OrganizationActivityType;

  title: string;

  description: string;

  timestamp: Date;

  metadata: Record<string, unknown>;
}

/**
 * Paginated organization activity response.
 */
export interface OrganizationActivityFeed {
  items: OrganizationActivityItem[];

  pagination: {
    page: number;

    limit: number;

    totalItems: number;

    totalPages: number;

    hasNextPage: boolean;

    hasPreviousPage: boolean;
  };
}

/**
 * One time period in the organization trend chart.
 */
export interface OrganizationTrendPoint {
  period: string;

  periodStart: Date;

  periodEnd: Date;

  repositoryCount: number;

  averageArchitectureScore: number | null;

  averageEngineeringQualityScore: number | null;

  averageProductionReadinessScore: number | null;

  averageMaturityScore: number | null;

  averageRiskScore: number | null;
}

/**
 * Score movements across a selected date range.
 */
export interface OrganizationTrends {
  interval: "DAY" | "WEEK" | "MONTH";

  from: Date;

  to: Date;

  direction: TrendDirection;

  architectureScoreChange: number | null;

  engineeringQualityScoreChange: number | null;

  productionReadinessScoreChange: number | null;

  maturityScoreChange: number | null;

  riskScoreChange: number | null;

  points: OrganizationTrendPoint[];
}

/**
 * Combined response used by the main Organization Dashboard.
 */
export interface OrganizationDashboard {
  overview: OrganizationOverview;

  rankings: OrganizationRepositoryScore[];

  technology: OrganizationTechnologyInventory;

  recommendations: OrganizationRecommendation[];

  risks: OrganizationRiskSummary;

  activity: OrganizationActivityFeed;

  trends: OrganizationTrends;
}

/**
 * Options accepted by organization intelligence services.
 */
export interface OrganizationQueryOptions {
  userId: string;

  rankingLimit?: number;

  activityPage?: number;

  activityLimit?: number;

  trendInterval?: "DAY" | "WEEK" | "MONTH";

  trendFrom?: Date;

  trendTo?: Date;
}

/**
 * Standard successful API wrapper for routes that need it.
 */
export interface OrganizationApiResponse<T> {
  success: true;

  message: string;

  data: T;
}
export type OrganizationRiskLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type OrganizationTrendDirection =
  | "IMPROVING"
  | "DECLINING"
  | "STABLE"
  | "INSUFFICIENT_DATA";

export type OrganizationTrendInterval =
  | "WEEK"
  | "MONTH"
  | "QUARTER";

export type OrganizationActivityType =
  | "ENGINEERING_EVENT"
  | "TIMELINE_ENTRY"
  | "ARCHITECTURE_CHANGE";

export interface OrganizationIntelligenceQuery {
  page?: number;
  limit?: number;
  interval?: OrganizationTrendInterval;
}

export interface OrganizationOverview {
  totalRepositories: number;
  analyzedRepositories: number;
  unanalyzedRepositories: number;

  healthyRepositories: number;
  warningRepositories: number;
  criticalRepositories: number;

  decliningRepositories: number;
  improvingRepositories: number;
  stableRepositories: number;

  averageArchitectureScore: number | null;
  averageEngineeringQualityScore: number | null;
  averageProductionReadinessScore: number | null;
  averageMaturityScore: number | null;
  averageRiskScore: number | null;

  overallRiskLevel: OrganizationRiskLevel;

  analysisCoveragePercentage: number;
}

export interface OrganizationRepositoryRanking {
  repositoryId: string;
  repositoryName: string;
  repositoryFullName: string;
  language: string | null;

  architectureScore: number;
  engineeringQualityScore: number;
  productionReadinessScore: number;
  maturityScore: number;
  confidenceScore: number;
  riskScore: number;

  overallScore: number;

  recommendationCount: number;
  architectureChangeCount: number;
  engineeringEventCount: number;
}

export interface OrganizationTechnologyUsage {
  technology: string;
  repositoryCount: number;
  repositories: string[];
}

export interface OrganizationTechnologyInventory {
  totalTechnologies: number;
  technologies: OrganizationTechnologyUsage[];
}

export interface OrganizationRecommendation {
  repositoryId: string;
  repositoryName: string;

  recommendationKey: string;

  title: string;
  description: string;

  evidence: string | null;

  createdAt: string;
}

export interface OrganizationRepositoryRisk {
  repositoryId: string;
  repositoryName: string;
  repositoryFullName: string;

  overallRiskScore: number;
  overallAssessment: string;

  maturityLabel: string;
  riskLevel: OrganizationRiskLevel;

  generatedAt: string;
}

export interface OrganizationRiskSummary {
  totalRepositories: number;

  criticalRepositories: number;
  highRiskRepositories: number;
  mediumRiskRepositories: number;
  lowRiskRepositories: number;

  repositories: OrganizationRepositoryRisk[];
}

export interface OrganizationActivityItem {
  id: string;

  repositoryId: string;
  repositoryName: string;
  repositoryFullName: string;

  type: OrganizationActivityType;

  title: string;
  description: string;

  timestamp: string;

  metadata: Record<string, unknown>;
}

export interface OrganizationActivityPagination {
  page: number;
  limit: number;

  totalItems: number;
  totalPages: number;

  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface OrganizationActivityResponse {
  items: OrganizationActivityItem[];
  pagination: OrganizationActivityPagination;
}

export interface OrganizationTrendPoint {
  period: string;

  periodStart: string;
  periodEnd: string;

  repositoryCount: number;

  averageArchitectureScore: number | null;
  averageEngineeringQualityScore: number | null;
  averageProductionReadinessScore: number | null;
  averageMaturityScore: number | null;
  averageRiskScore: number | null;
}

export interface OrganizationTrends {
  interval: OrganizationTrendInterval;

  from: string;
  to: string;

  direction: OrganizationTrendDirection;

  architectureScoreChange: number | null;
  engineeringQualityScoreChange: number | null;
  productionReadinessScoreChange: number | null;
  maturityScoreChange: number | null;
  riskScoreChange: number | null;

  points: OrganizationTrendPoint[];
}

export interface OrganizationIntelligenceResponse {
  overview: OrganizationOverview;
  rankings: OrganizationRepositoryRanking[];
  technology: OrganizationTechnologyInventory;
  recommendations: OrganizationRecommendation[];
  risks: OrganizationRiskSummary;
  activity: OrganizationActivityResponse;
  trends: OrganizationTrends;
}

export interface ReprocessRepositoryResult {
  repositoryId: string;
  name: string;
  fullName: string;

  status: "SUCCESS" | "FAILED";

  durationMs: number;

  error?: string;
}

export interface ReprocessAllRepositoriesResponse {
  success: boolean;
  message: string;

  data: {
    totalRepositories: number;
    successful: number;
    failed: number;
    durationMs: number;
    results: ReprocessRepositoryResult[];
  };
}
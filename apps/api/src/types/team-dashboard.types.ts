export type TeamRepositoryAnalysisStatus =
  | "COMPLETED"
  | "PENDING";

export type TeamRiskLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface TeamRepositoryRanking {
  repositoryId: string;
  repositoryName: string;
  repositoryFullName: string;
  language: string | null;

  analysisStatus: TeamRepositoryAnalysisStatus;

  architectureScore: number | null;
  engineeringQualityScore: number | null;
  productionReadinessScore: number | null;
  capabilityScore: number | null;
  maturityScore: number | null;
  confidenceScore: number | null;

  riskScore: number | null;
  overallScore: number | null;

  recommendationCount: number;
  architectureChangeCount: number;
  engineeringEventCount: number;
}

export interface TeamTechnologyItem {
  technology: string;
  repositoryCount: number;
  repositories: Array<{
    repositoryId: string;
    repositoryName: string;
    repositoryFullName: string;
  }>;
}

export interface TeamTechnologyInventory {
  totalTechnologies: number;
  technologies: TeamTechnologyItem[];
}

export interface TeamRepositoryRisk {
  repositoryId: string;
  repositoryName: string;
  repositoryFullName: string;

  overallRiskScore: number;
  overallAssessment: string;
  maturityLabel: string;
  riskLevel: TeamRiskLevel;
  generatedAt: Date;
}

export interface TeamRiskSummary {
  totalRepositories: number;
  criticalRepositories: number;
  highRiskRepositories: number;
  mediumRiskRepositories: number;
  lowRiskRepositories: number;
  repositories: TeamRepositoryRisk[];
}

export interface TeamRecommendation {
  id: string;
  repositoryId: string;
  repositoryName: string;
  repositoryFullName: string;

  recommendationKey: string;
  title: string;
  description: string;
  status: string;
  evidence: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface TeamDashboard {
  team: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };

  members: {
    total: number;
    owners: number;
    admins: number;
    members: number;
    viewers: number;
  };

  repositories: {
    total: number;
    tracked: number;
    untracked: number;
  };

  engineering: {
    averageArchitecture: number;
    averageEngineeringQuality: number;
    averageProductionReadiness: number;
    averageCapability: number;
    averageMaturity: number;
    averageConfidence: number;
    repositoryCoverage: number;
    lastAnalysisAt: Date | null;
  };

  rankings: TeamRepositoryRanking[];

  technology: TeamTechnologyInventory;

  risks: TeamRiskSummary;

  recommendations: TeamRecommendation[];
}
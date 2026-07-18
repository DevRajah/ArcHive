export type TechnologyIntelligenceRepository = {
  id: string;
  name: string;
  fullName: string;
  language: string | null;
  isTracked: boolean;
  updatedAt: Date;

  firstDetectedAt: Date | null;
  lastDetectedAt: Date | null;

  architectureDomains: string[];
  repositoryTypes: string[];
  capabilities: string[];

  matchingArchitectureChanges: number;
  matchingRecommendations: number;
};

export type TechnologySummary = {
  technology: string;
  repositoryCount: number;
  trackedRepositoryCount: number;
  architectureDomainCount: number;
  capabilityCount: number;
  recommendationCount: number;
  firstDetectedAt: Date | null;
  lastDetectedAt: Date | null;
};

export type TechnologyAdoptionPoint = {
  period: string;
  newlyAdoptedRepositories: number;
  cumulativeRepositories: number;
};

export type TechnologyIntelligenceOverview = {
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };

  summary: {
    totalTechnologies: number;
    totalRepositoryTechnologyLinks: number;
    mostAdoptedTechnology: TechnologySummary | null;
    newestTechnology: TechnologySummary | null;
    technologiesWithRecommendations: number;
  };

  technologies: TechnologySummary[];
};

export type TechnologyIntelligenceDetail = {
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };

  technology: {
    name: string;
    repositoryCount: number;
    trackedRepositoryCount: number;
    architectureDomainCount: number;
    repositoryTypeCount: number;
    capabilityCount: number;
    recommendationCount: number;
    firstDetectedAt: Date | null;
    lastDetectedAt: Date | null;
  };

  repositories: TechnologyIntelligenceRepository[];

  architectureDomains: Array<{
    name: string;
    count: number;
  }>;

  repositoryTypes: Array<{
    name: string;
    count: number;
  }>;

  capabilities: Array<{
    name: string;
    count: number;
  }>;

  recommendations: Array<{
    id: string;
    repositoryId: string;
    repositoryName: string;
    repositoryFullName: string;
    title: string;
    description: string;
    status: string;
    evidence: string | null;
    createdAt: Date;
    resolvedAt: Date | null;
  }>;

  detectionHistory: Array<{
    id: string;
    repositoryId: string;
    repositoryName: string;
    repositoryFullName: string;
    architectureDomain: string | null;
    summary: string;
    fileAffected: string | null;
    detectedAt: Date;
  }>;

  adoptionTimeline: TechnologyAdoptionPoint[];

  relatedTechnologies: Array<{
    name: string;
    sharedRepositoryCount: number;
  }>;
};
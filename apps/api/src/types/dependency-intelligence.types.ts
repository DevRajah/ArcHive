export type DependencyRiskLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type TechnologyDependencyNode = {
  technology: string;

  repositoryCount: number;
  trackedRepositoryCount: number;

  connectedTechnologyCount: number;

  dependentTechnologies: string[];
  dependedOnBy: string[];

  architectureDomains: string[];
  repositoryTypes: string[];
  capabilities: string[];

  centralityScore: number;
  impactScore: number;
  riskLevel: DependencyRiskLevel;
};

export type TechnologyRelationship = {
  source: string;
  target: string;

  sharedRepositories: number;

  sourceRepositoryCoverage: number;
  targetRepositoryCoverage: number;

  strength: number;

  sharedRepositoryIds: string[];
  sharedRepositoryNames: string[];

  relationshipType: "TECHNOLOGY_CO_OCCURRENCE";

  evidenceSummary: string;
};

export type DependencyOverview = {
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };

  summary: {
    totalRepositories: number;
    trackedRepositories: number;

    totalTechnologies: number;
    totalRelationships: number;

    mostCentralTechnology: TechnologyDependencyNode | null;
    highestImpactTechnology: TechnologyDependencyNode | null;

    strongestRelationship: TechnologyRelationship | null;

    criticalTechnologies: number;
    highRiskTechnologies: number;
  };

  technologies: TechnologyDependencyNode[];

  relationships: TechnologyRelationship[];
};

export type TechnologyDependencyDetail = {
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };

  technology: TechnologyDependencyNode;

  repositories: Array<{
    id: string;
    name: string;
    fullName: string;
    language: string | null;
    isTracked: boolean;

    architectureDomains: string[];
    repositoryTypes: string[];
    capabilities: string[];
    technologies: string[];

    relationshipCount: number;
    updatedAt: Date;
  }>;

  relationships: TechnologyRelationship[];

  relatedTechnologies: Array<{
    technology: string;
    sharedRepositories: number;
    strength: number;
    sharedRepositoryNames: string[];
  }>;

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
};

export type TechnologyImpactReport = {
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };

  technology: string;

  summary: {
    affectedRepositoryCount: number;
    trackedRepositoryCount: number;
    relatedTechnologyCount: number;
    architectureDomainCount: number;
    repositoryTypeCount: number;
    capabilityCount: number;

    impactScore: number;
    riskLevel: DependencyRiskLevel;
  };

  affectedRepositories: Array<{
    id: string;
    name: string;
    fullName: string;
    language: string | null;
    isTracked: boolean;

    architectureDomains: string[];
    repositoryTypes: string[];
    capabilities: string[];

    relatedTechnologies: string[];

    impactContributionScore: number;
  }>;

  relatedTechnologies: Array<{
    technology: string;
    sharedRepositories: number;
    strength: number;
  }>;

  architectureDomains: string[];
  repositoryTypes: string[];
  capabilities: string[];

  warnings: string[];

  explanation: {
    headline: string;
    description: string;
  };
};
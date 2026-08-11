export type DependencyImpactLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type TechnologyDependencyNode = {
  technology: string;

  repositoryCount: number;
  trackedRepositoryCount: number;

  connectedTechnologyCount: number;

  /**
   * Technologies observed alongside this technology across one or more
   * repositories.
   *
   * Future me:
   * This graph is currently based on repository-level co-occurrence.
   * It does NOT prove package import direction or runtime dependency
   * direction, so do not rename this to `dependsOn` until ArcHive has
   * directional evidence.
   */
  connectedTechnologies: string[];

  architectureDomains: string[];
  repositoryTypes: string[];
  capabilities: string[];

  /**
   * Centrality describes how embedded the technology is across the
   * portfolio.
   */
  centralityScore: number;

  /**
   * Impact describes the potential portfolio-wide change radius of the
   * technology.
   *
   * High impact is not automatically high engineering risk.
   */
  impactScore: number;

  impactLevel: DependencyImpactLevel;
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

  /**
   * Relationships are currently undirected portfolio-level co-occurrence.
   */
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

    mostCentralTechnology:
      TechnologyDependencyNode | null;

    highestImpactTechnology:
      TechnologyDependencyNode | null;

    strongestRelationship:
      TechnologyRelationship | null;

    /**
     * These describe portfolio impact tiers, not vulnerability or
     * operational risk.
     */
    criticalImpactTechnologies: number;
    highImpactTechnologies: number;
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
    impactLevel: DependencyImpactLevel;
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
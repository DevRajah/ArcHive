export type DependencyRiskLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface DependencyUser {
  id: string;
  username: string | null;
  avatarUrl: string | null;
}

export interface TechnologyRelationship {
  source: string;
  target: string;
  sharedRepositories: number;
  sourceRepositoryCoverage: number;
  targetRepositoryCoverage: number;
  strength: number;
  sharedRepositoryIds: string[];
  sharedRepositoryNames: string[];
  relationshipType: string;
  evidenceSummary: string | null;
}

export interface TechnologyDependencyNode {
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
}

export interface DependencyOverviewSummary {
  totalRepositories: number;
  trackedRepositories: number;
  totalTechnologies: number;
  totalRelationships: number;

  mostCentralTechnology: TechnologyDependencyNode | null;
  highestImpactTechnology: TechnologyDependencyNode | null;
  strongestRelationship: TechnologyRelationship | null;

  criticalTechnologies: number;
  highRiskTechnologies: number;
}

export interface DependencyOverview {
  user: DependencyUser;
  summary: DependencyOverviewSummary;
  technologies: TechnologyDependencyNode[];
  relationships: TechnologyRelationship[];
}

export interface NamedDependencyCount {
  name: string;
  count: number;
}

export interface TechnologyDependencyRepository {
  id: string;
  name: string;
  fullName: string | null;
  language: string | null;
  isTracked: boolean;

  relationshipCount: number;
  lastUpdatedAt: string | null;
  updatedAt?: string | null;

  technologies: string[];
  architectureDomains: string[];
  repositoryTypes: string[];
  capabilities: string[];
}

export interface RelatedDependencyTechnology {
  technology: string;
  sharedRepositories: number;
  strength: number;
  sharedRepositoryNames: string[];
}

export interface TechnologyDependencyDetail {
  user: DependencyUser;
  technology: TechnologyDependencyNode;
  repositories: TechnologyDependencyRepository[];
  relationships: TechnologyRelationship[];
  relatedTechnologies: RelatedDependencyTechnology[];
  architectureDomains: NamedDependencyCount[];
  repositoryTypes: NamedDependencyCount[];
  capabilities: NamedDependencyCount[];
}

export interface TechnologyImpactSummary {
  affectedRepositoryCount: number;
  trackedRepositoryCount: number;
  relatedTechnologyCount: number;
  architectureDomainCount: number;
  repositoryTypeCount: number;
  capabilityCount: number;
  impactScore: number;
  riskLevel: DependencyRiskLevel;
}

export interface AffectedRepository {
  id: string;
  name: string;
  fullName: string | null;
  language: string | null;
  isTracked: boolean;

  impactContributionScore: number;

  relatedTechnologies: string[];
  architectureDomains: string[];
  repositoryTypes: string[];
  capabilities: string[];
}

export interface TechnologyImpactExplanation {
  headline: string;
  description: string;
}

export interface TechnologyImpactReport {
  user: DependencyUser;
  technology: string;
  summary: TechnologyImpactSummary;

  affectedRepositories: AffectedRepository[];
  relatedTechnologies: RelatedDependencyTechnology[];

  /*
   * The real Impact API returns these as unique string collections,
   * unlike the dependency detail endpoint, which returns ranked counts.
   */
  architectureDomains: string[];
  repositoryTypes: string[];
  capabilities: string[];

  warnings: string[];
  explanation: TechnologyImpactExplanation;
}

export type DependencyOverviewSort =
  | "CENTRALITY"
  | "IMPACT"
  | "REPOSITORIES"
  | "CONNECTIONS"
  | "RISK"
  | "ALPHABETICAL";
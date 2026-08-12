export type RepositorySimilarityLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export interface RepositoryCanonicalIntelligence {
  repositoryTypes: string[];
  domains: string[];
  technologies: string[];
  capabilities: string[];
  generatedAt?: string;
}

export interface RelatedRepositorySharedSignals {
  repositoryTypes: string[];
  domains: string[];
  technologies: string[];
  capabilities: string[];
}

export interface RelatedRepositoryScoreBreakdown {
  repositoryTypeScore: number;
  domainScore: number;
  capabilityScore: number;
  technologyScore: number;
}

export interface RelatedRepositoryOverlap {
  domains: number;
  capabilities: number;
  technologies: number;
}

export interface RelatedRepositoryItem {
  repository: {
    id: string;
    name: string;
    fullName: string;
    language?: string | null;
  };

  similarity: {
    similarityScore: number;
    similarityLevel: RepositorySimilarityLevel;
    reason?: string | null;

    sharedSignals: RelatedRepositorySharedSignals;

    scoreBreakdown?: RelatedRepositoryScoreBreakdown;

    overlap?: RelatedRepositoryOverlap;
  };

  /**
   * Canonical intelligence snapshot for the candidate repository.
   * The backend owns this data and the frontend must not reconstruct it.
   */
  intelligence?: RepositoryCanonicalIntelligence;
}

export interface RepositoryRelatedResponse {
  repository?: {
    id: string;
    name: string;
    fullName: string;
  };

  /**
   * Canonical intelligence for the repository we are finding
   * related repositories for.
   */
  sourceIntelligence?: RepositoryCanonicalIntelligence;

  relatedRepositories: RelatedRepositoryItem[];
}
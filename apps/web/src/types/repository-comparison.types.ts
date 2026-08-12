export type RepositorySimilarityLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export interface ComparisonRepository {
  id: string;
  name: string;
  fullName?: string | null;
  language?: string | null;
}

export interface RepositoryComparisonSummary {
  id: string;
  name: string;
  fullName?: string | null;

  primaryRepositoryType?: string | null;
  persona?: string | null;

  healthScore?: number | null;
  healthStatus?: string | null;

  maturityScore?: number | null;
  maturityLevel?: string | null;

  productionReadinessScore?: number | null;
  productionReadinessLevel?: string | null;

  engineeringQualityScore?: number | null;

  technologies?: string[];
  architectureDomains?: string[];
  repositoryTypes?: string[];
  enabledCapabilities?: string[];

  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
}

/**
 * Canonical repository intelligence used by the backend
 * comparison engine.
 *
 * This comes directly from the latest intelligence snapshot.
 * We should not reconstruct these values from architecture history.
 */
export interface RepositoryComparisonIntelligence {
  repositoryTypes: string[];
  domains: string[];
  technologies: string[];
  capabilities: string[];
  generatedAt: string;
}

export interface RepositoryComparisonSharedSignals {
  repositoryTypes: string[];
  technologies: string[];
  architectureDomains: string[];
  capabilities: string[];

  /**
   * Kept by the backend for compatibility.
   * This is NOT part of the canonical similarity calculation.
   */
  engineeringSignals: string[];
}

export interface RepositoryComparisonScoreBreakdown {
  repositoryTypeScore: number;
  architectureDomainScore: number;
  capabilityScore: number;
  technologyScore: number;
}

export interface RepositoryComparisonOverlap {
  repositoryTypes: number;
  architectureDomains: number;
  capabilities: number;
  technologies: number;
}

export interface RepositoryCanonicalComparison {
  similarityScore: number;
  similarityLevel: RepositorySimilarityLevel;

  sharedSignals: RepositoryComparisonSharedSignals;

  scoreBreakdown: RepositoryComparisonScoreBreakdown;

  overlap: RepositoryComparisonOverlap;

  keyDifferences: string[];
  recommendations: string[];
}

export interface RepositoryComparisonResponse {
  sourceRepository: ComparisonRepository;
  targetRepository: ComparisonRepository;

  sourceIntelligence: RepositoryComparisonIntelligence;
  targetIntelligence: RepositoryComparisonIntelligence;

  comparison: RepositoryCanonicalComparison;
}
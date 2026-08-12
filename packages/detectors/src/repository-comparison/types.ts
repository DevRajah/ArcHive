export type RepositoryComparisonLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export type RepositoryComparisonRepository = {
  name: string;

  /**
   * Canonical current-state repository intelligence.
   *
   * Future me:
   * These should come from RepositoryIntelligenceSnapshot, not from
   * historical ArchitectureChange rows.
   */
  repositoryTypes: string[];
  technologies: string[];
  architectureDomains: string[];
  capabilities: string[];

  /**
   * Kept for backwards compatibility with older callers.
   *
   * Engineering signals are no longer part of the canonical similarity
   * score because the current snapshot already gives us stronger structured
   * evidence through repository types, domains, technologies and capabilities.
   */
  engineeringSignals?: string[];

  healthScore?: number;
  maturityScore?: number;
};

export type RepositoryComparisonInput = {
  source: RepositoryComparisonRepository;
  target: RepositoryComparisonRepository;
};

export type RepositoryComparison = {
  similarityScore: number;
  similarityLevel: RepositoryComparisonLevel;

  sharedSignals: {
    repositoryTypes: string[];
    technologies: string[];
    architectureDomains: string[];
    capabilities: string[];

    /**
     * Preserved so existing frontend consumers do not break.
     */
    engineeringSignals: string[];
  };

  /**
   * Explain exactly where the final score came from.
   *
   * These four dimensions add up to similarityScore.
   */
  scoreBreakdown: {
    repositoryTypeScore: number;
    architectureDomainScore: number;
    capabilityScore: number;
    technologyScore: number;
  };

  /**
   * Normalized overlap values are useful for debugging and UI explanation.
   *
   * Each value is between 0 and 1.
   */
  overlap: {
    repositoryTypes: number;
    architectureDomains: number;
    capabilities: number;
    technologies: number;
  };

  keyDifferences: string[];
  recommendations: string[];
};
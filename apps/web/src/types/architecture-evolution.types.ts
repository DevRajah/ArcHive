export interface ArchitectureEvolutionChange {
  id: string;
  changeType: string;
  detectedTechnology?: string | null;
  fileAffected?: string | null;
  summary?: string | null;
  architectureDomain: string;
  evolutionSummary?: string | null;
  createdAt: string;

  // Some evolution records include the repository identity
  // that ArcHive resolved when the event was generated.
  repositoryTypes?: string | null;
}

export interface ArchitectureEvolutionDomain {
  domain: string;
  label: string;
  totalChanges: number;
  latestChangeAt?: string | null;
  technologies: string[];
  changes: ArchitectureEvolutionChange[];

  // The backend may include this to indicate that repository
  // classification evidence exists for this evolution lane.
  repositoryTypes?: boolean;
}

export interface InfrastructureDepthEvidence {
  detected: string[];
  detectedCount: number;
  totalPossible: number;
}

export interface ArchitectureEvolutionInsights {
  /**
   * Current repository maturity.
   *
   * This describes the repository today. It is contextual
   * information and should not be confused with historical
   * architecture evolution.
   */
  repositoryMaturityScore?: number;

  /**
   * How much of ArcHive's capability model is currently
   * represented by this repository.
   */
  capabilityScore?: number;

  /**
   * Numeric infrastructure coverage score.
   */
  infrastructureDepthScore?: number;

  /**
   * Human-readable infrastructure depth classification.
   */
  infrastructureDepth?: string;

  /**
   * Kept because the backend still exposes the legacy field.
   * Prefer repositoryMaturityScore in new UI code.
   */
  architectureMaturityScore?: number;

  dominantDomain?: string | null;

  detectedCapabilities?: string[];
  missingCapabilities?: string[];

  architectureStyles?: string[];

  infrastructureDepthEvidence?: InfrastructureDepthEvidence;
}

export interface ArchitectureEvolutionResponse {
  repository: {
    id: string;
    name: string;
    owner?: string;
    fullName: string;
    description?: string | null;
    defaultBranch?: string;
    language?: string | null;
    stars?: number;
    forks?: number;
    userId?: string;
  };

  /**
   * Historical evolution summary.
   *
   * These are counts, not percentage scores.
   */
  summary: {
    totalArchitectureChanges: number;
    totalDomains: number;
    mostActiveDomain?: string | null;
  };

  /**
   * Current architecture context returned alongside the
   * historical evolution data.
   */
  insights?: ArchitectureEvolutionInsights;

  domains: ArchitectureEvolutionDomain[];
}
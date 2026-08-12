export interface RepositoryCapabilitiesResponse {
  repository: {
    id: string;
    name: string;
    fullName: string;
  };

  capabilities: {
    frontendArchitecture?: boolean;
    apiLayer?: boolean;
    authentication?: boolean;
    realtimeSystems?: boolean;
    queueInfrastructure?: boolean;
    databaseLayer?: boolean;
    cachingLayer?: boolean;
    devopsInfrastructure?: boolean;
    dependencyManagement?: boolean;
    typeContracts?: boolean;
    stateManagement?: boolean;
    architectureIntelligence?: boolean;
  };

  capabilityResults?: Array<{
    key: string;
    reason: string;
    confidence: number;
  }>;

  scores: {
    repositoryMaturityScore: number;

    /**
     * Canonical capability breadth/strength score.
     */
    capabilityScore: number;

    /**
     * Coverage of infrastructure-oriented capabilities.
     */
    infrastructureDepthScore: number;

    infrastructureDepth: string;

    infrastructureDepthEvidence?: {
      detected: string[];
      detectedCount: number;
      totalPossible: number;
    };

    /**
     * @deprecated
     * Backend compatibility alias.
     * Use repositoryMaturityScore instead.
     */
    architectureMaturityScore?: number;

    /**
     * @deprecated
     * Backend compatibility alias.
     * Use capabilityScore instead.
     */
    engineeringComplexityScore?: number;
  };

  repositoryPurpose?: {
    purposeType: string;
    label: string;
    description: string;
  } | null;

  detectedDomains: string[];
  detectedTechnologies: string[];

  reasoningSignals?: string[];

  detectedRepositoryTypes?: string[];
  repositoryTypes?: string[];

  architectureStyles?: string[];
}
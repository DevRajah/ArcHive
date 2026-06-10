export interface RepositoryIntelligenceReportResponse {
  repository: {
    id: string;
    name: string;
    fullName: string;
    language?: string | null;
  };

  report?: {
    headline?: string | null;
    summary?: string | null;
  };

  semanticProfile?: {
    semanticLabel?: string | null;
    semanticDescription?: string | null;
    confidence?: number | null;
  };

  narrative?: {
    strengths?: string[];
    dominantPatterns?: string[];
    detectedSpecializations?: string[];
  };

  confidence?: {
    confidenceScore?: number;
    confidenceLevel?: string;
  };

  audit?: {
    auditStatus?: string;
    strengths?: string[];
    warnings?: string[];
    improvementAreas?: string[];
  };

  evolutionDirection?: {
    label?: string | null;
    description?: string | null;
  };

  engineeringReasoning?: {
    maturitySignal?: string | null;
    strengths?: string[];
    observations?: string[];
    risks?: string[];
    recommendations?: string[];
  };

  recommendations?: {
    active?: unknown[];
    resolved?: unknown[];
  };

  intelligence?: {
    repositoryTypes?: string[];
    domains?: string[];
    technologies?: string[];
    architectureStyles?: string[];
    reasoningSignals?: string[];
    capabilities?: Record<string, boolean>;
  };

  knowledgeGraph?: unknown;
  evidence?: unknown;
}
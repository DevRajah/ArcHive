export interface RepositoryIntelligenceSummaryResponse {
  repository: {
    id: string;
    name: string;
    fullName: string;
  };

  summary: {
    mode: "ACTIVE" | "PASSIVE" | string;
    headline?: string | null;
    overview?: string | null;
    keyFocusAreas?: string[];
    detectedPatterns?: string[];

    confidence?: {
      confidenceScore: number;
      confidenceLevel: string;
    };

    reasoningSignals?: string[];

    generatedAt?: string | null;
  };
}
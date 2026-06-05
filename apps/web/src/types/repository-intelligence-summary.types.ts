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

    generatedAt?: string | null;
  };
}
export interface RepositoryNarrativeResponse {
  repository: {
    id: string;
    name: string;
    fullName: string;
    language?: string | null;
  };

  narrative: {
    headline?: string | null;
    summary?: string | null;
    strengths?: string[];
    engineeringProfile?: string | null;
    dominantPatterns?: string[];
    detectedSpecializations?: string[];
  };
}
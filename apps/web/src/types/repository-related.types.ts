export interface RelatedRepositoryItem {
  repository: {
    id: string;
    name: string;
    fullName: string;
    language?: string | null;
  };

  similarity: {
    similarityScore: number;
    similarityLevel: string;
    reason?: string | null;
    sharedSignals?: {
      repositoryTypes?: string[];
      domains?: string[];
      technologies?: string[];
    };
  };
}

export interface RepositoryRelatedResponse {
  sourceIntelligence?: unknown;
  relatedRepositories: RelatedRepositoryItem[];
}
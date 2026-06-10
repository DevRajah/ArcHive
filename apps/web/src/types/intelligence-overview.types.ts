export interface IntelligenceOverviewRepository {
  id: string;
  name: string;
  fullName: string;
  semanticLabel?: string | null;
  confidence?: number | null;
  repositoryTypes?: string[];
  dominantDomains?: string[];
  technologies?: string[];
}

export interface IntelligenceOverviewResponse {
  repositories: IntelligenceOverviewRepository[];
}
export interface RepositoryRecommendation {
  id?: string;
  title: string;
  description?: string | null;
  status: "ACTIVE" | "RESOLVED" | "DISMISSED" | string;
  evidence?: string | null;
  resolvedAt?: string | null;
  createdAt?: string | null;
}

export interface RepositoryRecommendationsResponse {
  active?: RepositoryRecommendation[];
  resolved?: RepositoryRecommendation[];
  dismissed?: RepositoryRecommendation[];
  recommendations?: RepositoryRecommendation[];
}
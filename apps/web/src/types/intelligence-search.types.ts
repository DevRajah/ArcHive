import { IntelligenceOverviewRepository } from "./intelligence-overview.types";

export interface IntelligenceSearchParams {
  query?: string;
  repositoryType?: string;
  domain?: string;
  technology?: string;
}

export interface IntelligenceSearchResponse {
  repositories: IntelligenceOverviewRepository[];
}
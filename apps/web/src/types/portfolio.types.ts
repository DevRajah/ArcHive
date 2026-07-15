export interface PortfolioUser {
  id: string;
  username?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
}

export interface PortfolioSummary {
  totalRepositories: number;
  trackedRepositories: number;
  untrackedRepositories: number;
  repositoriesWithIntelligence: number;
  repositoriesWithoutIntelligence: number;
  intelligenceCoveragePercent: number;
  totalEngineeringEvents: number;
  totalTimelineEntries: number;
  totalArchitectureChanges: number;
  totalRecommendations: number;
  activeRecommendations: number;
  totalStars: number;
  totalForks: number;
}

export interface PortfolioDistributionItem {
  name: string;
  count: number;
}

export interface PortfolioDistributions {
  languages: PortfolioDistributionItem[];
  repositoryTypes: PortfolioDistributionItem[];
  architectureDomains: PortfolioDistributionItem[];
  technologies: PortfolioDistributionItem[];
}

export interface PortfolioRepository {
  id: string;
  name: string;
  fullName?: string | null;
  owner?: string | null;
  language?: string | null;
  isTracked?: boolean;
  stars?: number;
  forks?: number;
  updatedAt?: string | null;

  repositoryType?: string | null;
  architectureDomain?: string | null;

  totalEngineeringEvents?: number;
  totalTimelineEntries?: number;
  totalArchitectureChanges?: number;
  totalRecommendations?: number;
  activeRecommendations?: number;
}

export interface PortfolioHighlightRepository extends PortfolioRepository {
  /**
   * Some highlight responses may expose the relevant aggregate as a generic
   * metric rather than repeating a domain-specific field.
   */
  metric?: number;

  activityCount?: number;
  recommendationCount?: number;
  lastUpdatedAt?: string | null;
}

export interface PortfolioHighlights {
  mostStarredRepository: PortfolioHighlightRepository | null;
  mostActiveRepository: PortfolioHighlightRepository | null;
  mostRecentlyUpdatedRepository: PortfolioHighlightRepository | null;
  repositoryWithMostRecommendations: PortfolioHighlightRepository | null;
}

export interface UserPortfolioResponse {
  user: PortfolioUser;
  summary: PortfolioSummary;
  distributions: PortfolioDistributions;
  highlights: PortfolioHighlights;
  repositories: PortfolioRepository[];
}
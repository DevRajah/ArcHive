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


/* -------------------------------------------------------------------------- */
/* Portfolio timeline                                                         */
/* -------------------------------------------------------------------------- */

export type PortfolioActivityType =
  | "TIMELINE"
  | "ENGINEERING_EVENT"
  | "ARCHITECTURE_CHANGE"
  | "RECOMMENDATION";

export interface PortfolioTimelineRepository {
  id: string;
  name?: string | null;
  fullName?: string | null;
}

export interface PortfolioTimelineActivity {
  id: string;
  type: PortfolioActivityType | string;
  action?: string | null;
  title?: string | null;
  description?: string | null;
  createdAt: string;

  repository?: PortfolioTimelineRepository | null;

  metadata?: Record<string, unknown> | null;
}

export interface PortfolioTimelineFilters {
  repositories: Array<{
    id: string;
    name?: string | null;
    fullName?: string | null;
  }>;

  activityTypes: string[];
}

export interface PortfolioTimelineTotals {
  totalActivity: number;
  timelineEntries: number;
  engineeringEvents: number;
  architectureChanges: number;
  recommendations: number;
}

export interface PortfolioPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface PortfolioTimelineResponse {
  user: PortfolioUser;
  activity: PortfolioTimelineActivity[];
  filters: PortfolioTimelineFilters;
  totals: PortfolioTimelineTotals;
  pagination: PortfolioPagination;
}

export interface PortfolioTimelineParams {
  page?: number;
  limit?: number;
  repositoryId?: string;
  activityType?: string;
}

/* -------------------------------------------------------------------------- */
/* Portfolio trends                                                           */
/* -------------------------------------------------------------------------- */

export type PortfolioTrendPeriod = "7d" | "30d" | "90d" | "1y";

export interface PortfolioTrendPoint {
  date: string;
  totalActivity: number;
  engineeringEvents: number;
  timelineEntries: number;
  architectureChanges: number;
  recommendations: number;
}

export interface PortfolioTrendTotals {
  totalEngineeringEvents: number;
  totalTimelineEntries: number;
  totalArchitectureChanges: number;
  totalRecommendations: number;
  totalPortfolioActivity: number;
}

export interface PortfolioDateRange {
  start: string;
  end: string;
}

export interface PortfolioRepositoryActivity {
  repositoryId: string;
  repositoryName?: string | null;
  repositoryFullName?: string | null;

  totalActivity: number;
  engineeringEvents?: number;
  timelineEntries?: number;
  architectureChanges?: number;
  recommendations?: number;

  isTracked?: boolean;
}

export interface PortfolioTrendDistributions {
  technologies: PortfolioDistributionItem[];
  architectureDomains: PortfolioDistributionItem[];
  repositoryTypes: PortfolioDistributionItem[];
  languages: PortfolioDistributionItem[];
  engineeringEventTypes: PortfolioDistributionItem[];
  recommendationStatuses: PortfolioDistributionItem[];
}

export interface PortfolioTrendHighlights {
  mostActiveRepository: PortfolioRepositoryActivity | null;
  leastActiveRepository: PortfolioRepositoryActivity | null;
  inactiveTrackedRepositories: PortfolioRepositoryActivity[];
}

export interface PortfolioTrendsResponse {
  user: PortfolioUser;
  period: PortfolioTrendPeriod;
  dateRange: PortfolioDateRange;
  totals: PortfolioTrendTotals;
  trend: PortfolioTrendPoint[];
  distributions: PortfolioTrendDistributions;
  repositoryActivity: PortfolioRepositoryActivity[];
  highlights: PortfolioTrendHighlights;
}
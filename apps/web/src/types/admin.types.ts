export interface AdminDashboardResponse {
  totalUsers: number;
  totalRepositories: number;
  trackedRepositories: number;
  engineeringReports: number;
  architectureChanges: number;
  timelineEntries: number;
  engineeringRecommendations: number;
  repositoriesImportedToday: number;
  repositoriesReprocessedToday: number;
  eventProcessing: {
    completed: number;
    failed: number;
  };
}

export interface AdminUser {
  id: string;
  username?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  repositoryCount?: number;
  trackedRepositories?: number;
  createdAt?: string;
  lastActivityAt?: string | null;
}

export interface AdminRepository {
  id: string;
  name: string;
  fullName?: string | null;
  owner?: string | null;
  language?: string | null;
  stars?: number;
  forks?: number;
  isTracked?: boolean;
  repositoryType?: string | null;
  architectureDomain?: string | null;
  lastIntelligenceRefreshAt?: string | null;
  timelineCount?: number;
  eventCount?: number;
  architectureChangeCount?: number;
  recommendationCount?: number;
}

export interface AdminSystemResponse {
  apiStatus: string;
  database: string;
  environment: string;
  nodeVersion: string;
  uptime: number;
  memoryUsage: {
    rss?: number;
    heapUsed?: number;
    heapTotal?: number;
  };
}

export interface AdminUserRepository {
  id: string;
  name: string;
  fullName?: string | null;
  description?: string | null;
  language?: string | null;
  stars?: number;
  forks?: number;
  isTracked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUserDetails {
  user: AdminUser;
  repositories: AdminUserRepository[];

  stats?: {
    totalRepositories?: number;
    trackedRepositories?: number;
    totalTimelineEntries?: number;
    totalArchitectureChanges?: number;
    totalEngineeringEvents?: number;
  };

  timelineSummary?: {
    recentEntries?: number;
    lastActivityAt?: string | null;
  };
}

export interface AdminRepositoryDetails {
  repository: AdminRepository;

  owner?: AdminUser | null;

  stats?: {
    totalTimelineEntries?: number;
    totalEngineeringEvents?: number;
    totalArchitectureChanges?: number;
    totalRecommendations?: number;
  };

  intelligence?: {
    primaryRepositoryType?: string | null;
    repositoryTypes?: string[];
    architectureDomains?: string[];
    technologies?: string[];
    engineeringProfile?: string | null;
    lastRefreshedAt?: string | null;
  };

  timelineEntries?: Array<{
    id: string;
    title?: string | null;
    description?: string | null;
    createdAt?: string;
  }>;

  architectureChanges?: Array<{
    id: string;
    changeType?: string | null;
    summary?: string | null;
    detectedTechnology?: string | null;
    createdAt?: string;
  }>;

  recommendations?: Array<{
    id: string;
    title?: string | null;
    description?: string | null;
    priority?: string | null;
    status?: string | null;
    createdAt?: string;
  }>;
}

export interface AdminActivityItem {
  id: string;
  type?: string | null;
  title?: string | null;
  description?: string | null;
  repositoryId?: string | null;
  repositoryName?: string | null;
  createdAt?: string;
}

export interface AdminActivityResponse {
  activities: AdminActivityItem[];
}

export interface AdminQueueJob {
  id: string;
  name?: string | null;
  status?: string | null;
  failedReason?: string | null;
  timestamp?: string | null;
  createdAt?: string | null;
}

export interface AdminQueueResponse {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
  recentFailedJobs: AdminQueueJob[];
}

export interface AdminAnalyticsDatum {
  name: string;
  value: number;
}

export interface AdminAnalyticsResponse {
  repositoryTypes: AdminAnalyticsDatum[];
  languages: AdminAnalyticsDatum[];
  architectureDomains: AdminAnalyticsDatum[];
  technologies: AdminAnalyticsDatum[];
  engineeringProfiles: AdminAnalyticsDatum[];
}
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

export interface AdminQueueResponse {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
  recentFailedJobs: Array<{
    id: string;
    name?: string;
    failedReason?: string;
    timestamp?: string;
  }>;
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
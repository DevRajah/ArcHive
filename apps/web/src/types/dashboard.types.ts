export interface QueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused?: number;
}

export interface RecentEngineeringEvent {
  id: string;
  eventType: string;
  title?: string;
  summary?: string;
  source?: string;
  createdAt: string;
  repositoryName?: string;
  repositoryFullName?: string;
}

export interface DashboardSummary {
  repositories: number;
  engineeringEvents: number;
  timelineEntries: number;
  architectureChanges: number;
  queueMetrics?: QueueMetrics;
  recentEngineeringEvents?: RecentEngineeringEvent[];
  repositoryIntelligence?: RepositoryIntelligence[];
}

export interface RepositoryIntelligence {
  name: string;
  fullName: string;
  events: number;
  architectureChanges: number;
}
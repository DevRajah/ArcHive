export interface QueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

export interface DashboardSummary {
  repositories: number;
  engineeringEvents: number;
  timelineEntries: number;
  architectureChanges: number;
  queueMetrics?: QueueMetrics;
}
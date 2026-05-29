export interface DashboardSummary {
  totalRepositories: number;
  totalEngineeringEvents: number;
  totalTimelineEntries: number;
  totalArchitectureChanges: number;
  queueMetrics?: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  };
}
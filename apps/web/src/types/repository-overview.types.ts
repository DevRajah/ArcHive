export interface RepositoryOverview {
  repository: {
    id: string;
    name: string;
    fullName: string;
    description?: string | null;
    defaultBranch?: string;
  };

  metrics: {
    totalEvents: number;
    totalTimelineEntries: number;
    totalArchitectureChanges: number;
  };

  recentEvents?: Array<{
    id: string;
    eventType: string;
    title?: string;
    summary?: string;
    source?: string;
    createdAt: string;
  }>;

  recentTimelineEntries?: Array<{
    id: string;
    title: string;
    summary?: string;
    createdAt: string;
  }>;

  recentArchitectureChanges?: Array<{
    id: string;
    title: string;
    description?: string;
    severity?: string;
    changeType?: string;
    createdAt: string;
  }>;
}
export interface RepositoryOverview {
  repository: {
    id: string;
    name: string;
    fullName: string;
    description?: string | null;
    defaultBranch?: string;
  };

  trackingStatus?: {
  isTracked?: boolean;
  webhookStatus?: "CONNECTED" | "MISSING" | "UNKNOWN";
  lastEngineeringEventAt?: string | null;
  lastQueueStatus?: string | null;
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
    title?: string;
    description?: string;
    changeType?: string;
    severity?: string;
    detectedTechnology?: string | null;
    fileAffected?: string | null;
    summary?: string | null;
    createdAt: string;
  }>;

  
}
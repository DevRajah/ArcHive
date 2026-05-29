export interface QueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused?: number;
}

export interface QueueRecentJob {
  id: string;
  name: string;
  data?: {
    eventId?: string;
    repositoryId?: string;
    queueName?: string;
  };
  attemptsMade?: number;
  failedReason?: string | null;
  timestamp?: number;
  processedOn?: number;
  finishedOn?: number;
  status: string;
  queueName?: string;
}
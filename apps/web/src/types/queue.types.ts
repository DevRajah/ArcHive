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
  status?: string;
  queueName?: string;
  createdAt?: string;
  processedOn?: number;
  finishedOn?: number;
  failedReason?: string | null;
}
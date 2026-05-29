import { api } from "@/lib/api";
import { QueueMetrics, QueueRecentJob } from "@/types/queue.types";

export const queueService = {
  async getQueueMetrics(): Promise<QueueMetrics> {
    const response = await api.get("/queues/metrics");

    return response.data.data.counts;
  },

  async getRecentJobs(): Promise<QueueRecentJob[]> {
    const response = await api.get("/queues/recent-jobs");

    return response.data.data.jobs || response.data.data;
  },
};
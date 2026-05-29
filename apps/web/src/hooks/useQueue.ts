import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { queueService } from "@/services/queue.service";

export function useQueueMetrics() {
  return useQuery({
    queryKey: QUERY_KEYS.QUEUE_METRICS,
    queryFn: queueService.getQueueMetrics,
    refetchInterval: 1000 * 10, // I refresh every 10 seconds because queue state changes often.
  });
}

export function useRecentQueueJobs() {
  return useQuery({
    queryKey: QUERY_KEYS.QUEUE_RECENT_JOBS,
    queryFn: queueService.getRecentJobs,
    refetchInterval: 1000 * 15,
  });
}
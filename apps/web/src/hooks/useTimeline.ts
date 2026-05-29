import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { timelineService } from "@/services/timeline.service";

export function useRepositoryTimeline(repositoryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.REPOSITORY_TIMELINE(repositoryId),
    queryFn: () => timelineService.getRepositoryTimeline(repositoryId),
    enabled: Boolean(repositoryId),
  });
}
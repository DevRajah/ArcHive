import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { repositoryService } from "@/services/repository.service";

export function useRepositoryOverview(repositoryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.REPOSITORY_OVERVIEW(repositoryId),
    queryFn: () => repositoryService.getRepositoryOverview(repositoryId),
    enabled: Boolean(repositoryId),
  });
}
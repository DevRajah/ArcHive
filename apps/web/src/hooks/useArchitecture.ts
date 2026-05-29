import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { architectureService } from "@/services/architecture.service";

export function useRepositoryArchitecture(repositoryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.REPOSITORY_ARCHITECTURE(repositoryId),
    queryFn: () => architectureService.getArchitectureChanges(repositoryId),
    enabled: Boolean(repositoryId),
  });
}
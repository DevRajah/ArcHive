import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { architectureService } from "@/services/architecture.service";



export function useRepositoryArchitecture(repositoryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.REPOSITORY_ARCHITECTURE(repositoryId),
    queryFn: () => architectureService.getRepositoryArchitecture(repositoryId),
    enabled: Boolean(repositoryId),
  });
}

export function useRepositoryArchitectureEvolution(repositoryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ARCHITECTURE_EVOLUTION(repositoryId),
    queryFn: () =>
      architectureService.getRepositoryArchitectureEvolution(repositoryId),
    enabled: Boolean(repositoryId),
  });
}

export function useRepositoryArchitectureRadar(repositoryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.REPOSITORY_ARCHITECTURE_RADAR(repositoryId),
    queryFn: () => architectureService.getRepositoryArchitectureRadar(repositoryId),
    enabled: Boolean(repositoryId),
    retry: false,
  });
}
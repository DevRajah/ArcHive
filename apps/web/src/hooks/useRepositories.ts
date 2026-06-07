import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { repositoryService } from "@/services/repository.service";
import { GithubRepository } from "@/types/repository.types";

export function useTrackedRepositories() {
  return useQuery({
    queryKey: QUERY_KEYS.REPOSITORIES,
    queryFn: repositoryService.getTrackedRepositories,
  });
}

export function useUntrackRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (repositoryId: string) =>
      repositoryService.untrackRepository(repositoryId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.REPOSITORIES,
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DASHBOARD_SUMMARY,
      });
    },
  });
}

export function useGithubRepositories() {
  return useQuery({
    queryKey: QUERY_KEYS.GITHUB_REPOSITORIES,
    queryFn: repositoryService.getGithubRepositories,
  });
}

export function useImportSelectedRepositories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (repositories: GithubRepository[]) =>
      repositoryService.importSelectedRepositories(repositories),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.REPOSITORIES,
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GITHUB_REPOSITORIES,
      });
    },
  });
}

export function useRepositoryCapabilities(repositoryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.REPOSITORY_CAPABILITIES(repositoryId),
    queryFn: () => repositoryService.getRepositoryCapabilities(repositoryId),
    enabled: Boolean(repositoryId),
  });
}

export function useRepositoryArchitectureRadar(repositoryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.REPOSITORY_ARCHITECTURE_RADAR(repositoryId),
    queryFn: () => repositoryService.getRepositoryArchitectureRadar(repositoryId),
    enabled: Boolean(repositoryId),
  });
}

export function useRepositoryNarrative(repositoryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.REPOSITORY_NARRATIVE(repositoryId),
    queryFn: () => repositoryService.getRepositoryNarrative(repositoryId),
    enabled: Boolean(repositoryId),
  });
}

export function useRepositoryIntelligenceSummary(
  repositoryId: string
) {
  return useQuery({
    queryKey:
      QUERY_KEYS.REPOSITORY_INTELLIGENCE_SUMMARY(repositoryId),

    queryFn: () =>
      repositoryService.getRepositoryIntelligenceSummary(
        repositoryId
      ),

    enabled: Boolean(repositoryId),
     retry: false,
  });
}
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

export function useRepositoryPurpose(repositoryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.REPOSITORY_PURPOSE(repositoryId),
    queryFn: () => repositoryService.getRepositoryPurpose(repositoryId),
    enabled: Boolean(repositoryId),
    retry: false,
  });
}

export function useRepositoryIntelligenceReport(repositoryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.REPOSITORY_INTELLIGENCE_REPORT(repositoryId),
    queryFn: () => repositoryService.getRepositoryIntelligenceReport(repositoryId),
    enabled: Boolean(repositoryId),
    retry: false,
  });
}

export function useRepositoryIntelligenceTimeline(repositoryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.REPOSITORY_INTELLIGENCE_TIMELINE(repositoryId),
    queryFn: () =>
      repositoryService.getRepositoryIntelligenceTimeline(repositoryId),
    enabled: Boolean(repositoryId),
    retry: false,
  });
}

export function useRelatedRepositories(repositoryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.REPOSITORY_RELATED(repositoryId),
    queryFn: () => repositoryService.getRelatedRepositories(repositoryId),
    enabled: Boolean(repositoryId),
    retry: false,
  });
}

export function useRepositoryMarkdownReport(repositoryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.REPOSITORY_INTELLIGENCE_MARKDOWN(repositoryId),
    queryFn: () => repositoryService.getRepositoryMarkdownReport(repositoryId),
    enabled: Boolean(repositoryId),
    retry: false,
  });
}
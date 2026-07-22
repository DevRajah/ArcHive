import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { repositoryHealthTrendsService } from "@/services/repository-health-trends.service";

export const repositoryHealthTrendsKeys = {
  all: ["repository-health-trends"] as const,

  repository: (repositoryId: string) =>
    [
      ...repositoryHealthTrendsKeys.all,
      repositoryId,
    ] as const,

  overview: (repositoryId: string) =>
    [
      ...repositoryHealthTrendsKeys.repository(
        repositoryId,
      ),
      "overview",
    ] as const,

  summary: (repositoryId: string) =>
    [
      ...repositoryHealthTrendsKeys.repository(
        repositoryId,
      ),
      "summary",
    ] as const,

  history: (repositoryId: string) =>
    [
      ...repositoryHealthTrendsKeys.repository(
        repositoryId,
      ),
      "history",
    ] as const,

  changes: (repositoryId: string) =>
    [
      ...repositoryHealthTrendsKeys.repository(
        repositoryId,
      ),
      "changes",
    ] as const,
};

export function useRepositoryHealthTrends(
  repositoryId: string,
) {
  return useQuery({
    queryKey:
      repositoryHealthTrendsKeys.overview(repositoryId),

    queryFn: () =>
      repositoryHealthTrendsService.getHealthTrends(
        repositoryId,
      ),

    enabled: Boolean(repositoryId),

    /*
     * Health trends should remain stable while the user is reviewing
     * them. The explicit refresh button controls regeneration.
     */
    refetchOnWindowFocus: false,
  });
}

export function useRepositoryHealthSummary(
  repositoryId: string,
) {
  return useQuery({
    queryKey:
      repositoryHealthTrendsKeys.summary(repositoryId),

    queryFn: () =>
      repositoryHealthTrendsService.getSummary(
        repositoryId,
      ),

    enabled: Boolean(repositoryId),

    refetchOnWindowFocus: false,
  });
}

export function useRepositoryHealthHistory(
  repositoryId: string,
) {
  return useQuery({
    queryKey:
      repositoryHealthTrendsKeys.history(repositoryId),

    queryFn: () =>
      repositoryHealthTrendsService.getHistory(
        repositoryId,
      ),

    enabled: Boolean(repositoryId),

    refetchOnWindowFocus: false,
  });
}

export function useRepositoryHealthChanges(
  repositoryId: string,
) {
  return useQuery({
    queryKey:
      repositoryHealthTrendsKeys.changes(repositoryId),

    queryFn: () =>
      repositoryHealthTrendsService.getChanges(
        repositoryId,
      ),

    enabled: Boolean(repositoryId),

    refetchOnWindowFocus: false,
  });
}

export function useRefreshRepositoryHealthTrends(
  repositoryId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      repositoryHealthTrendsService.refreshHealthTrends(
        repositoryId,
      ),

    onSuccess: async () => {
      /*
       * Refreshing creates a new health snapshot, so every health trends
       * query for this repository must be invalidated together.
       */
      await queryClient.invalidateQueries({
        queryKey:
          repositoryHealthTrendsKeys.repository(
            repositoryId,
          ),
      });
    },
  });
}
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
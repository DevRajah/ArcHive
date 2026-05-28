import { useQuery } from "@tanstack/react-query";
import { repositoryService } from "@/services/repository.service";

export function useRepositories() {
  return useQuery({
    queryKey: ["repositories"],
    queryFn: repositoryService.getRepositories,
  });
}
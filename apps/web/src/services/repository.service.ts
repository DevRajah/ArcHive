import { api } from "@/lib/api";
import { ApiResponse } from "@/types/api.types";
import { GithubRepository, Repository } from "@/types/repository.types";

const USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID;

function getUserId() {
  if (!USER_ID) {
    throw new Error("NEXT_PUBLIC_DEV_USER_ID is missing in .env.local");
  }

  return USER_ID;
}

export const repositoryService = {
  async getTrackedRepositories() {
    const response = await api.get<ApiResponse<Repository[]>>(
      `/github/users/${getUserId()}/repositories/tracked`
    );

    return response.data.data;
  },

  async getGithubRepositories() {
    const response = await api.get<ApiResponse<GithubRepository[]>>(
      `/github/users/${getUserId()}/repositories/available`
    );

    return response.data.data;
  },

  async importSelectedRepositories(repositories: GithubRepository[]) {
    const response = await api.post<ApiResponse<Repository[]>>(
      `/github/users/${getUserId()}/repositories/import-selected`,
      { repositories }
    );

    return response.data.data;
  },

  async getRepositoryById(repositoryId: string) {
    const response = await api.get<ApiResponse<Repository>>(
      `/repositories/${repositoryId}`
    );

    return response.data.data;
  },

  async getRepositoryOverview(repositoryId: string) {
    const response = await api.get(
      `/repositories/${repositoryId}/overview`
    );

    return response.data.data;
  },

  async untrackRepository(repositoryId: string) {
    const response = await api.patch(
      `/github/users/${getUserId()}/repositories/${repositoryId}/untrack`
    );

    return response.data.data;
  },
};
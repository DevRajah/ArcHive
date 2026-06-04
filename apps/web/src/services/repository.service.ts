import { api } from "@/lib/api";
import { getUserId } from "@/lib/auth";
import { ApiResponse } from "@/types/api.types";
import { GithubRepository, Repository } from "@/types/repository.types";
import { RepositoryOverview } from "@/types/repository-overview.types";
import { RepositoryCapabilitiesResponse } from "@/types/repository-capabilities.types";

function requireUserId() {
  const userId = getUserId();

  if (!userId) {
    throw new Error(
      "No ArcHive user ID found. Please connect GitHub or set NEXT_PUBLIC_DEV_USER_ID."
    );
  }

  return userId;
}

export const repositoryService = {
  async getTrackedRepositories() {
    const response = await api.get<ApiResponse<Repository[]>>(
      `/github/users/${requireUserId()}/repositories/tracked`
    );

    return response.data.data;
  },

  async getGithubRepositories() {
    const response = await api.get<ApiResponse<GithubRepository[]>>(
      `/github/users/${requireUserId()}/repositories/available`
    );

    return response.data.data;
  },

  async importSelectedRepositories(repositories: GithubRepository[]) {
    const response = await api.post<ApiResponse<Repository[]>>(
      `/github/users/${requireUserId()}/repositories/import-selected`,
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

  async getRepositoryOverview(repositoryId: string): Promise<RepositoryOverview> {
    const response = await api.get<ApiResponse<RepositoryOverview>>(
      `/repositories/${repositoryId}/overview`
    );

    return response.data.data;
  },

  async untrackRepository(repositoryId: string) {
    const response = await api.patch(
      `/github/users/${requireUserId()}/repositories/${repositoryId}/untrack`
    );

    return response.data.data;
  },

  async getRepositoryCapabilities(
    repositoryId: string
  ): Promise<RepositoryCapabilitiesResponse> {
    const response = await api.get<ApiResponse<RepositoryCapabilitiesResponse>>(
      `/repositories/${repositoryId}/capabilities`
    );

    return response.data.data;
  },
};
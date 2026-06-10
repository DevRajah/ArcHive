import { api } from "@/lib/api";
import { getUserId } from "@/lib/auth";
import { ApiResponse } from "@/types/api.types";
import { GithubRepository, Repository } from "@/types/repository.types";
import { RepositoryOverview } from "@/types/repository-overview.types";
import { RepositoryCapabilitiesResponse } from "@/types/repository-capabilities.types";
import { RepositoryArchitectureRadarResponse } from "@/types/repository-radar.types";
import { RepositoryNarrativeResponse } from "@/types/repository-narrative.types";
import { RepositoryIntelligenceSummaryResponse } from "@/types/repository-intelligence-summary.types";
import { RepositoryPurposeResponse } from "@/types/repository-purpose.types";
import { RepositoryIntelligenceReportResponse } from "@/types/repository-intelligence-report.types";
import { RepositoryIntelligenceTimelineResponse } from "@/types/repository-intelligence-timeline.types";
import { RepositoryRelatedResponse } from "@/types/repository-related.types";
import { RepositoryMarkdownReportResponse } from "@/types/repository-markdown-report.types";

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

  async getRepositoryArchitectureRadar(
    repositoryId: string
  ): Promise<RepositoryArchitectureRadarResponse> {
    const response = await api.get<ApiResponse<RepositoryArchitectureRadarResponse>>(
      `/repositories/${repositoryId}/architecture-radar`
    );

    return response.data.data;
  },

  async getRepositoryNarrative(
    repositoryId: string
  ): Promise<RepositoryNarrativeResponse> {
    const response = await api.get<ApiResponse<RepositoryNarrativeResponse>>(
      `/repositories/${repositoryId}/narrative`
    );

    return response.data.data;
  },

  async getRepositoryIntelligenceSummary(
    repositoryId: string
  ): Promise<RepositoryIntelligenceSummaryResponse> {
    const response = await api.get<ApiResponse<RepositoryIntelligenceSummaryResponse>>(
      `/repositories/${repositoryId}/intelligence-summary`
    );

    return response.data.data;
  },

  async getRepositoryPurpose(
    repositoryId: string
  ): Promise<RepositoryPurposeResponse> {
    const response = await api.get<ApiResponse<RepositoryPurposeResponse>>(
      `/repositories/${repositoryId}/purpose`
    );

    return response.data.data;
  },

  async getRepositoryIntelligenceReport(
    repositoryId: string
  ): Promise<RepositoryIntelligenceReportResponse> {
    const response = await api.get<ApiResponse<RepositoryIntelligenceReportResponse>>(
      `/repositories/${repositoryId}/intelligence-report`
    );

    return response.data.data;
  },

  async getRepositoryIntelligenceTimeline(
    repositoryId: string
  ): Promise<RepositoryIntelligenceTimelineResponse> {
    const response = await api.get<
      ApiResponse<RepositoryIntelligenceTimelineResponse>
    >(`/repositories/${repositoryId}/intelligence-timeline`);

    return response.data.data;
  },

  async getRelatedRepositories(
    repositoryId: string
  ): Promise<RepositoryRelatedResponse> {
    const response = await api.get<ApiResponse<RepositoryRelatedResponse>>(
      `/repositories/${repositoryId}/related`
    );

    return response.data.data;
  },

  async getRepositoryMarkdownReport(
    repositoryId: string
  ): Promise<RepositoryMarkdownReportResponse> {
    const response = await api.get<ApiResponse<RepositoryMarkdownReportResponse>>(
      `/repositories/${repositoryId}/intelligence-report/markdown`
    );

    return response.data.data;
  },
};
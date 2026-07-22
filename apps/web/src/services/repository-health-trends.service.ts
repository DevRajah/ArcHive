import { api } from "@/lib/api";

import type {
  RepositoryHealthChangesResponse,
  RepositoryHealthChange,
  RepositoryHealthHistoryResponse,
  RepositoryHealthRefreshResponse,
  RepositoryHealthSnapshot,
  RepositoryHealthSummary,
  RepositoryHealthTrendResponse,
} from "@/types/repository-health-trends.types";

type ApiEnvelope<T> =
  | T
  | {
      data: T;
    }
  | {
      success: boolean;
      data: T;
      message?: string;
    };

function unwrapApiData<T>(response: ApiEnvelope<T>): T {
  if (
    typeof response === "object" &&
    response !== null &&
    "data" in response
  ) {
    return response.data;
  }

  return response as T;
}

function normalizeHistoryResponse(
  response:
    | RepositoryHealthHistoryResponse
    | RepositoryHealthSnapshot[],
): RepositoryHealthHistoryResponse {
  if (Array.isArray(response)) {
    return {
      history: response,
      snapshotCount: response.length,
    };
  }

  return {
    ...response,
    history: response.history ?? [],
    snapshotCount:
      response.snapshotCount ??
      response.history?.length ??
      0,
  };
}

function normalizeChangesResponse(
  response:
    | RepositoryHealthChangesResponse
    | RepositoryHealthChange[],
): RepositoryHealthChangesResponse {
  if (Array.isArray(response)) {
    return {
      changes: response,
    };
  }

  return {
    ...response,
    changes: response.changes ?? [],
  };
}

export const repositoryHealthTrendsService = {
  async getHealthTrends(
    repositoryId: string,
  ): Promise<RepositoryHealthTrendResponse> {
    const response = await api.get<
      ApiEnvelope<RepositoryHealthTrendResponse>
    >(
      `/repositories/${repositoryId}/health-trends`,
    );

    return unwrapApiData(response.data);
  },

  async getSummary(
    repositoryId: string,
  ): Promise<RepositoryHealthSummary> {
    const response = await api.get<
      ApiEnvelope<RepositoryHealthSummary>
    >(
      `/repositories/${repositoryId}/health-trends/summary`,
    );

    return unwrapApiData(response.data);
  },

  async getHistory(
    repositoryId: string,
  ): Promise<RepositoryHealthHistoryResponse> {
    const response = await api.get<
      ApiEnvelope<
        | RepositoryHealthHistoryResponse
        | RepositoryHealthSnapshot[]
      >
    >(
      `/repositories/${repositoryId}/health-trends/history`,
    );

    return normalizeHistoryResponse(
      unwrapApiData(response.data),
    );
  },

  async getChanges(
    repositoryId: string,
  ): Promise<RepositoryHealthChangesResponse> {
    const response = await api.get<
      ApiEnvelope<
        | RepositoryHealthChangesResponse
        | RepositoryHealthChange[]
      >
    >(
      `/repositories/${repositoryId}/health-trends/changes`,
    );

    return normalizeChangesResponse(
      unwrapApiData(response.data),
    );
  },

  async refreshHealthTrends(
    repositoryId: string,
  ): Promise<RepositoryHealthRefreshResponse> {
    const response = await api.post<
      ApiEnvelope<RepositoryHealthRefreshResponse>
    >(
      `/repositories/${repositoryId}/health-trends/refresh`,
    );

    return unwrapApiData(response.data);
  },
};
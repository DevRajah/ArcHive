import { api } from "@/lib/api";

import type {
    ArchitectureAdvisorAssessment,
    ArchitectureAdvisorHistory,
    AdvisorHistoryItem,
} from "@/types/architecture-advisor.types";

type ApiEnvelope<T> =
    | T
    | {
          data: T;
      }
    | {
          success: boolean;
          data: T;
      };

function unwrapApiData<T>(
    response: ApiEnvelope<T>
): T {
    if (
        typeof response === "object" &&
        response !== null &&
        "data" in response
    ) {
        return response.data;
    }

    return response as T;
}

function normalizeHistory(
    response:
        | ArchitectureAdvisorHistory
        | AdvisorHistoryItem[]
): ArchitectureAdvisorHistory {
    if (Array.isArray(response)) {
        return {
            history: response,
        };
    }

    return {
        ...response,
        history: response.history ?? [],
    };
}

export const architectureAdvisorService = {
    async getAssessment(
        repositoryId: string
    ): Promise<ArchitectureAdvisorAssessment> {
        const response = await api.get<
            ApiEnvelope<ArchitectureAdvisorAssessment>
        >(
            `/repositories/${repositoryId}/advisor`
        );

        return unwrapApiData(response.data);
    },

    async refreshAssessment(
        repositoryId: string
    ): Promise<ArchitectureAdvisorAssessment> {
        const response = await api.post<
            ApiEnvelope<ArchitectureAdvisorAssessment>
        >(
            `/repositories/${repositoryId}/advisor/refresh`
        );

        return unwrapApiData(response.data);
    },

    async getHistory(
        repositoryId: string
    ): Promise<ArchitectureAdvisorHistory> {
        const response = await api.get<
            ApiEnvelope<
                ArchitectureAdvisorHistory |
                AdvisorHistoryItem[]
            >
        >(
            `/repositories/${repositoryId}/advisor/history`
        );

        return normalizeHistory(
            unwrapApiData(response.data)
        );
    },
};
import { api } from "@/lib/api";

import type { ApiResponse } from "@/types/api.types";
import type {
  TechnologyIntelligenceDetail,
  TechnologyIntelligenceOverview,
} from "@/types/portfolio-technology.types";

function normalizeArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeOverview(
  data: TechnologyIntelligenceOverview
): TechnologyIntelligenceOverview {
  return {
    ...data,

    summary: {
      totalTechnologies:
        data.summary?.totalTechnologies ?? 0,

      totalRepositoryTechnologyLinks:
        data.summary?.totalRepositoryTechnologyLinks ?? 0,

      mostAdoptedTechnology:
        data.summary?.mostAdoptedTechnology ?? null,

      newestTechnology:
        data.summary?.newestTechnology ?? null,

      technologiesWithRecommendations:
        data.summary?.technologiesWithRecommendations ?? 0,
    },

    technologies: normalizeArray(data.technologies).map(
      (technology) => ({
        ...technology,

        repositoryCount:
          technology.repositoryCount ?? 0,

        trackedRepositoryCount:
          technology.trackedRepositoryCount ?? 0,

        architectureDomainCount:
          technology.architectureDomainCount ?? 0,

        capabilityCount:
          technology.capabilityCount ?? 0,

        recommendationCount:
          technology.recommendationCount ?? 0,

        firstDetectedAt:
          technology.firstDetectedAt ?? null,

        lastDetectedAt:
          technology.lastDetectedAt ?? null,
      })
    ),
  };
}

function normalizeDetail(
  data: TechnologyIntelligenceDetail
): TechnologyIntelligenceDetail {
  return {
    ...data,

    technology: {
      ...data.technology,

      repositoryCount:
        data.technology?.repositoryCount ?? 0,

      trackedRepositoryCount:
        data.technology?.trackedRepositoryCount ?? 0,

      architectureDomainCount:
        data.technology?.architectureDomainCount ?? 0,

      repositoryTypeCount:
        data.technology?.repositoryTypeCount ?? 0,

      capabilityCount:
        data.technology?.capabilityCount ?? 0,

      recommendationCount:
        data.technology?.recommendationCount ?? 0,

      firstDetectedAt:
        data.technology?.firstDetectedAt ?? null,

      lastDetectedAt:
        data.technology?.lastDetectedAt ?? null,
    },

    repositories: normalizeArray(data.repositories),

    architectureDomains: normalizeArray(
      data.architectureDomains
    ),

    repositoryTypes: normalizeArray(
      data.repositoryTypes
    ),

    capabilities: normalizeArray(data.capabilities),

    recommendations: normalizeArray(
      data.recommendations
    ),

    detectionHistory: normalizeArray(
      data.detectionHistory
    ),

    adoptionTimeline: normalizeArray(
      data.adoptionTimeline
    ),

    relatedTechnologies: normalizeArray(
      data.relatedTechnologies
    ),
  };
}

export const portfolioTechnologyService = {
  async getTechnologyOverview(
    userId: string
  ): Promise<TechnologyIntelligenceOverview> {
    const response = await api.get<
      ApiResponse<TechnologyIntelligenceOverview>
    >(`/users/${userId}/technologies`);

    return normalizeOverview(response.data.data);
  },

  async getTechnologyDetail(
    userId: string,
    technology: string
  ): Promise<TechnologyIntelligenceDetail> {
    const encodedTechnology =
      encodeURIComponent(technology);

    const response = await api.get<
      ApiResponse<TechnologyIntelligenceDetail>
    >(
      `/users/${userId}/technologies/${encodedTechnology}`
    );

    return normalizeDetail(response.data.data);
  },
};
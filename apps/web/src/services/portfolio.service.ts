import { api } from "@/lib/api";

import {
  PortfolioDistributionItem,
  PortfolioDistributions,
  PortfolioHighlightRepository,
  PortfolioHighlights,
  PortfolioRepository,
  UserPortfolioResponse,
} from "@/types/portfolio.types";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

function unwrapResponse<T>(payload: T | ApiEnvelope<T>): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload
  ) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}

function normalizeDistribution(value: unknown): PortfolioDistributionItem[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const record = item as Record<string, unknown>;

        const name =
          record.name ??
          record.label ??
          record.type ??
          record.language ??
          record.technology ??
          record.domain;

        const count =
          record.count ??
          record.value ??
          record.total ??
          record.repositories;

        if (typeof name !== "string") {
          return null;
        }

        const numericCount = Number(count);

        if (!Number.isFinite(numericCount)) {
          return null;
        }

        return {
          name,
          count: numericCount,
        };
      })
      .filter(
        (item): item is PortfolioDistributionItem =>
          item !== null
      )
      .sort((first, second) => second.count - first.count);
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([name, count]) => ({
        name,
        count: Number(count),
      }))
      .filter((item) => Number.isFinite(item.count))
      .sort((first, second) => second.count - first.count);
  }

  return [];
}

function normalizeHighlight(
  value: unknown
): PortfolioHighlightRepository | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  /*
   * The API may return the repository directly or wrap it in a repository
   * property together with a metric. The service normalises both forms so
   * presentation components receive one stable contract.
   */
  const repositoryValue =
    record.repository &&
    typeof record.repository === "object"
      ? (record.repository as Record<string, unknown>)
      : record;

  const id = repositoryValue.id;
  const name = repositoryValue.name;

  if (typeof id !== "string" || typeof name !== "string") {
    return null;
  }

  return {
    ...(repositoryValue as unknown as PortfolioRepository),

    metric:
      typeof record.metric === "number"
        ? record.metric
        : typeof record.value === "number"
          ? record.value
          : undefined,

    activityCount:
      typeof record.activityCount === "number"
        ? record.activityCount
        : undefined,

    recommendationCount:
      typeof record.recommendationCount === "number"
        ? record.recommendationCount
        : undefined,

    lastUpdatedAt:
      typeof record.lastUpdatedAt === "string"
        ? record.lastUpdatedAt
        : undefined,
  };
}

function normalizePortfolio(
  value: UserPortfolioResponse
): UserPortfolioResponse {
  const rawDistributions =
    value.distributions as unknown as Record<string, unknown>;

  const rawHighlights =
    value.highlights as unknown as Record<string, unknown>;

  const distributions: PortfolioDistributions = {
    languages: normalizeDistribution(rawDistributions?.languages),
    repositoryTypes: normalizeDistribution(
      rawDistributions?.repositoryTypes
    ),
    architectureDomains: normalizeDistribution(
      rawDistributions?.architectureDomains
    ),
    technologies: normalizeDistribution(
      rawDistributions?.technologies
    ),
  };

  const highlights: PortfolioHighlights = {
    mostStarredRepository: normalizeHighlight(
      rawHighlights?.mostStarredRepository
    ),

    mostActiveRepository: normalizeHighlight(
      rawHighlights?.mostActiveRepository
    ),

    mostRecentlyUpdatedRepository: normalizeHighlight(
      rawHighlights?.mostRecentlyUpdatedRepository
    ),

    repositoryWithMostRecommendations: normalizeHighlight(
      rawHighlights?.repositoryWithMostRecommendations
    ),
  };

  return {
    ...value,
    distributions,
    highlights,
    repositories: Array.isArray(value.repositories)
      ? value.repositories
      : [],
  };
}

export const portfolioService = {
  async getUserPortfolio(
    userId: string
  ): Promise<UserPortfolioResponse> {
    const response = await api.get<
      UserPortfolioResponse | ApiEnvelope<UserPortfolioResponse>
    >(`/users/${userId}/portfolio`);

    const payload = unwrapResponse(response.data);

    return normalizePortfolio(payload);
  },
};
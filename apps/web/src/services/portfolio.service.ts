import { api } from "@/lib/api";

import type {
  PortfolioDistributionItem,
  PortfolioDistributions,
  PortfolioHighlightRepository,
  PortfolioHighlights,
  PortfolioRepository,
  PortfolioRepositoryActivity,
  PortfolioTimelineActivity,
  PortfolioTimelineParams,
  PortfolioTimelineResponse,
  PortfolioTrendPeriod,
  PortfolioTrendPoint,
  PortfolioTrendsResponse,
  UserPortfolioResponse,
} from "@/types/portfolio.types";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

function normalizeRepositoryActivity(
  value: unknown,
): PortfolioRepositoryActivity | null {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
  }

  const record =
    value as Record<string, unknown>;

  const repository =
    record.repository &&
      typeof record.repository === "object"
      ? (record.repository as Record<string, unknown>)
      : null;

  const activity =
    record.activity &&
      typeof record.activity === "object"
      ? (record.activity as Record<string, unknown>)
      : null;

  if (!repository) {
    return null;
  }

  return {
    repositoryId:
      typeof repository.id === "string"
        ? repository.id
        : "",

    repositoryName:
      typeof repository.name === "string"
        ? repository.name
        : null,

    repositoryFullName:
      typeof repository.fullName === "string"
        ? repository.fullName
        : null,

    isTracked:
      typeof repository.isTracked === "boolean"
        ? repository.isTracked
        : undefined,

    totalActivity:
      Number(activity?.total ?? 0),

    engineeringEvents:
      Number(
        activity?.engineeringEvents ?? 0,
      ),

    timelineEntries:
      Number(
        activity?.timelineEntries ?? 0,
      ),

    architectureChanges:
      Number(
        activity?.architectureChanges ?? 0,
      ),

    recommendations:
      Number(
        activity?.recommendations ?? 0,
      ),
  };
}

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
          record.domain ??
          record.status;

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

  const record =
    value as Record<string, unknown>;

  const repositoryValue =
    record.repository &&
      typeof record.repository === "object"
      ? (
        record.repository as Record<
          string,
          unknown
        >
      )
      : record;

  /*
   * Portfolio highlight metrics are returned separately from the
   * repository identity.
   *
   * In particular, the backend may group operational metrics under
   * `counts`, so preserve those values when normalising the response
   * instead of allowing the UI to fall back to zero.
   */
  const counts =
    record.counts &&
      typeof record.counts === "object"
      ? (
        record.counts as Record<
          string,
          unknown
        >
      )
      : null;

  if (
    typeof repositoryValue.id !== "string" ||
    typeof repositoryValue.name !== "string"
  ) {
    return null;
  }

  return {
    ...(
      repositoryValue as unknown as PortfolioRepository
    ),

    metric:
      typeof record.metric === "number"
        ? record.metric
        : typeof record.value === "number"
          ? record.value
          : undefined,

    activityCount:
      typeof record.activityCount === "number"
        ? record.activityCount
        : typeof counts?.engineeringEvents ===
          "number"
          ? counts.engineeringEvents
          : undefined,

    recommendationCount:
      typeof record.recommendationCount ===
        "number"
        ? record.recommendationCount
        : typeof counts?.activeRecommendations ===
          "number"
          ? counts.activeRecommendations
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

function normalizeTimelineActivity(
  value: unknown
): PortfolioTimelineActivity[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is PortfolioTimelineActivity =>
        Boolean(
          item &&
          typeof item === "object" &&
          "id" in item &&
          "type" in item &&
          "createdAt" in item
        )
    )
    .sort((first, second) => {
      return (
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime()
      );
    });
}

function normalizeTrend(value: unknown): PortfolioTrendPoint[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;

      const date =
        record.date ??
        record.day ??
        record.period ??
        record.label;

      if (typeof date !== "string") {
        return null;
      }

      const engineeringEvents = Number(
        record.engineeringEvents ?? record.events ?? 0
      );

      const timelineEntries = Number(
        record.timelineEntries ?? record.timeline ?? 0
      );

      const architectureChanges = Number(
        record.architectureChanges ?? record.architecture ?? 0
      );

      const recommendations = Number(
        record.recommendations ?? 0
      );

      const totalActivity = Number(
        record.totalActivity ??
        engineeringEvents +
        timelineEntries +
        architectureChanges +
        recommendations
      );

      return {
        date,
        totalActivity,
        engineeringEvents,
        timelineEntries,
        architectureChanges,
        recommendations,
      };
    })
    .filter(
      (item): item is PortfolioTrendPoint =>
        item !== null
    );
}

function normalizeTrends(
  value: PortfolioTrendsResponse
): PortfolioTrendsResponse {
  const distributions =
    value.distributions as unknown as Record<string, unknown>;

  return {
    ...value,

    trend: normalizeTrend(value.trend),

    repositoryActivity: Array.isArray(
      value.repositoryActivity,
    )
      ? value.repositoryActivity
        .map(normalizeRepositoryActivity)
        .filter(
          (
            item,
          ): item is PortfolioRepositoryActivity =>
            item !== null,
        )
      : [],

    distributions: {
      technologies: normalizeDistribution(
        distributions?.technologies
      ),

      architectureDomains: normalizeDistribution(
        distributions?.architectureDomains
      ),

      repositoryTypes: normalizeDistribution(
        distributions?.repositoryTypes
      ),

      languages: normalizeDistribution(
        distributions?.languages
      ),

      engineeringEventTypes: normalizeDistribution(
        distributions?.engineeringEventTypes
      ),

      recommendationStatuses: normalizeDistribution(
        distributions?.recommendationStatuses
      ),
    },

    highlights: {
      mostActiveRepository:
        normalizeRepositoryActivity(
          value.highlights
            ?.mostActiveRepository,
        ),

      leastActiveRepository:
        normalizeRepositoryActivity(
          value.highlights
            ?.leastActiveRepository,
        ),

      inactiveTrackedRepositories:
        Array.isArray(
          value.highlights
            ?.inactiveTrackedRepositories,
        )
          ? value.highlights.inactiveTrackedRepositories
            .map(
              normalizeRepositoryActivity,
            )
            .filter(
              (
                item,
              ): item is PortfolioRepositoryActivity =>
                item !== null,
            )
          : [],
    },
  };
}

export const portfolioService = {
  async getUserPortfolio(
    userId: string
  ): Promise<UserPortfolioResponse> {
    const response = await api.get<
      UserPortfolioResponse | ApiEnvelope<UserPortfolioResponse>
    >(`/users/${userId}/portfolio`);

    return normalizePortfolio(
      unwrapResponse(response.data)
    );
  },

  async getPortfolioTimeline(
    userId: string,
    params?: PortfolioTimelineParams
  ): Promise<PortfolioTimelineResponse> {
    const response = await api.get<
      PortfolioTimelineResponse |
      ApiEnvelope<PortfolioTimelineResponse>
    >(`/users/${userId}/portfolio/timeline`, {
      params: {
        page: params?.page,
        limit: params?.limit,
        repositoryId:
          params?.repositoryId || undefined,
        activityType:
          params?.activityType || undefined,
      },
    });

    const payload = unwrapResponse(response.data);

    return {
      ...payload,
      activity: normalizeTimelineActivity(payload.activity),
    };
  },

  async getPortfolioTrends(
    userId: string,
    period: PortfolioTrendPeriod
  ): Promise<PortfolioTrendsResponse> {
    const response = await api.get<
      PortfolioTrendsResponse |
      ApiEnvelope<PortfolioTrendsResponse>
    >(`/users/${userId}/portfolio/trends`, {
      params: {
        period,
      },
    });

    return normalizeTrends(
      unwrapResponse(response.data)
    );
  },
};
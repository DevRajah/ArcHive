import { prisma } from "@archive/database";

type GetPortfolioTimelineParams = {
  userId: string;
  page?: number;
  limit?: number;
  repositoryId?: string;
  activityType?: PortfolioActivityType;
};

type PortfolioActivityType =
  | "TIMELINE"
  | "ENGINEERING_EVENT"
  | "ARCHITECTURE_CHANGE"
  | "RECOMMENDATION";

type PortfolioTimelineItem = {
  id: string;
  type: PortfolioActivityType;
  action: string | null;
  title: string;
  description: string;
  createdAt: Date;
  repository: {
    id: string;
    name: string;
    fullName: string;
  };
  metadata: Record<string, unknown> | null;
};

const normalizePagination = ({
  page = 1,
  limit = 30,
}: {
  page?: number;
  limit?: number;
}) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 100);

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
};

const formatEnumLabel = (value: string) => {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const portfolioTimelineService = {
  async getTimeline(params: GetPortfolioTimelineParams) {
    const { page, limit, skip } = normalizePagination(params);

    const user = await prisma.user.findUnique({
      where: {
        id: params.userId,
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return null;
    }

    const repositoryWhere = {
      userId: params.userId,
      ...(params.repositoryId
        ? {
            id: params.repositoryId,
          }
        : {}),
    };

    /*
     * Each activity source is queried independently because ArcHive currently
     * stores repository history across several specialised tables.
     *
     * The service normalises those records into one chronological portfolio
     * feed without changing the existing repository-level data model.
     */
    const [
      timelineEntries,
      engineeringEvents,
      architectureChanges,
      recommendations,
    ] = await Promise.all([
      params.activityType && params.activityType !== "TIMELINE"
        ? Promise.resolve([])
        : prisma.timelineEntry.findMany({
            where: {
              repository: repositoryWhere,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: skip + limit,
            select: {
              id: true,
              title: true,
              summary: true,
              importanceScore: true,
              generatedByAI: true,
              createdAt: true,
              repository: {
                select: {
                  id: true,
                  name: true,
                  fullName: true,
                },
              },
            },
          }),

      params.activityType && params.activityType !== "ENGINEERING_EVENT"
        ? Promise.resolve([])
        : prisma.engineeringEvent.findMany({
            where: {
              repository: repositoryWhere,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: skip + limit,
            select: {
              id: true,
              eventType: true,
              source: true,
              status: true,
              occurredAt: true,
              createdAt: true,
              repository: {
                select: {
                  id: true,
                  name: true,
                  fullName: true,
                },
              },
            },
          }),

      params.activityType && params.activityType !== "ARCHITECTURE_CHANGE"
        ? Promise.resolve([])
        : prisma.architectureChange.findMany({
            where: {
              repository: repositoryWhere,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: skip + limit,
            select: {
              id: true,
              changeType: true,
              detectedTechnology: true,
              fileAffected: true,
              summary: true,
              architectureDomain: true,
              evolutionSummary: true,
              createdAt: true,
              repository: {
                select: {
                  id: true,
                  name: true,
                  fullName: true,
                },
              },
            },
          }),

      params.activityType && params.activityType !== "RECOMMENDATION"
        ? Promise.resolve([])
        : prisma.engineeringRecommendation.findMany({
            where: {
              repository: repositoryWhere,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: skip + limit,
            select: {
              id: true,
              recommendationKey: true,
              title: true,
              description: true,
              status: true,
              evidence: true,
              resolvedAt: true,
              createdAt: true,
              repository: {
                select: {
                  id: true,
                  name: true,
                  fullName: true,
                },
              },
            },
          }),
    ]);

    const activity: PortfolioTimelineItem[] = [
      ...timelineEntries.map((entry) => ({
        id: `timeline-${entry.id}`,
        type: "TIMELINE" as const,
        action: null,
        title: entry.title,
        description: entry.summary,
        createdAt: entry.createdAt,
        repository: entry.repository,
        metadata: {
          importanceScore: entry.importanceScore,
          generatedByAI: entry.generatedByAI,
        },
      })),

      ...engineeringEvents.map((event) => ({
        id: `event-${event.id}`,
        type: "ENGINEERING_EVENT" as const,
        action: event.eventType,
        title: formatEnumLabel(event.eventType),
        description: `${event.source} engineering event processed with status ${formatEnumLabel(
          event.status
        )}.`,
        createdAt: event.createdAt,
        repository: event.repository,
        metadata: {
          source: event.source,
          status: event.status,
          occurredAt: event.occurredAt,
        },
      })),

      ...architectureChanges.map((change) => ({
        id: `architecture-${change.id}`,
        type: "ARCHITECTURE_CHANGE" as const,
        action: change.changeType,
        title: formatEnumLabel(change.changeType),
        description: change.summary,
        createdAt: change.createdAt,
        repository: change.repository,
        metadata: {
          detectedTechnology: change.detectedTechnology,
          fileAffected: change.fileAffected,
          architectureDomain: change.architectureDomain,
          evolutionSummary: change.evolutionSummary,
        },
      })),

      ...recommendations.map((recommendation) => ({
        id: `recommendation-${recommendation.id}`,
        type: "RECOMMENDATION" as const,
        action: recommendation.status,
        title: recommendation.title,
        description: recommendation.description,
        createdAt: recommendation.createdAt,
        repository: recommendation.repository,
        metadata: {
          recommendationKey: recommendation.recommendationKey,
          status: recommendation.status,
          evidence: recommendation.evidence,
          resolvedAt: recommendation.resolvedAt,
        },
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(skip, skip + limit);

    const [
      totalTimelineEntries,
      totalEngineeringEvents,
      totalArchitectureChanges,
      totalRecommendations,
    ] = await Promise.all([
      prisma.timelineEntry.count({
        where: {
          repository: repositoryWhere,
        },
      }),

      prisma.engineeringEvent.count({
        where: {
          repository: repositoryWhere,
        },
      }),

      prisma.architectureChange.count({
        where: {
          repository: repositoryWhere,
        },
      }),

      prisma.engineeringRecommendation.count({
        where: {
          repository: repositoryWhere,
        },
      }),
    ]);

    const totalsByType = {
      TIMELINE: totalTimelineEntries,
      ENGINEERING_EVENT: totalEngineeringEvents,
      ARCHITECTURE_CHANGE: totalArchitectureChanges,
      RECOMMENDATION: totalRecommendations,
    };

    const totalItems = params.activityType
      ? totalsByType[params.activityType]
      : Object.values(totalsByType).reduce(
          (total, count) => total + count,
          0
        );

    return {
      user,
      activity,
      filters: {
        repositoryId: params.repositoryId || null,
        activityType: params.activityType || null,
      },
      totals: {
        all: Object.values(totalsByType).reduce(
          (total, count) => total + count,
          0
        ),
        ...totalsByType,
      },
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  },
};
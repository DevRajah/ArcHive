import { prisma } from "@archive/database";

type PortfolioTrendPeriod = "7d" | "30d" | "90d" | "1y";

type GetPortfolioTrendsParams = {
  userId: string;
  period?: PortfolioTrendPeriod;
};

type DailyTrendPoint = {
  date: string;
  engineeringEvents: number;
  timelineEntries: number;
  architectureChanges: number;
  recommendations: number;
};

const getPeriodStartDate = (period: PortfolioTrendPeriod) => {
  const date = new Date();

  if (period === "7d") {
    date.setDate(date.getDate() - 6);
  }

  if (period === "30d") {
    date.setDate(date.getDate() - 29);
  }

  if (period === "90d") {
    date.setDate(date.getDate() - 89);
  }

  if (period === "1y") {
    date.setFullYear(date.getFullYear() - 1);
  }

  date.setHours(0, 0, 0, 0);

  return date;
};

const toDateKey = (date: Date) => {
  return date.toISOString().slice(0, 10);
};

const increment = (map: Map<string, number>, key?: string | null) => {
  const normalizedKey = key?.trim();

  if (!normalizedKey) {
    return;
  }

  map.set(normalizedKey, (map.get(normalizedKey) || 0) + 1);
};

const toCountArray = (map: Map<string, number>) => {
  return Array.from(map.entries())
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return a.name.localeCompare(b.name);
    });
};

const splitStoredList = (value?: string | null) => {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const createDailyTrendPoints = (
  startDate: Date,
  endDate: Date
): Map<string, DailyTrendPoint> => {
  const points = new Map<string, DailyTrendPoint>();
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const key = toDateKey(cursor);

    points.set(key, {
      date: key,
      engineeringEvents: 0,
      timelineEntries: 0,
      architectureChanges: 0,
      recommendations: 0,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return points;
};

export const portfolioTrendsService = {
  async getTrends({
    userId,
    period = "30d",
  }: GetPortfolioTrendsParams) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
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

    const startDate = getPeriodStartDate(period);
    const endDate = new Date();

    const repositories = await prisma.repository.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        language: true,
        isTracked: true,
        updatedAt: true,

        events: {
          where: {
            createdAt: {
              gte: startDate,
            },
          },
          select: {
            eventType: true,
            status: true,
            createdAt: true,
          },
        },

        timelineEntries: {
          where: {
            createdAt: {
              gte: startDate,
            },
          },
          select: {
            createdAt: true,
          },
        },

        architectureChanges: {
          where: {
            createdAt: {
              gte: startDate,
            },
          },
          select: {
            architectureDomain: true,
            detectedTechnology: true,
            repositoryTypes: true,
            createdAt: true,
          },
        },

        engineeringRecommendations: {
          where: {
            createdAt: {
              gte: startDate,
            },
          },
          select: {
            status: true,
            createdAt: true,
          },
        },
      },
    });

    const dailyPoints = createDailyTrendPoints(startDate, endDate);
    const technologyCounts = new Map<string, number>();
    const architectureDomainCounts = new Map<string, number>();
    const repositoryTypeCounts = new Map<string, number>();
    const languageCounts = new Map<string, number>();
    const eventTypeCounts = new Map<string, number>();
    const recommendationStatusCounts = new Map<string, number>();

    const repositoryActivity = repositories.map((repository) => {
      increment(languageCounts, repository.language || "Unknown");

      repository.events.forEach((event) => {
        const dateKey = toDateKey(event.createdAt);
        const point = dailyPoints.get(dateKey);

        if (point) {
          point.engineeringEvents += 1;
        }

        increment(eventTypeCounts, event.eventType);
      });

      repository.timelineEntries.forEach((entry) => {
        const dateKey = toDateKey(entry.createdAt);
        const point = dailyPoints.get(dateKey);

        if (point) {
          point.timelineEntries += 1;
        }
      });

      repository.architectureChanges.forEach((change) => {
        const dateKey = toDateKey(change.createdAt);
        const point = dailyPoints.get(dateKey);

        if (point) {
          point.architectureChanges += 1;
        }

        increment(
          architectureDomainCounts,
          change.architectureDomain
        );

        increment(technologyCounts, change.detectedTechnology);

        splitStoredList(change.repositoryTypes).forEach(
          (repositoryType) => {
            increment(repositoryTypeCounts, repositoryType);
          }
        );
      });

      repository.engineeringRecommendations.forEach(
        (recommendation) => {
          const dateKey = toDateKey(recommendation.createdAt);
          const point = dailyPoints.get(dateKey);

          if (point) {
            point.recommendations += 1;
          }

          increment(
            recommendationStatusCounts,
            recommendation.status
          );
        }
      );

      const engineeringEvents = repository.events.length;
      const timelineEntries = repository.timelineEntries.length;
      const architectureChanges =
        repository.architectureChanges.length;
      const recommendations =
        repository.engineeringRecommendations.length;

      const totalActivity =
        engineeringEvents +
        timelineEntries +
        architectureChanges +
        recommendations;

      return {
        repository: {
          id: repository.id,
          name: repository.name,
          fullName: repository.fullName,
          language: repository.language,
          isTracked: repository.isTracked,
          updatedAt: repository.updatedAt,
        },
        activity: {
          total: totalActivity,
          engineeringEvents,
          timelineEntries,
          architectureChanges,
          recommendations,
        },
      };
    });

    const sortedRepositoryActivity = repositoryActivity.sort(
      (a, b) => b.activity.total - a.activity.total
    );

    const trackedRepositories = repositories.filter(
      (repository) => repository.isTracked
    );

    const inactiveTrackedRepositories = trackedRepositories
      .filter((repository) => {
        const hasRecentActivity =
          repository.events.length > 0 ||
          repository.timelineEntries.length > 0 ||
          repository.architectureChanges.length > 0 ||
          repository.engineeringRecommendations.length > 0;

        return !hasRecentActivity;
      })
      .map((repository) => ({
        id: repository.id,
        name: repository.name,
        fullName: repository.fullName,
        updatedAt: repository.updatedAt,
      }));

    const trend = Array.from(dailyPoints.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const totals = trend.reduce(
      (summary, point) => {
        summary.engineeringEvents += point.engineeringEvents;
        summary.timelineEntries += point.timelineEntries;
        summary.architectureChanges += point.architectureChanges;
        summary.recommendations += point.recommendations;
        summary.totalActivity +=
          point.engineeringEvents +
          point.timelineEntries +
          point.architectureChanges +
          point.recommendations;

        return summary;
      },
      {
        engineeringEvents: 0,
        timelineEntries: 0,
        architectureChanges: 0,
        recommendations: 0,
        totalActivity: 0,
      }
    );

    return {
      user,
      period,
      dateRange: {
        startDate,
        endDate,
      },
      totals,
      trend,
      distributions: {
        technologies: toCountArray(technologyCounts),
        architectureDomains: toCountArray(
          architectureDomainCounts
        ),
        repositoryTypes: toCountArray(repositoryTypeCounts),
        languages: toCountArray(languageCounts),
        engineeringEventTypes: toCountArray(eventTypeCounts),
        recommendationStatuses: toCountArray(
          recommendationStatusCounts
        ),
      },
      repositoryActivity: sortedRepositoryActivity,
      highlights: {
        mostActiveRepository:
          sortedRepositoryActivity[0] || null,
        leastActiveRepository:
          sortedRepositoryActivity.length > 0
            ? sortedRepositoryActivity[
                sortedRepositoryActivity.length - 1
              ]
            : null,
        inactiveTrackedRepositories,
        activeRepositoryCount: repositoryActivity.filter(
          (item) => item.activity.total > 0
        ).length,
        inactiveRepositoryCount: repositoryActivity.filter(
          (item) => item.activity.total === 0
        ).length,
      },
    };
  },
};
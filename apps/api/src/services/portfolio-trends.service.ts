import { prisma } from "@archive/database";
import {
  extractCanonicalRepositoryIntelligenceSignals,
} from "./canonical-repository-intelligence-signals.service";

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

/**
 * Returns the beginning of the selected reporting period in UTC.
 *
 * Future me:
 * Trend keys are generated with toISOString(), which is UTC.
 * The period boundaries therefore need to use UTC as well.
 *
 * Mixing local midnight with UTC date keys caused records to exist in the
 * repository activity totals but fail to find their corresponding daily
 * trend bucket.
 */
const getPeriodStartDate = (
  period: PortfolioTrendPeriod
) => {
  const date = new Date();

  if (period === "7d") {
    date.setUTCDate(date.getUTCDate() - 6);
  }

  if (period === "30d") {
    date.setUTCDate(date.getUTCDate() - 29);
  }

  if (period === "90d") {
    date.setUTCDate(date.getUTCDate() - 89);
  }

  if (period === "1y") {
    date.setUTCFullYear(date.getUTCFullYear() - 1);
  }

  date.setUTCHours(0, 0, 0, 0);

  return date;
};

/**
 * Convert every date into the same UTC YYYY-MM-DD key used by the trend map.
 */
const toDateKey = (date: Date) => {
  return date.toISOString().slice(0, 10);
};

const increment = (
  map: Map<string, number>,
  key?: string | null
) => {
  const normalizedKey = key?.trim();

  if (!normalizedKey) {
    return;
  }

  map.set(
    normalizedKey,
    (map.get(normalizedKey) || 0) + 1
  );
};

const toCountArray = (
  map: Map<string, number>
) => {
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

/**
 * Create one UTC bucket for every calendar day in the selected period,
 * including the current day.
 *
 * Future me:
 * Do not switch this back to setDate(). The bucket keys use UTC, so the
 * cursor must also advance in UTC.
 */
const createDailyTrendPoints = (
  startDate: Date,
  endDate: Date
): Map<string, DailyTrendPoint> => {
  const points =
    new Map<string, DailyTrendPoint>();

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

    cursor.setUTCDate(
      cursor.getUTCDate() + 1
    );
  }

  return points;
};

export const portfolioTrendsService = {
  async getTrends({
    userId,
    period = "30d",
  }: GetPortfolioTrendsParams) {
    const user =
      await prisma.user.findUnique({
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

    const startDate =
      getPeriodStartDate(period);

    /**
     * Capture one end time for the entire report.
     *
     * This keeps the returned date range and all period-scoped queries
     * aligned to the same closed interval.
     */
    const endDate = new Date();

    const repositories =
      await prisma.repository.findMany({
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

          /**
           * Current repository composition belongs to the latest canonical
           * intelligence snapshot.
           *
           * Future me:
           * Do not rebuild technologies, architecture domains, or repository
           * types from ArchitectureChange rows below. Those rows describe
           * historical engineering activity, not current repository truth.
           */
          intelligenceSnapshots: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            select: {
              primaryRepositoryType: true,
              repositoryTypes: true,
              technologies: true,
              architectureDomains: true,
              capabilities: true,
              intelligence: true,
            },
          },

          events: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
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
                lte: endDate,
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
                lte: endDate,
              },
            },
            select: {
              reasoningSignals: true,
              createdAt: true,
            },
          },

          engineeringRecommendations: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            select: {
              status: true,
              createdAt: true,
            },
          },
        },
      });

    const dailyPoints =
      createDailyTrendPoints(
        startDate,
        endDate
      );

    /**
     * These distributions describe CURRENT portfolio composition.
     *
     * Each repository contributes its canonical snapshot signals once.
     * Historical ArchitectureChange records must not inflate these counts.
     */
    const technologyCounts =
      new Map<string, number>();

    const architectureDomainCounts =
      new Map<string, number>();

    const repositoryTypeCounts =
      new Map<string, number>();

    const languageCounts =
      new Map<string, number>();

    /**
     * These distributions are historical activity distributions.
     *
     * Event types and recommendation statuses are intentionally derived from
     * records created inside the selected reporting period.
     */
    const eventTypeCounts =
      new Map<string, number>();

    const recommendationStatusCounts =
      new Map<string, number>();

    /**
     * Repository activity and daily trend are built from the same
     * period-filtered records.
     *
     * This gives us a useful invariant:
     *
     * repository activity totals
     * =
     * daily trend totals
     */
    const repositoryActivity =
      repositories.map((repository) => {
        /**
         * Language is current repository metadata, not an activity event.
         */
        increment(
          languageCounts,
          repository.language || "Unknown"
        );

        /**
         * Read CURRENT repository composition from the newest canonical
         * intelligence snapshot.
         */
        const latestSnapshot =
          repository.intelligenceSnapshots[0] ||
          null;

        if (latestSnapshot) {
          const canonicalSignals =
            extractCanonicalRepositoryIntelligenceSignals({
              latestSnapshot,

              /**
               * No ArchitectureChange fallback is required for current
               * portfolio composition.
               *
               * If a canonical snapshot exists, that snapshot owns current
               * repository truth.
               */
              architectureChanges: [],
            });

          canonicalSignals.repositoryTypes.forEach(
            (repositoryType) => {
              increment(
                repositoryTypeCounts,
                repositoryType
              );
            }
          );

          canonicalSignals.technologies.forEach(
            (technology) => {
              increment(
                technologyCounts,
                technology
              );
            }
          );

          canonicalSignals.domains.forEach(
            (domain) => {
              increment(
                architectureDomainCounts,
                domain
              );
            }
          );
        }

        repository.events.forEach(
          (event) => {
            const dateKey =
              toDateKey(event.createdAt);

            const point =
              dailyPoints.get(dateKey);

            if (point) {
              point.engineeringEvents += 1;
            }

            increment(
              eventTypeCounts,
              event.eventType
            );
          }
        );

        repository.timelineEntries.forEach(
          (entry) => {
            const dateKey =
              toDateKey(entry.createdAt);

            const point =
              dailyPoints.get(dateKey);

            if (point) {
              point.timelineEntries += 1;
            }
          }
        );

        /**
         * ArchitectureChange remains historical activity.
         *
         * We count that a change happened on a particular day, but we do NOT
         * use its technology/domain/type fields to describe current portfolio
         * composition.
         */
        repository.architectureChanges.forEach(
          (change) => {
            const dateKey =
              toDateKey(change.createdAt);

            const point =
              dailyPoints.get(dateKey);

            if (point) {
              point.architectureChanges += 1;
            }
          }
        );

        repository.engineeringRecommendations.forEach(
          (recommendation) => {
            const dateKey =
              toDateKey(
                recommendation.createdAt
              );

            const point =
              dailyPoints.get(dateKey);

            if (point) {
              point.recommendations += 1;
            }

            /**
             * This describes the current status of recommendations created
             * inside the selected reporting period.
             */
            increment(
              recommendationStatusCounts,
              recommendation.status
            );
          }
        );

        const engineeringEvents =
          repository.events.length;

        const timelineEntries =
          repository.timelineEntries.length;

        const architectureChanges =
          repository.architectureChanges.length;

        const recommendations =
          repository.engineeringRecommendations
            .length;

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
            isTracked:
              repository.isTracked,
            updatedAt:
              repository.updatedAt,
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

    const sortedRepositoryActivity = [
      ...repositoryActivity,
    ].sort(
      (a, b) =>
        b.activity.total -
        a.activity.total
    );

    const trackedRepositories =
      repositories.filter(
        (repository) =>
          repository.isTracked
      );

    /**
     * "Inactive tracked" means no activity of any measured historical type
     * occurred during the selected reporting period.
     */
    const inactiveTrackedRepositories =
      trackedRepositories
        .filter((repository) => {
          const hasRecentActivity =
            repository.events.length > 0 ||
            repository.timelineEntries.length >
              0 ||
            repository.architectureChanges
              .length > 0 ||
            repository
              .engineeringRecommendations
              .length > 0;

          return !hasRecentActivity;
        })
        .map((repository) => ({
          id: repository.id,
          name: repository.name,
          fullName: repository.fullName,
          updatedAt: repository.updatedAt,
        }));

    const trend = Array.from(
      dailyPoints.values()
    ).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    /**
     * Totals deliberately come from the daily trend.
     *
     * Important analytics invariant:
     *
     * sum(all daily buckets) === top-level totals
     *
     * Repository activity independently arrives at the same totals because
     * both calculations use the same period-filtered records.
     */
    const totals = trend.reduce(
      (summary, point) => {
        summary.engineeringEvents +=
          point.engineeringEvents;

        summary.timelineEntries +=
          point.timelineEntries;

        summary.architectureChanges +=
          point.architectureChanges;

        summary.recommendations +=
          point.recommendations;

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

      /**
       * Composition versus activity:
       *
       * technologies       -> current canonical composition
       * architectureDomains -> current canonical composition
       * repositoryTypes    -> current canonical composition
       * languages          -> current repository metadata
       *
       * engineeringEventTypes   -> period activity
       * recommendationStatuses  -> period activity
       */
      distributions: {
        technologies:
          toCountArray(
            technologyCounts
          ),

        architectureDomains:
          toCountArray(
            architectureDomainCounts
          ),

        repositoryTypes:
          toCountArray(
            repositoryTypeCounts
          ),

        languages:
          toCountArray(
            languageCounts
          ),

        engineeringEventTypes:
          toCountArray(
            eventTypeCounts
          ),

        recommendationStatuses:
          toCountArray(
            recommendationStatusCounts
          ),
      },

      repositoryActivity:
        sortedRepositoryActivity,

      highlights: {
        mostActiveRepository:
          sortedRepositoryActivity[0] ||
          null,

        leastActiveRepository:
          sortedRepositoryActivity.length >
          0
            ? sortedRepositoryActivity[
                sortedRepositoryActivity.length -
                  1
              ]
            : null,

        inactiveTrackedRepositories,

        activeRepositoryCount:
          repositoryActivity.filter(
            (item) =>
              item.activity.total > 0
          ).length,

        inactiveRepositoryCount:
          repositoryActivity.filter(
            (item) =>
              item.activity.total === 0
          ).length,
      },
    };
  },
};
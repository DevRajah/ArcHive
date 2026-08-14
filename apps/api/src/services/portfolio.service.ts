import { prisma } from "@archive/database";

import {
  GENERATED_CHANGE_TYPE,
} from "../constants/intelligence.constants";

import {
  extractCanonicalRepositoryIntelligenceSignals,
} from "./canonical-repository-intelligence-signals.service";

import {
  buildCanonicalPortfolioDistributions,
} from "./portfolio-canonical-aggregation";

type CountItem = {
  name: string;
  count: number;
};

/**
 * Increment one portfolio distribution bucket.
 *
 * Future me:
 * Portfolio counts represent repository coverage, not the number of raw
 * detector occurrences. Callers should therefore deduplicate a repository's
 * signals before passing them here.
 */
const incrementCount = (
  map: Map<string, number>,
  value?: string | null,
  fallback?: string,
) => {
  const normalizedValue =
    value?.trim() || fallback;

  if (!normalizedValue) {
    return;
  }

  map.set(
    normalizedValue,
    (map.get(normalizedValue) || 0) + 1,
  );
};

/**
 * Keep portfolio distributions deterministic.
 *
 * Highest repository coverage comes first.
 * Alphabetical ordering is used when counts are equal.
 */
const toSortedCountArray = (
  map: Map<string, number>,
): CountItem[] => {
  return Array.from(
    map.entries(),
  )
    .map(
      ([name, count]) => ({
        name,
        count,
      }),
    )
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return a.name.localeCompare(
        b.name,
      );
    });
};

const getPercentage = (
  value: number,
  total: number,
) => {
  if (total === 0) {
    return 0;
  }

  return Math.round(
    (value / total) * 100,
  );
};

export const portfolioService = {
  async getUserPortfolio(
    userId: string,
  ) {
    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
          username: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

    if (!user) {
      return null;
    }

    const repositories =
      await prisma.repository.findMany({
        where: {
          userId,
        },

        orderBy: {
          updatedAt: "desc",
        },

        select: {
          id: true,
          name: true,
          owner: true,
          fullName: true,
          description: true,
          language: true,
          stars: true,
          forks: true,
          isTracked: true,
          createdAt: true,
          updatedAt: true,

          /**
           * Keep only the latest generated ArchitectureChange here.
           *
           * This row is historical/evolution context only.
           *
           * It is NOT the source of truth for current repository types,
           * architecture domains, technologies, or capabilities.
           */
          architectureChanges: {
            where: {
              changeType:
                GENERATED_CHANGE_TYPE,
            },

            orderBy: {
              createdAt: "desc",
            },

            take: 1,

            select: {
              repositoryTypes: true,
              architectureDomain: true,
              detectedTechnology: true,
              reasoningSignals: true,
              evolutionSummary: true,
              createdAt: true,
            },
          },

          /**
           * Current repository intelligence comes from the newest canonical
           * RepositoryIntelligenceSnapshot.
           *
           * Future me:
           * Do not replace this with ArchitectureChange aggregation.
           * ArchitectureChange describes repository history. This snapshot
           * describes what ArcHive currently believes about the repository.
           */
          intelligenceSnapshots: {
            orderBy: [
              {
                createdAt: "desc",
              },
              {
                id: "desc",
              },
            ],

            take: 1,

            select: {
              primaryRepositoryType:
                true,

              repositoryTypes:
                true,

              technologies:
                true,

              architectureDomains:
                true,

              capabilities:
                true,

              intelligence:
                true,

              createdAt:
                true,
            },
          },

          engineeringRecommendations: {
            select: {
              status: true,
            },
          },

          _count: {
            select: {
              events: true,
              timelineEntries: true,
              architectureChanges: true,
              engineeringRecommendations:
                true,
            },
          },
        },
      });

    const languageCounts =
      new Map<string, number>();


    let trackedRepositories = 0;
    let repositoriesWithIntelligence = 0;

    let totalStars = 0;
    let totalForks = 0;

    let totalEngineeringEvents = 0;
    let totalTimelineEntries = 0;
    let totalArchitectureChanges = 0;

    let totalRecommendations = 0;
    let activeRecommendations = 0;

    const canonicalPortfolioSignals: {
      repositoryTypes: string[];
      architectureDomains: string[];
      technologies: string[];
    }[] = [];

    const repositorySummaries =
      repositories.map(
        (repository) => {
          /**
           * Snapshot = current repository truth.
           *
           * Generated ArchitectureChange = historical context.
           */
          const latestSnapshot =
            repository
              .intelligenceSnapshots[0] ||
            null;

          const latestGeneratedChange =
            repository
              .architectureChanges[0] ||
            null;

          /**
           * Repositories without a canonical snapshot remain visible in the
           * Engineering Portfolio, but they contribute no fabricated current
           * intelligence signals.
           */
          const canonicalSignals =
            latestSnapshot
              ? extractCanonicalRepositoryIntelligenceSignals(
                {
                  latestSnapshot,

                  /**
                   * Historical reasoning can still be used by the canonical
                   * helper as a compatibility fallback for older snapshots.
                   *
                   * It must never replace canonical domains or technologies.
                   */
                  architectureChanges:
                    latestGeneratedChange
                      ? [
                        {
                          reasoningSignals:
                            latestGeneratedChange.reasoningSignals,
                        },
                      ]
                      : [],
                },
              )
              : null;

          const repositoryTypes =
            canonicalSignals
              ?.repositoryTypes ?? [];

          const architectureDomains =
            canonicalSignals
              ?.domains ?? [];

          const technologies =
            canonicalSignals
              ?.technologies ?? [];

          /**
 * Only repositories with canonical intelligence contribute current
 * engineering signals to portfolio distributions.
 */
          if (latestSnapshot) {
            canonicalPortfolioSignals.push({
              repositoryTypes,
              architectureDomains,
              technologies,
            });
          }

          if (
            repository.isTracked
          ) {
            trackedRepositories += 1;
          }

          /**
           * Portfolio intelligence coverage means:
           *
           * "Does this repository have current canonical intelligence?"
           *
           * It no longer means:
           *
           * "Does this repository have a generated ArchitectureChange row?"
           */
          if (latestSnapshot) {
            repositoriesWithIntelligence +=
              1;
          }

          totalStars +=
            repository.stars;

          totalForks +=
            repository.forks;

          totalEngineeringEvents +=
            repository._count.events;

          totalTimelineEntries +=
            repository._count
              .timelineEntries;

          totalArchitectureChanges +=
            repository._count
              .architectureChanges;

          totalRecommendations +=
            repository._count
              .engineeringRecommendations;

          const repositoryActiveRecommendations =
            repository.engineeringRecommendations.filter(
              (recommendation) =>
                recommendation.status ===
                "ACTIVE",
            ).length;

          activeRecommendations +=
            repositoryActiveRecommendations;

          /**
           * Language remains repository metadata rather than intelligence,
           * so it is counted independently of snapshot availability.
           */
          incrementCount(
            languageCounts,
            repository.language,
            "Unknown",
          );

          /**
           * Distribution semantics:
           *
           * count = number of repositories containing this current signal.
           *
           * A repository contributes at most one count to any particular
           * repository type, domain, or technology.
           */

          return {
            id:
              repository.id,

            name:
              repository.name,

            owner:
              repository.owner,

            fullName:
              repository.fullName,

            description:
              repository.description,

            language:
              repository.language,

            stars:
              repository.stars,

            forks:
              repository.forks,

            isTracked:
              repository.isTracked,

            createdAt:
              repository.createdAt,

            updatedAt:
              repository.updatedAt,

            intelligence: {
              /**
               * Prefer the dedicated canonical primary type.
               *
               * repositoryTypes[0] remains a compatibility fallback for older
               * snapshots that may not have primaryRepositoryType populated.
               */
              primaryRepositoryType:
                latestSnapshot
                  ?.primaryRepositoryType ??
                repositoryTypes[0] ??
                "GENERAL_ENGINEERING_PROJECT",

              repositoryTypes,

              /**
               * Keep the old singular fields so existing frontend consumers
               * do not break.
               *
               * Their values now come from canonical arrays rather than from
               * ArchitectureChange.
               */
              architectureDomain:
                architectureDomains[0] ??
                null,

              detectedTechnology:
                technologies[0] ??
                null,

              /**
               * Additive canonical fields.
               *
               * Frontend can use these to represent the repository's complete
               * current engineering composition.
               */
              architectureDomains,

              technologies,

              /**
               * Evolution summary is deliberately historical.
               */
              evolutionSummary:
                latestGeneratedChange
                  ?.evolutionSummary ??
                null,

              /**
               * This now represents the timestamp of the canonical repository
               * intelligence generation.
               */
              lastGeneratedAt:
                latestSnapshot
                  ?.createdAt ??
                null,
            },

            counts: {
              engineeringEvents:
                repository._count
                  .events,

              timelineEntries:
                repository._count
                  .timelineEntries,

              architectureChanges:
                repository._count
                  .architectureChanges,

              recommendations:
                repository._count
                  .engineeringRecommendations,

              activeRecommendations:
                repositoryActiveRecommendations,
            },
          };
        },
      );

    /**
 * Build current portfolio composition from canonical repository snapshots.
 */
    const canonicalDistributions =
      buildCanonicalPortfolioDistributions(
        canonicalPortfolioSignals,
      );

    const totalRepositories =
      repositories.length;

    return {
      user,

      summary: {
        totalRepositories,

        trackedRepositories,

        untrackedRepositories:
          totalRepositories -
          trackedRepositories,

        repositoriesWithIntelligence,

        repositoriesWithoutIntelligence:
          totalRepositories -
          repositoriesWithIntelligence,

        intelligenceCoveragePercent:
          getPercentage(
            repositoriesWithIntelligence,
            totalRepositories,
          ),

        totalEngineeringEvents,

        totalTimelineEntries,

        totalArchitectureChanges,

        totalRecommendations,

        activeRecommendations,

        totalStars,

        totalForks,
      },

      /**
       * These distributions now describe canonical portfolio composition.
       *
       * Example:
       *
       * {
       *   name: "REALTIME_SYSTEMS",
       *   count: 2
       * }
       *
       * means two repositories currently contain REALTIME_SYSTEMS.
       */
      distributions: {


        repositoryTypes:
          canonicalDistributions
            .repositoryTypes,

        architectureDomains:
          canonicalDistributions
            .architectureDomains,

        technologies:
          canonicalDistributions
            .technologies,
            
        languages:
          toSortedCountArray(
            languageCounts,
          ),


      },

      highlights: {
        mostStarredRepository:
          [
            ...repositorySummaries,
          ].sort(
            (a, b) =>
              b.stars - a.stars,
          )[0] || null,

        mostActiveRepository:
          [
            ...repositorySummaries,
          ].sort(
            (a, b) => {
              const activityA =
                a.counts
                  .engineeringEvents +
                a.counts
                  .timelineEntries +
                a.counts
                  .architectureChanges;

              const activityB =
                b.counts
                  .engineeringEvents +
                b.counts
                  .timelineEntries +
                b.counts
                  .architectureChanges;

              return (
                activityB -
                activityA
              );
            },
          )[0] || null,

        mostRecentlyUpdatedRepository:
          repositorySummaries[0] ||
          null,

        repositoryWithMostRecommendations:
          [
            ...repositorySummaries,
          ].sort(
            (a, b) =>
              b.counts
                .activeRecommendations -
              a.counts
                .activeRecommendations,
          )[0] || null,
      },

      repositories:
        repositorySummaries,
    };
  },
};
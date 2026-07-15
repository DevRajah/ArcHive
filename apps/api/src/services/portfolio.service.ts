import { prisma } from "@archive/database";
import { GENERATED_CHANGE_TYPE } from "../constants/intelligence.constants";

type CountItem = {
  name: string;
  count: number;
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

const incrementCount = (
  map: Map<string, number>,
  value?: string | null,
  fallback?: string
) => {
  const normalizedValue = value?.trim() || fallback;

  if (!normalizedValue) {
    return;
  }

  map.set(normalizedValue, (map.get(normalizedValue) || 0) + 1);
};

const toSortedCountArray = (map: Map<string, number>): CountItem[] => {
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

const getPercentage = (value: number, total: number) => {
  if (total === 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
};

export const portfolioService = {
  async getUserPortfolio(userId: string) {
    const user = await prisma.user.findUnique({
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

    const repositories = await prisma.repository.findMany({
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

        architectureChanges: {
          where: {
            changeType: GENERATED_CHANGE_TYPE,
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
            engineeringRecommendations: true,
          },
        },
      },
    });

    const languageCounts = new Map<string, number>();
    const repositoryTypeCounts = new Map<string, number>();
    const architectureDomainCounts = new Map<string, number>();
    const technologyCounts = new Map<string, number>();

    let trackedRepositories = 0;
    let repositoriesWithIntelligence = 0;
    let totalStars = 0;
    let totalForks = 0;
    let totalEngineeringEvents = 0;
    let totalTimelineEntries = 0;
    let totalArchitectureChanges = 0;
    let totalRecommendations = 0;
    let activeRecommendations = 0;

    const repositorySummaries = repositories.map((repository) => {
      const latestIntelligence = repository.architectureChanges[0] || null;

      const repositoryTypes = splitStoredList(
        latestIntelligence?.repositoryTypes
      );

      if (repository.isTracked) {
        trackedRepositories += 1;
      }

      if (latestIntelligence) {
        repositoriesWithIntelligence += 1;
      }

      totalStars += repository.stars;
      totalForks += repository.forks;
      totalEngineeringEvents += repository._count.events;
      totalTimelineEntries += repository._count.timelineEntries;
      totalArchitectureChanges += repository._count.architectureChanges;
      totalRecommendations += repository._count.engineeringRecommendations;

      activeRecommendations += repository.engineeringRecommendations.filter(
        (recommendation) => recommendation.status === "ACTIVE"
      ).length;

      incrementCount(languageCounts, repository.language, "Unknown");

      repositoryTypes.forEach((repositoryType) => {
        incrementCount(repositoryTypeCounts, repositoryType);
      });

      incrementCount(
        architectureDomainCounts,
        latestIntelligence?.architectureDomain
      );

      incrementCount(
        technologyCounts,
        latestIntelligence?.detectedTechnology
      );

      return {
        id: repository.id,
        name: repository.name,
        owner: repository.owner,
        fullName: repository.fullName,
        description: repository.description,
        language: repository.language,
        stars: repository.stars,
        forks: repository.forks,
        isTracked: repository.isTracked,
        createdAt: repository.createdAt,
        updatedAt: repository.updatedAt,

        intelligence: {
          primaryRepositoryType:
            repositoryTypes[0] || "GENERAL_ENGINEERING_PROJECT",
          repositoryTypes,
          architectureDomain:
            latestIntelligence?.architectureDomain || null,
          detectedTechnology:
            latestIntelligence?.detectedTechnology || null,
          evolutionSummary:
            latestIntelligence?.evolutionSummary || null,
          lastGeneratedAt:
            latestIntelligence?.createdAt || null,
        },

        counts: {
          engineeringEvents: repository._count.events,
          timelineEntries: repository._count.timelineEntries,
          architectureChanges: repository._count.architectureChanges,
          recommendations: repository._count.engineeringRecommendations,
          activeRecommendations:
            repository.engineeringRecommendations.filter(
              (recommendation) => recommendation.status === "ACTIVE"
            ).length,
        },
      };
    });

    const totalRepositories = repositories.length;

    return {
      user,

      summary: {
        totalRepositories,
        trackedRepositories,
        untrackedRepositories:
          totalRepositories - trackedRepositories,
        repositoriesWithIntelligence,
        repositoriesWithoutIntelligence:
          totalRepositories - repositoriesWithIntelligence,
        intelligenceCoveragePercent: getPercentage(
          repositoriesWithIntelligence,
          totalRepositories
        ),
        totalEngineeringEvents,
        totalTimelineEntries,
        totalArchitectureChanges,
        totalRecommendations,
        activeRecommendations,
        totalStars,
        totalForks,
      },

      distributions: {
        languages: toSortedCountArray(languageCounts),
        repositoryTypes: toSortedCountArray(repositoryTypeCounts),
        architectureDomains: toSortedCountArray(
          architectureDomainCounts
        ),
        technologies: toSortedCountArray(technologyCounts),
      },

      highlights: {
        mostStarredRepository:
          [...repositorySummaries].sort(
            (a, b) => b.stars - a.stars
          )[0] || null,

        mostActiveRepository:
          [...repositorySummaries].sort((a, b) => {
            const activityA =
              a.counts.engineeringEvents +
              a.counts.timelineEntries +
              a.counts.architectureChanges;

            const activityB =
              b.counts.engineeringEvents +
              b.counts.timelineEntries +
              b.counts.architectureChanges;

            return activityB - activityA;
          })[0] || null,

        mostRecentlyUpdatedRepository:
          repositorySummaries[0] || null,

        repositoryWithMostRecommendations:
          [...repositorySummaries].sort(
            (a, b) =>
              b.counts.activeRecommendations -
              a.counts.activeRecommendations
          )[0] || null,
      },

      repositories: repositorySummaries,
    };
  },
};
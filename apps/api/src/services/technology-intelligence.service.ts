import { Prisma } from "@prisma/client";
import { prisma } from "@archive/database";

import type {
  TechnologyAdoptionPoint,
  TechnologyIntelligenceDetail,
  TechnologyIntelligenceOverview,
  TechnologyIntelligenceRepository,
  TechnologySummary,
} from "../types/technology-intelligence.types";

type RepositoryTechnologySource = {
  id: string;
  name: string;
  fullName: string;
  language: string | null;
  isTracked: boolean;
  updatedAt: Date;

  intelligenceSnapshots: Array<{
    technologies: Prisma.JsonValue;
    architectureDomains: Prisma.JsonValue;
    repositoryTypes: Prisma.JsonValue;
    capabilities: Prisma.JsonValue;
    createdAt: Date;
  }>;

  architectureChanges: Array<{
    id: string;
    detectedTechnology: string | null;
    architectureDomain: string | null;
    repositoryTypes: string | null;
    summary: string;
    fileAffected: string | null;
    createdAt: Date;
  }>;

  engineeringRecommendations: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    evidence: string | null;
    createdAt: Date;
    resolvedAt: Date | null;
  }>;
};

type ExtractedTechnologySignals = {
  technologies: string[];
  architectureDomains: string[];
  repositoryTypes: string[];
  capabilities: string[];
};

const normalize = (value: string) => {
  return value.trim().toLowerCase();
};

const uniqueSorted = (values: string[]) => {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
};

const readStringArray = (value: Prisma.JsonValue): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return uniqueSorted(
    value.filter(
      (item): item is string => typeof item === "string"
    )
  );
};

const readCapabilities = (value: Prisma.JsonValue): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return uniqueSorted(
    value.flatMap((item) => {
      if (typeof item === "string") {
        return [item];
      }

      if (
        typeof item !== "object" ||
        item === null ||
        Array.isArray(item)
      ) {
        return [];
      }

      const record = item as Record<string, unknown>;

      const candidate =
        record.key ??
        record.name ??
        record.label ??
        record.capability ??
        record.title;

      return typeof candidate === "string" ? [candidate] : [];
    })
  );
};

const splitStoredList = (value?: string | null) => {
  if (!value) {
    return [];
  }

  return value
    .split(/[,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const increment = (
  map: Map<string, number>,
  value?: string | null
) => {
  const key = value?.trim();

  if (!key) {
    return;
  }

  map.set(key, (map.get(key) || 0) + 1);
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

const extractSignals = (
  repository: RepositoryTechnologySource
): ExtractedTechnologySignals => {
  const latestSnapshot = repository.intelligenceSnapshots[0];

  if (latestSnapshot) {
    return {
      technologies: readStringArray(latestSnapshot.technologies),
      architectureDomains: readStringArray(
        latestSnapshot.architectureDomains
      ),
      repositoryTypes: readStringArray(
        latestSnapshot.repositoryTypes
      ),
      capabilities: readCapabilities(latestSnapshot.capabilities),
    };
  }

  // Architecture changes provide useful compatibility for repositories that
  // have not yet produced their first intelligence snapshot.
  return {
    technologies: uniqueSorted(
      repository.architectureChanges
        .map((change) => change.detectedTechnology)
        .filter(
          (technology): technology is string => Boolean(technology)
        )
    ),

    architectureDomains: uniqueSorted(
      repository.architectureChanges
        .map((change) => change.architectureDomain)
        .filter((domain): domain is string => Boolean(domain))
    ),

    repositoryTypes: uniqueSorted(
      repository.architectureChanges.flatMap((change) =>
        splitStoredList(change.repositoryTypes)
      )
    ),

    capabilities: [],
  };
};

const containsTechnology = (
  values: string[],
  technology: string
) => {
  const target = normalize(technology);

  return values.some((value) => normalize(value) === target);
};

const recommendationMentionsTechnology = (
  recommendation: {
    title: string;
    description: string;
    evidence: string | null;
  },
  technology: string
) => {
  const searchableText = [
    recommendation.title,
    recommendation.description,
    recommendation.evidence || "",
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalize(technology));
};

const architectureChangeMatchesTechnology = (
  change: {
    detectedTechnology: string | null;
    summary: string;
  },
  technology: string
) => {
  const target = normalize(technology);

  return (
    normalize(change.detectedTechnology || "") === target ||
    change.summary.toLowerCase().includes(target)
  );
};

const toMonthKey = (date: Date) => {
  return date.toISOString().slice(0, 7);
};

const buildAdoptionTimeline = (
  repositories: TechnologyIntelligenceRepository[]
): TechnologyAdoptionPoint[] => {
  const firstDetectionCounts = new Map<string, number>();

  repositories.forEach((repository) => {
    if (!repository.firstDetectedAt) {
      return;
    }

    const month = toMonthKey(repository.firstDetectedAt);

    firstDetectionCounts.set(
      month,
      (firstDetectionCounts.get(month) || 0) + 1
    );
  });

  let cumulativeRepositories = 0;

  return Array.from(firstDetectionCounts.entries())
    .sort(([periodA], [periodB]) =>
      periodA.localeCompare(periodB)
    )
    .map(([period, newlyAdoptedRepositories]) => {
      cumulativeRepositories += newlyAdoptedRepositories;

      return {
        period,
        newlyAdoptedRepositories,
        cumulativeRepositories,
      };
    });
};

const loadUserRepositories = async (
  userId: string
): Promise<RepositoryTechnologySource[]> => {
  return prisma.repository.findMany({
    where: {
      userId,
    },

    orderBy: {
      updatedAt: "desc",
    },

    select: {
      id: true,
      name: true,
      fullName: true,
      language: true,
      isTracked: true,
      updatedAt: true,

      intelligenceSnapshots: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          technologies: true,
          architectureDomains: true,
          repositoryTypes: true,
          capabilities: true,
          createdAt: true,
        },
      },

      architectureChanges: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          detectedTechnology: true,
          architectureDomain: true,
          repositoryTypes: true,
          summary: true,
          fileAffected: true,
          createdAt: true,
        },
      },

      engineeringRecommendations: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          evidence: true,
          createdAt: true,
          resolvedAt: true,
        },
      },
    },
  });
};

const buildTechnologySummaries = (
  repositories: RepositoryTechnologySource[]
): TechnologySummary[] => {
  const technologyMap = new Map<
    string,
    {
      displayName: string;
      repositoryIds: Set<string>;
      trackedRepositoryIds: Set<string>;
      architectureDomains: Set<string>;
      capabilities: Set<string>;
      recommendationCount: number;
      detectionDates: Date[];
    }
  >();

  repositories.forEach((repository) => {
    const signals = extractSignals(repository);

    signals.technologies.forEach((technology) => {
      const normalizedTechnology = normalize(technology);

      const existing =
        technologyMap.get(normalizedTechnology) || {
          displayName: technology,
          repositoryIds: new Set<string>(),
          trackedRepositoryIds: new Set<string>(),
          architectureDomains: new Set<string>(),
          capabilities: new Set<string>(),
          recommendationCount: 0,
          detectionDates: [],
        };

      existing.repositoryIds.add(repository.id);

      if (repository.isTracked) {
        existing.trackedRepositoryIds.add(repository.id);
      }

      signals.architectureDomains.forEach((domain) =>
        existing.architectureDomains.add(domain)
      );

      signals.capabilities.forEach((capability) =>
        existing.capabilities.add(capability)
      );

      existing.recommendationCount +=
        repository.engineeringRecommendations.filter(
          (recommendation) =>
            recommendationMentionsTechnology(
              recommendation,
              technology
            )
        ).length;

      const matchingChanges = repository.architectureChanges.filter(
        (change) =>
          architectureChangeMatchesTechnology(
            change,
            technology
          )
      );

      matchingChanges.forEach((change) =>
        existing.detectionDates.push(change.createdAt)
      );

      if (
        matchingChanges.length === 0 &&
        repository.intelligenceSnapshots[0]
      ) {
        existing.detectionDates.push(
          repository.intelligenceSnapshots[0].createdAt
        );
      }

      technologyMap.set(normalizedTechnology, existing);
    });
  });

  return Array.from(technologyMap.values())
    .map((technology): TechnologySummary => {
      const sortedDates = technology.detectionDates.sort(
        (a, b) => a.getTime() - b.getTime()
      );

      return {
        technology: technology.displayName,
        repositoryCount: technology.repositoryIds.size,
        trackedRepositoryCount:
          technology.trackedRepositoryIds.size,
        architectureDomainCount:
          technology.architectureDomains.size,
        capabilityCount: technology.capabilities.size,
        recommendationCount: technology.recommendationCount,
        firstDetectedAt: sortedDates[0] || null,
        lastDetectedAt:
          sortedDates[sortedDates.length - 1] || null,
      };
    })
    .sort((a, b) => {
      if (b.repositoryCount !== a.repositoryCount) {
        return b.repositoryCount - a.repositoryCount;
      }

      return a.technology.localeCompare(b.technology);
    });
};

export const technologyIntelligenceService = {
  async getTechnologyOverview(
    userId: string
  ): Promise<TechnologyIntelligenceOverview | null> {
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

    const repositories = await loadUserRepositories(userId);
    const technologies = buildTechnologySummaries(repositories);

    const totalRepositoryTechnologyLinks =
      technologies.reduce(
        (total, technology) =>
          total + technology.repositoryCount,
        0
      );

    const newestTechnology =
      [...technologies]
        .filter(
          (technology) => technology.firstDetectedAt !== null
        )
        .sort((a, b) => {
          return (
            (b.firstDetectedAt?.getTime() || 0) -
            (a.firstDetectedAt?.getTime() || 0)
          );
        })[0] || null;

    return {
      user,

      summary: {
        totalTechnologies: technologies.length,
        totalRepositoryTechnologyLinks,
        mostAdoptedTechnology: technologies[0] || null,
        newestTechnology,
        technologiesWithRecommendations:
          technologies.filter(
            (technology) =>
              technology.recommendationCount > 0
          ).length,
      },

      technologies,
    };
  },

  async getTechnologyDetail({
    userId,
    technology,
  }: {
    userId: string;
    technology: string;
  }): Promise<TechnologyIntelligenceDetail | null> {
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

    const repositories = await loadUserRepositories(userId);

    const matchingRepositories =
      repositories.filter((repository) => {
        const signals = extractSignals(repository);

        return containsTechnology(
          signals.technologies,
          technology
        );
      });

    if (matchingRepositories.length === 0) {
      return null;
    }

    const architectureDomainCounts = new Map<string, number>();
    const repositoryTypeCounts = new Map<string, number>();
    const capabilityCounts = new Map<string, number>();
    const relatedTechnologyCounts = new Map<string, number>();

    const recommendations:
      TechnologyIntelligenceDetail["recommendations"] = [];

    const detectionHistory:
      TechnologyIntelligenceDetail["detectionHistory"] = [];

    const repositoryResults =
      matchingRepositories.map(
        (repository): TechnologyIntelligenceRepository => {
          const signals = extractSignals(repository);

          signals.architectureDomains.forEach((domain) =>
            increment(architectureDomainCounts, domain)
          );

          signals.repositoryTypes.forEach((repositoryType) =>
            increment(repositoryTypeCounts, repositoryType)
          );

          signals.capabilities.forEach((capability) =>
            increment(capabilityCounts, capability)
          );

          signals.technologies
            .filter(
              (relatedTechnology) =>
                normalize(relatedTechnology) !==
                normalize(technology)
            )
            .forEach((relatedTechnology) =>
              increment(
                relatedTechnologyCounts,
                relatedTechnology
              )
            );

          const matchingChanges =
            repository.architectureChanges.filter(
              (change) =>
                architectureChangeMatchesTechnology(
                  change,
                  technology
                )
            );

          matchingChanges.forEach((change) => {
            detectionHistory.push({
              id: change.id,
              repositoryId: repository.id,
              repositoryName: repository.name,
              repositoryFullName: repository.fullName,
              architectureDomain:
                change.architectureDomain,
              summary: change.summary,
              fileAffected: change.fileAffected,
              detectedAt: change.createdAt,
            });
          });

          const matchingRecommendations =
            repository.engineeringRecommendations.filter(
              (recommendation) =>
                recommendationMentionsTechnology(
                  recommendation,
                  technology
                )
            );

          matchingRecommendations.forEach(
            (recommendation) => {
              recommendations.push({
                id: recommendation.id,
                repositoryId: repository.id,
                repositoryName: repository.name,
                repositoryFullName: repository.fullName,
                title: recommendation.title,
                description: recommendation.description,
                status: recommendation.status,
                evidence: recommendation.evidence,
                createdAt: recommendation.createdAt,
                resolvedAt: recommendation.resolvedAt,
              });
            }
          );

          const detectionDates = matchingChanges
            .map((change) => change.createdAt)
            .sort(
              (a, b) => a.getTime() - b.getTime()
            );

          const snapshotCreatedAt =
            repository.intelligenceSnapshots[0]?.createdAt ||
            null;

          const firstDetectedAt =
            detectionDates[0] || snapshotCreatedAt;

          const lastDetectedAt =
            detectionDates[detectionDates.length - 1] ||
            snapshotCreatedAt;

          return {
            id: repository.id,
            name: repository.name,
            fullName: repository.fullName,
            language: repository.language,
            isTracked: repository.isTracked,
            updatedAt: repository.updatedAt,
            firstDetectedAt,
            lastDetectedAt,
            architectureDomains:
              signals.architectureDomains,
            repositoryTypes: signals.repositoryTypes,
            capabilities: signals.capabilities,
            matchingArchitectureChanges:
              matchingChanges.length,
            matchingRecommendations:
              matchingRecommendations.length,
          };
        }
      );

    const allDetectionDates = repositoryResults
      .flatMap((repository) => [
        repository.firstDetectedAt,
        repository.lastDetectedAt,
      ])
      .filter((date): date is Date => Boolean(date))
      .sort((a, b) => a.getTime() - b.getTime());

    return {
      user,

      technology: {
        name: technology,
        repositoryCount: repositoryResults.length,
        trackedRepositoryCount:
          repositoryResults.filter(
            (repository) => repository.isTracked
          ).length,
        architectureDomainCount:
          architectureDomainCounts.size,
        repositoryTypeCount: repositoryTypeCounts.size,
        capabilityCount: capabilityCounts.size,
        recommendationCount: recommendations.length,
        firstDetectedAt: allDetectionDates[0] || null,
        lastDetectedAt:
          allDetectionDates[
            allDetectionDates.length - 1
          ] || null,
      },

      repositories: repositoryResults.sort((a, b) => {
        if (
          b.matchingArchitectureChanges !==
          a.matchingArchitectureChanges
        ) {
          return (
            b.matchingArchitectureChanges -
            a.matchingArchitectureChanges
          );
        }

        return a.fullName.localeCompare(b.fullName);
      }),

      architectureDomains: toCountArray(
        architectureDomainCounts
      ),

      repositoryTypes: toCountArray(repositoryTypeCounts),

      capabilities: toCountArray(capabilityCounts),

      recommendations: recommendations.sort(
        (a, b) =>
          b.createdAt.getTime() - a.createdAt.getTime()
      ),

      detectionHistory: detectionHistory.sort(
        (a, b) =>
          b.detectedAt.getTime() - a.detectedAt.getTime()
      ),

      adoptionTimeline: buildAdoptionTimeline(
        repositoryResults
      ),

      relatedTechnologies: toCountArray(
        relatedTechnologyCounts
      ).map((item) => ({
        name: item.name,
        sharedRepositoryCount: item.count,
      })),
    };
  },
};
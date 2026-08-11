import { Prisma } from "@prisma/client";
import { prisma } from "@archive/database";

import type {
  DependencyOverview,
  DependencyImpactLevel,
  TechnologyDependencyDetail,
  TechnologyDependencyNode,
  TechnologyImpactReport,
  TechnologyRelationship,
} from "../types/dependency-intelligence.types";

import {
  calculateCentralityScore,
  calculateImpactScore,
  calculateRepositoryImpactContribution,
  getImpactLevel,
} from "./dependency-intelligence-scoring";
type RepositoryDependencySource = {
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
    detectedTechnology: string | null;
    architectureDomain: string | null;
    repositoryTypes: string | null;
  }>;
};

type RepositorySignals = {
  technologies: string[];
  architectureDomains: string[];
  repositoryTypes: string[];
  capabilities: string[];
};

type RepositoryWithSignals = {
  id: string;
  name: string;
  fullName: string;
  language: string | null;
  isTracked: boolean;
  updatedAt: Date;
  signals: RepositorySignals;
};

type TechnologyAggregate = {
  displayName: string;

  repositoryIds: Set<string>;
  trackedRepositoryIds: Set<string>;

  architectureDomains: Set<string>;
  repositoryTypes: Set<string>;
  capabilities: Set<string>;

  connectedTechnologies: Map<
    string,
    {
      displayName: string;
      sharedRepositoryIds: Set<string>;
    }
  >;
};

type DependencyGraph = {
  repositories: RepositoryWithSignals[];
  technologyAggregates: Map<string, TechnologyAggregate>;
  relationships: TechnologyRelationship[];
  nodes: TechnologyDependencyNode[];
};

const normalize = (value: string) => {
  return value.trim().toLowerCase();
};

const uniqueSorted = (values: string[]) => {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
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

const readStringArray = (
  value: Prisma.JsonValue
): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return uniqueSorted(
    value.filter(
      (item): item is string =>
        typeof item === "string"
    )
  );
};

const readCapabilities = (
  value: Prisma.JsonValue
): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const capabilities = value.flatMap((item) => {
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

    return typeof candidate === "string"
      ? [candidate]
      : [];
  });

  return uniqueSorted(capabilities);
};

const extractRepositorySignals = (
  repository: RepositoryDependencySource
): RepositorySignals => {
  const latestSnapshot =
    repository.intelligenceSnapshots[0];

  /*
   * A snapshot represents one complete intelligence refresh, so it is the
   * preferred source for dependency analysis. Architecture changes remain as
   * a fallback for repositories that have not generated a snapshot yet.
   */
  if (latestSnapshot) {
    return {
      technologies: readStringArray(
        latestSnapshot.technologies
      ),

      architectureDomains: readStringArray(
        latestSnapshot.architectureDomains
      ),

      repositoryTypes: readStringArray(
        latestSnapshot.repositoryTypes
      ),

      capabilities: readCapabilities(
        latestSnapshot.capabilities
      ),
    };
  }

  return {
    technologies: uniqueSorted(
      repository.architectureChanges
        .map((change) => change.detectedTechnology)
        .filter(
          (technology): technology is string =>
            Boolean(technology)
        )
    ),

    architectureDomains: uniqueSorted(
      repository.architectureChanges
        .map((change) => change.architectureDomain)
        .filter(
          (domain): domain is string =>
            Boolean(domain)
        )
    ),

    repositoryTypes: uniqueSorted(
      repository.architectureChanges.flatMap(
        (change) =>
          splitStoredList(change.repositoryTypes)
      )
    ),

    capabilities: [],
  };
};

const increment = (
  map: Map<string, number>,
  value?: string | null
) => {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return;
  }

  map.set(
    normalizedValue,
    (map.get(normalizedValue) || 0) + 1
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

// const clampScore = (score: number) => {
//   return Math.max(0, Math.min(100, Math.round(score)));
// };

// /**
//  * Convert the numeric portfolio impact score into a presentation tier.
//  *
//  * Future me:
//  * This is deliberately called IMPACT, not RISK.
//  *
//  * The score is derived from repository reach, technology connectivity,
//  * architecture breadth, and capability breadth. Those factors measure the
//  * potential change radius of a technology, not whether the technology is
//  * insecure, vulnerable, unstable, or operationally dangerous.
//  */
// export const getImpactLevel = (
//     score: number
// ): DependencyImpactLevel => {
//   if (score >= 71) {
//     return "CRITICAL";
//   }

//   if (score >= 46) {
//     return "HIGH";
//   }

//   if (score >= 21) {
//     return "MEDIUM";
//   }

//   return "LOW";
// };

// /**
//  * Returns the lower bound of a Wilson score interval for repository coverage.
//  *
//  * Future me:
//  * Raw coverage can overstate certainty in tiny portfolios.
//  *
//  * 3/3 and 100/100 are both 100% observed coverage, but the second result is
//  * supported by much more evidence.
//  *
//  * This helper does not change the observed coverage itself. It gives ArcHive
//  * a deterministic way to moderate confidence when the sample size is small.
//  */
// const calculateWilsonLowerBound = (
//   successes: number,
//   total: number,
//   z = 1.96
// ) => {
//   if (total <= 0 || successes <= 0) {
//     return 0;
//   }

//   const boundedSuccesses =
//     Math.min(successes, total);

//   const proportion =
//     boundedSuccesses / total;

//   const zSquared = z * z;

//   const denominator =
//     1 + zSquared / total;

//   const centre =
//     proportion +
//     zSquared / (2 * total);

//   const margin =
//     z *
//     Math.sqrt(
//       (proportion * (1 - proportion)) /
//       total +
//       zSquared /
//       (4 * total * total)
//     );

//   return Math.max(
//     0,
//     (centre - margin) / denominator
//   );
// };

// /**
//  * Preserve observed portfolio coverage as the dominant signal while adding
//  * a confidence-aware adjustment for small samples.
//  *
//  * ArcHive is measuring actual portfolio exposure, not estimating a hidden
//  * population, so raw coverage should still matter most.
//  */
// const calculateConfidenceAdjustedCoverage = (
//   repositoryCount: number,
//   totalRepositories: number
// ) => {
//   if (totalRepositories <= 0) {
//     return 0;
//   }

//   const observedCoverage =
//     repositoryCount / totalRepositories;

//   const confidenceCoverage =
//     calculateWilsonLowerBound(
//       repositoryCount,
//       totalRepositories
//     );

//   return (
//     observedCoverage * 0.7 +
//     confidenceCoverage * 0.3
//   );
// };

// export const calculateCentralityScore = ({  repositoryCount,
//   totalRepositories,
//   connectedTechnologyCount,
//   totalTechnologies,
//   architectureDomainCount,
//   capabilityCount,
// }: {
//   repositoryCount: number;
//   totalRepositories: number;
//   connectedTechnologyCount: number;
//   totalTechnologies: number;
//   architectureDomainCount: number;
//   capabilityCount: number;
// }) => {
//   /*
//    * Centrality measures how deeply embedded a technology is across the
//    * engineering portfolio. Repository coverage carries the highest weight,
//    * followed by technology connectivity and architectural diversity.
//    */
//   const repositoryCoverage =
//     calculateConfidenceAdjustedCoverage(
//       repositoryCount,
//       totalRepositories
//     );

//   const connectionCoverage =
//     totalTechnologies > 1
//       ? connectedTechnologyCount /
//       (totalTechnologies - 1)
//       : 0;

//   const architectureDepth = Math.min(
//     architectureDomainCount / 8,
//     1
//   );

//   const capabilityDepth = Math.min(
//     capabilityCount / 10,
//     1
//   );

//   return clampScore(
//     repositoryCoverage * 45 +
//     connectionCoverage * 30 +
//     architectureDepth * 15 +
//     capabilityDepth * 10
//   );
// };

// export const calculateImpactScore = ({
//   repositoryCount,
//   totalRepositories,
//   connectedTechnologyCount,
//   totalTechnologies,
//   architectureDomainCount,
//   capabilityCount,
// }: {
//   repositoryCount: number;
//   totalRepositories: number;
//   connectedTechnologyCount: number;
//   totalTechnologies: number;
//   architectureDomainCount: number;
//   capabilityCount: number;
// }) => {
//   /*
//    * Impact gives more weight to repository reach and connected technologies.
//    * A technology used broadly across repositories and architecture domains
//    * has a larger potential change radius than an isolated dependency.
//    */
//   const repositoryReach =
//     calculateConfidenceAdjustedCoverage(
//       repositoryCount,
//       totalRepositories
//     );

//   const ecosystemReach =
//     totalTechnologies > 1
//       ? connectedTechnologyCount /
//       (totalTechnologies - 1)
//       : 0;

//   const domainReach = Math.min(
//     architectureDomainCount / 8,
//     1
//   );

//   const capabilityReach = Math.min(
//     capabilityCount / 10,
//     1
//   );

//   return clampScore(
//     repositoryReach * 50 +
//     ecosystemReach * 25 +
//     domainReach * 15 +
//     capabilityReach * 10
//   );
// };

const getRelationshipKey = (
  source: string,
  target: string
) => {
  return [normalize(source), normalize(target)]
    .sort((a, b) => a.localeCompare(b))
    .join("::");
};

const loadUserRepositories = async (
  userId: string
): Promise<RepositoryDependencySource[]> => {
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
        select: {
          detectedTechnology: true,
          architectureDomain: true,
          repositoryTypes: true,
        },
      },
    },
  });
};

const buildDependencyGraph = (
  sourceRepositories: RepositoryDependencySource[]
): DependencyGraph => {
  const repositories: RepositoryWithSignals[] =
    sourceRepositories.map((repository) => ({
      id: repository.id,
      name: repository.name,
      fullName: repository.fullName,
      language: repository.language,
      isTracked: repository.isTracked,
      updatedAt: repository.updatedAt,
      signals: extractRepositorySignals(repository),
    }));

  const technologyAggregates = new Map<
    string,
    TechnologyAggregate
  >();

  /*
   * Maps are used so the service can build indexes in one pass rather than
   * repeatedly filtering the entire repository list for every technology.
   * This becomes increasingly important as portfolio size grows.
   */
  repositories.forEach((repository) => {
    repository.signals.technologies.forEach(
      (technology) => {
        const technologyKey = normalize(technology);

        const aggregate =
          technologyAggregates.get(technologyKey) || {
            displayName: technology,
            repositoryIds: new Set<string>(),
            trackedRepositoryIds: new Set<string>(),
            architectureDomains: new Set<string>(),
            repositoryTypes: new Set<string>(),
            capabilities: new Set<string>(),
            connectedTechnologies: new Map(),
          };

        aggregate.repositoryIds.add(repository.id);

        if (repository.isTracked) {
          aggregate.trackedRepositoryIds.add(
            repository.id
          );
        }

        repository.signals.architectureDomains.forEach(
          (domain) =>
            aggregate.architectureDomains.add(domain)
        );

        repository.signals.repositoryTypes.forEach(
          (repositoryType) =>
            aggregate.repositoryTypes.add(repositoryType)
        );

        repository.signals.capabilities.forEach(
          (capability) =>
            aggregate.capabilities.add(capability)
        );

        technologyAggregates.set(
          technologyKey,
          aggregate
        );
      }
    );

    /*
     * Every unique pair of technologies appearing in the same repository
     * becomes co-occurrence evidence. This is not yet a claim about package
     * import direction; it represents portfolio-level engineering affinity.
     */
    const repositoryTechnologies =
      uniqueSorted(
        repository.signals.technologies
      );

    for (
      let sourceIndex = 0;
      sourceIndex < repositoryTechnologies.length;
      sourceIndex += 1
    ) {
      for (
        let targetIndex = sourceIndex + 1;
        targetIndex <
        repositoryTechnologies.length;
        targetIndex += 1
      ) {
        const sourceTechnology =
          repositoryTechnologies[sourceIndex];

        const targetTechnology =
          repositoryTechnologies[targetIndex];

        const sourceKey = normalize(sourceTechnology);
        const targetKey = normalize(targetTechnology);

        const sourceAggregate =
          technologyAggregates.get(sourceKey);

        const targetAggregate =
          technologyAggregates.get(targetKey);

        if (!sourceAggregate || !targetAggregate) {
          continue;
        }

        const sourceConnection =
          sourceAggregate.connectedTechnologies.get(
            targetKey
          ) || {
            displayName: targetTechnology,
            sharedRepositoryIds: new Set<string>(),
          };

        sourceConnection.sharedRepositoryIds.add(
          repository.id
        );

        sourceAggregate.connectedTechnologies.set(
          targetKey,
          sourceConnection
        );

        const targetConnection =
          targetAggregate.connectedTechnologies.get(
            sourceKey
          ) || {
            displayName: sourceTechnology,
            sharedRepositoryIds: new Set<string>(),
          };

        targetConnection.sharedRepositoryIds.add(
          repository.id
        );

        targetAggregate.connectedTechnologies.set(
          sourceKey,
          targetConnection
        );
      }
    }
  });

  const repositoryById = new Map(
    repositories.map((repository) => [
      repository.id,
      repository,
    ])
  );

  const relationshipMap = new Map<
    string,
    TechnologyRelationship
  >();

  technologyAggregates.forEach(
    (sourceAggregate, sourceKey) => {
      sourceAggregate.connectedTechnologies.forEach(
        (connection, targetKey) => {
          const relationshipKey =
            getRelationshipKey(
              sourceAggregate.displayName,
              connection.displayName
            );

          if (relationshipMap.has(relationshipKey)) {
            return;
          }

          const targetAggregate =
            technologyAggregates.get(targetKey);

          if (!targetAggregate) {
            return;
          }

          const sharedRepositoryIds =
            Array.from(
              connection.sharedRepositoryIds
            );

          const sharedRepositories =
            sharedRepositoryIds.length;

          /*
           * Relationship strength uses the smaller technology footprint as the
           * denominator. A score of 1 means every repository using the less
           * common technology also uses the other technology.
           */
          const minimumRepositoryCount = Math.min(
            sourceAggregate.repositoryIds.size,
            targetAggregate.repositoryIds.size
          );

          const strength =
            minimumRepositoryCount > 0
              ? Number(
                (
                  sharedRepositories /
                  minimumRepositoryCount
                ).toFixed(2)
              )
              : 0;

          const sourceRepositoryCoverage =
            sourceAggregate.repositoryIds.size > 0
              ? Number(
                (
                  sharedRepositories /
                  sourceAggregate.repositoryIds.size
                ).toFixed(2)
              )
              : 0;

          const targetRepositoryCoverage =
            targetAggregate.repositoryIds.size > 0
              ? Number(
                (
                  sharedRepositories /
                  targetAggregate.repositoryIds.size
                ).toFixed(2)
              )
              : 0;

          const sharedRepositoryNames =
            sharedRepositoryIds
              .map(
                (repositoryId) =>
                  repositoryById.get(repositoryId)
                    ?.fullName
              )
              .filter(
                (
                  repositoryName
                ): repositoryName is string =>
                  Boolean(repositoryName)
              )
              .sort((a, b) =>
                a.localeCompare(b)
              );

          const sourceName =
            sourceAggregate.displayName;

          const targetName =
            targetAggregate.displayName;

          relationshipMap.set(
            relationshipKey,
            {
              source: sourceName,
              target: targetName,
              sharedRepositories,
              sourceRepositoryCoverage,
              targetRepositoryCoverage,
              strength,
              sharedRepositoryIds,
              sharedRepositoryNames,
              relationshipType:
                "TECHNOLOGY_CO_OCCURRENCE",
              evidenceSummary: `${sourceName} and ${targetName} appear together in ${sharedRepositories} ${sharedRepositories === 1
                ? "repository"
                : "repositories"
                }.`,
            }
          );
        }
      );
    }
  );

  const relationships = Array.from(
    relationshipMap.values()
  ).sort((a, b) => {
    if (b.strength !== a.strength) {
      return b.strength - a.strength;
    }

    if (
      b.sharedRepositories !==
      a.sharedRepositories
    ) {
      return (
        b.sharedRepositories -
        a.sharedRepositories
      );
    }

    return a.source.localeCompare(b.source);
  });

  const totalRepositories = repositories.length;
  const totalTechnologies =
    technologyAggregates.size;

  const nodes = Array.from(
    technologyAggregates.values()
  )
    .map(
      (
        aggregate
      ): TechnologyDependencyNode => {
        const connectedTechnologies =
          Array.from(
            aggregate.connectedTechnologies.values()
          )
            .map(
              (connection) =>
                connection.displayName
            )
            .sort((a, b) =>
              a.localeCompare(b)
            );

        const centralityScore =
          calculateCentralityScore({
            repositoryCount:
              aggregate.repositoryIds.size,
            totalRepositories,
            connectedTechnologyCount:
              connectedTechnologies.length,
            totalTechnologies,
            architectureDomainCount:
              aggregate.architectureDomains.size,
            capabilityCount:
              aggregate.capabilities.size,
          });

        const impactScore =
          calculateImpactScore({
            repositoryCount:
              aggregate.repositoryIds.size,
            totalRepositories,
            connectedTechnologyCount:
              connectedTechnologies.length,
            totalTechnologies,
            architectureDomainCount:
              aggregate.architectureDomains.size,
            capabilityCount:
              aggregate.capabilities.size,
          });

        return {
          technology: aggregate.displayName,
          repositoryCount:
            aggregate.repositoryIds.size,

          trackedRepositoryCount:
            aggregate.trackedRepositoryIds.size,

          connectedTechnologyCount:
            connectedTechnologies.length,

          /**
        * Co-occurrence is currently undirected.
        *
        * This list means only:
        *
        * "These technologies appear alongside this technology across one or more
        * repositories."
        *
        * Do not expose this as dependsOn / dependedOnBy until package-level or
        * import-level direction has actually been detected.
        */
          connectedTechnologies,

          architectureDomains:
            Array.from(
              aggregate.architectureDomains
            ).sort((a, b) =>
              a.localeCompare(b)
            ),

          repositoryTypes:
            Array.from(
              aggregate.repositoryTypes
            ).sort((a, b) =>
              a.localeCompare(b)
            ),

          capabilities:
            Array.from(
              aggregate.capabilities
            ).sort((a, b) =>
              a.localeCompare(b)
            ),

          centralityScore,
          impactScore,
          impactLevel:
            getImpactLevel(impactScore),
        };
      }
    )
    .sort((a, b) => {
      if (
        b.centralityScore !==
        a.centralityScore
      ) {
        return (
          b.centralityScore -
          a.centralityScore
        );
      }

      if (
        b.repositoryCount !==
        a.repositoryCount
      ) {
        return (
          b.repositoryCount -
          a.repositoryCount
        );
      }

      return a.technology.localeCompare(
        b.technology
      );
    });

  return {
    repositories,
    technologyAggregates,
    relationships,
    nodes,
  };
};

const findTechnologyNode = (
  graph: DependencyGraph,
  technology: string
) => {
  const technologyKey = normalize(technology);

  return (
    graph.nodes.find(
      (node) =>
        normalize(node.technology) ===
        technologyKey
    ) || null
  );
};

const getTechnologyRelationships = (
  graph: DependencyGraph,
  technology: string
) => {
  const technologyKey = normalize(technology);

  return graph.relationships.filter(
    (relationship) =>
      normalize(relationship.source) ===
      technologyKey ||
      normalize(relationship.target) ===
      technologyKey
  );
};

const buildImpactWarnings = ({
  node,
  relationships,
}: {
  node: TechnologyDependencyNode;
  relationships: TechnologyRelationship[];
}) => {
  const warnings: string[] = [];

  if (node.repositoryCount >= 3) {
    warnings.push(
      `${node.technology} is used across ${node.repositoryCount} repositories, so changes may have portfolio-wide consequences.`
    );
  }

  if (node.connectedTechnologyCount >= 5) {
    warnings.push(
      `${node.technology} is strongly connected to ${node.connectedTechnologyCount} other technologies.`
    );
  }

  if (node.architectureDomains.length >= 3) {
    warnings.push(
      `${node.technology} appears across multiple architecture domains: ${node.architectureDomains.join(
        ", "
      )}.`
    );
  }

  const strongRelationships =
    relationships.filter(
      (relationship) =>
        relationship.strength >= 0.75
    );

  if (strongRelationships.length > 0) {
    warnings.push(
      `${node.technology} has ${strongRelationships.length} high-strength technology relationship${strongRelationships.length === 1
        ? ""
        : "s"
      }.`
    );
  }

  if (warnings.length === 0) {
    warnings.push(
      `${node.technology} currently has a limited dependency footprint in this portfolio.`
    );
  }

  return warnings;
};

const buildImpactExplanation = (
  node: TechnologyDependencyNode
) => {
  if (node.impactLevel === "CRITICAL") {
    return {
      headline: `${node.technology} is a critical portfolio technology`,
      description: `${node.technology} has broad repository reach and strong connections across the engineering ecosystem. Changes should be tested carefully across all affected systems.`,
    };
  }

  if (node.impactLevel === "HIGH") {
    return {
      headline: `${node.technology} has a high engineering impact`,
      description: `${node.technology} supports multiple repositories, capabilities or architecture domains. Changes may affect several connected systems.`,
    };
  }

  if (node.impactLevel === "MEDIUM") {
    return {
      headline: `${node.technology} has a moderate engineering impact`,
      description: `${node.technology} is shared across part of the portfolio and should be reviewed before major upgrades or removal.`,
    };
  }

  return {
    headline: `${node.technology} has a contained engineering impact`,
    description: `${node.technology} currently affects a limited part of the engineering portfolio.`,
  };
};

export const dependencyIntelligenceService = {
  async getDependencyOverview(
    userId: string
  ): Promise<DependencyOverview | null> {
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

    const sourceRepositories =
      await loadUserRepositories(userId);

    const graph = buildDependencyGraph(
      sourceRepositories
    );

    const mostCentralTechnology =
      graph.nodes[0] || null;

    const highestImpactTechnology =
      [...graph.nodes].sort((a, b) => {
        if (
          b.impactScore !== a.impactScore
        ) {
          return (
            b.impactScore - a.impactScore
          );
        }

        return a.technology.localeCompare(
          b.technology
        );
      })[0] || null;

    return {
      user,

      summary: {
        totalRepositories:
          graph.repositories.length,

        trackedRepositories:
          graph.repositories.filter(
            (repository) =>
              repository.isTracked
          ).length,

        totalTechnologies:
          graph.nodes.length,

        totalRelationships:
          graph.relationships.length,

        mostCentralTechnology,

        highestImpactTechnology,

        strongestRelationship:
          graph.relationships[0] || null,

        criticalImpactTechnologies:
          graph.nodes.filter(
            (node) =>
              node.impactLevel === "CRITICAL"
          ).length,

        highImpactTechnologies:
          graph.nodes.filter(
            (node) =>
              node.impactLevel === "HIGH"
          ).length,
      },

      technologies: graph.nodes,

      relationships: graph.relationships,
    };
  },

  async getTechnologyDependencyDetail({
    userId,
    technology,
  }: {
    userId: string;
    technology: string;
  }): Promise<TechnologyDependencyDetail | null> {
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

    const sourceRepositories =
      await loadUserRepositories(userId);

    const graph = buildDependencyGraph(
      sourceRepositories
    );

    const node = findTechnologyNode(
      graph,
      technology
    );

    if (!node) {
      return null;
    }

    const relationships =
      getTechnologyRelationships(
        graph,
        technology
      );

    const architectureDomainCounts =
      new Map<string, number>();

    const repositoryTypeCounts =
      new Map<string, number>();

    const capabilityCounts =
      new Map<string, number>();

    const repositories =
      graph.repositories
        .filter((repository) =>
          repository.signals.technologies.some(
            (repositoryTechnology) =>
              normalize(
                repositoryTechnology
              ) === normalize(technology)
          )
        )
        .map((repository) => {
          repository.signals.architectureDomains.forEach(
            (domain) =>
              increment(
                architectureDomainCounts,
                domain
              )
          );

          repository.signals.repositoryTypes.forEach(
            (repositoryType) =>
              increment(
                repositoryTypeCounts,
                repositoryType
              )
          );

          repository.signals.capabilities.forEach(
            (capability) =>
              increment(
                capabilityCounts,
                capability
              )
          );

          const relationshipCount =
            relationships.filter(
              (relationship) =>
                relationship.sharedRepositoryIds.includes(
                  repository.id
                )
            ).length;

          return {
            id: repository.id,
            name: repository.name,
            fullName: repository.fullName,
            language: repository.language,
            isTracked: repository.isTracked,
            architectureDomains:
              repository.signals
                .architectureDomains,
            repositoryTypes:
              repository.signals
                .repositoryTypes,
            capabilities:
              repository.signals.capabilities,
            technologies:
              repository.signals.technologies,
            relationshipCount,
            updatedAt: repository.updatedAt,
          };
        })
        .sort((a, b) => {
          if (
            b.relationshipCount !==
            a.relationshipCount
          ) {
            return (
              b.relationshipCount -
              a.relationshipCount
            );
          }

          return a.fullName.localeCompare(
            b.fullName
          );
        });

    const relatedTechnologies =
      relationships
        .map((relationship) => ({
          technology:
            normalize(relationship.source) ===
              normalize(technology)
              ? relationship.target
              : relationship.source,

          sharedRepositories:
            relationship.sharedRepositories,

          strength: relationship.strength,

          sharedRepositoryNames:
            relationship.sharedRepositoryNames,
        }))
        .sort((a, b) => {
          if (b.strength !== a.strength) {
            return b.strength - a.strength;
          }

          return (
            b.sharedRepositories -
            a.sharedRepositories
          );
        });

    return {
      user,
      technology: node,
      repositories,
      relationships,
      relatedTechnologies,
      architectureDomains: toCountArray(
        architectureDomainCounts
      ),
      repositoryTypes: toCountArray(
        repositoryTypeCounts
      ),
      capabilities: toCountArray(
        capabilityCounts
      ),
    };
  },

  async getTechnologyImpact({
    userId,
    technology,
  }: {
    userId: string;
    technology: string;
  }): Promise<TechnologyImpactReport | null> {
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

    const sourceRepositories =
      await loadUserRepositories(userId);

    const graph = buildDependencyGraph(
      sourceRepositories
    );

    const node = findTechnologyNode(
      graph,
      technology
    );

    if (!node) {
      return null;
    }

    const relationships =
      getTechnologyRelationships(
        graph,
        technology
      );

    const affectedRepositories =
      graph.repositories
        .filter((repository) =>
          repository.signals.technologies.some(
            (repositoryTechnology) =>
              normalize(
                repositoryTechnology
              ) === normalize(technology)
          )
        )
        .map((repository) => {
          const relatedTechnologies =
            repository.signals.technologies
              .filter(
                (repositoryTechnology) =>
                  normalize(
                    repositoryTechnology
                  ) !== normalize(technology)
              )
              .sort((a, b) =>
                a.localeCompare(b)
              );

          /*
           * Contribution estimates how much of the total impact comes from
           * this repository based on its technology, architecture and
           * capability density.
           */
          const impactContributionScore =
            calculateRepositoryImpactContribution({
              relatedTechnologyCount:
                relatedTechnologies.length,

              architectureDomainCount:
                repository.signals
                  .architectureDomains.length,

              capabilityCount:
                repository.signals
                  .capabilities.length,

              isTracked:
                repository.isTracked,
            });

          return {
            id: repository.id,
            name: repository.name,
            fullName: repository.fullName,
            language: repository.language,
            isTracked: repository.isTracked,
            architectureDomains:
              repository.signals
                .architectureDomains,
            repositoryTypes:
              repository.signals
                .repositoryTypes,
            capabilities:
              repository.signals.capabilities,
            relatedTechnologies,
            impactContributionScore,
          };
        })
        .sort(
          (a, b) =>
            b.impactContributionScore -
            a.impactContributionScore
        );

    const relatedTechnologies =
      relationships
        .map((relationship) => ({
          technology:
            normalize(relationship.source) ===
              normalize(technology)
              ? relationship.target
              : relationship.source,

          sharedRepositories:
            relationship.sharedRepositories,

          strength: relationship.strength,
        }))
        .sort((a, b) => {
          if (b.strength !== a.strength) {
            return b.strength - a.strength;
          }

          return (
            b.sharedRepositories -
            a.sharedRepositories
          );
        });

    return {
      user,

      technology: node.technology,

      summary: {
        affectedRepositoryCount:
          affectedRepositories.length,

        trackedRepositoryCount:
          affectedRepositories.filter(
            (repository) =>
              repository.isTracked
          ).length,

        relatedTechnologyCount:
          node.connectedTechnologyCount,

        architectureDomainCount:
          node.architectureDomains.length,

        repositoryTypeCount:
          node.repositoryTypes.length,

        capabilityCount:
          node.capabilities.length,

        impactScore: node.impactScore,

        impactLevel: node.impactLevel,
      },

      affectedRepositories,

      relatedTechnologies,

      architectureDomains:
        node.architectureDomains,

      repositoryTypes: node.repositoryTypes,

      capabilities: node.capabilities,

      warnings: buildImpactWarnings({
        node,
        relationships,
      }),

      explanation:
        buildImpactExplanation(node),
    };
  },
};
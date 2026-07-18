import { Prisma } from "@prisma/client";
import { prisma } from "@archive/database";

import type {
  KnowledgeGraphEdge,
  KnowledgeGraphNode,
  PortfolioKnowledgeGraph,
  RepositoryGraphSignals,
  RepositoryKnowledgeGraph,
} from "../types/knowledge-graph.types";

type RepositorySignalSource = {
  id: string;
  name: string;
  fullName: string;

  intelligenceSnapshots: Array<{
    technologies: Prisma.JsonValue;
    architectureDomains: Prisma.JsonValue;
    repositoryTypes: Prisma.JsonValue;
    capabilities: Prisma.JsonValue;
  }>;

  architectureChanges: Array<{
    architectureDomain: string | null;
    detectedTechnology: string | null;
    repositoryTypes: string | null;
  }>;
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

    return typeof candidate === "string" ? [candidate] : [];
  });

  return uniqueSorted(capabilities);
};

const splitStoredValues = (value?: string | null) => {
  if (!value) {
    return [];
  }

  return value
    .split(/[,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const extractSignals = (
  repository: RepositorySignalSource
): RepositoryGraphSignals => {
  const latestSnapshot = repository.intelligenceSnapshots[0];

  /*
   * The latest intelligence snapshot is the preferred source because it
   * represents one complete intelligence refresh rather than accumulated
   * repository history.
   */
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

  /*
   * Older repositories may not have a snapshot yet. Architecture changes
   * provide a compatible fallback until intelligence is refreshed.
   */
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
        splitStoredValues(change.repositoryTypes)
      )
    ),

    capabilities: [],
  };
};

const normalizeNodeValue = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const formatLabel = (value: string) => {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
};

const createSignalNode = ({
  type,
  value,
}: {
  type:
    | "TECHNOLOGY"
    | "ARCHITECTURE_DOMAIN"
    | "REPOSITORY_TYPE"
    | "CAPABILITY";
  value: string;
}): KnowledgeGraphNode => {
  return {
    id: `${type.toLowerCase()}:${normalizeNodeValue(value)}`,
    type,
    label: type === "TECHNOLOGY" ? value : formatLabel(value),
    value,
    repositoryId: null,
    metadata: {},
  };
};

const calculateSimilarity = (
  source: RepositoryGraphSignals,
  target: RepositoryGraphSignals
) => {
  const sourceValues = new Set([
    ...source.technologies.map((value) => `technology:${value}`),
    ...source.architectureDomains.map(
      (value) => `domain:${value}`
    ),
    ...source.repositoryTypes.map((value) => `type:${value}`),
    ...source.capabilities.map(
      (value) => `capability:${value}`
    ),
  ]);

  const targetValues = new Set([
    ...target.technologies.map((value) => `technology:${value}`),
    ...target.architectureDomains.map(
      (value) => `domain:${value}`
    ),
    ...target.repositoryTypes.map((value) => `type:${value}`),
    ...target.capabilities.map(
      (value) => `capability:${value}`
    ),
  ]);

  const shared = Array.from(sourceValues).filter((value) =>
    targetValues.has(value)
  );

  const union = new Set([
    ...Array.from(sourceValues),
    ...Array.from(targetValues),
  ]);

  if (union.size === 0) {
    return {
      score: 0,
      sharedSignals: [],
    };
  }

  return {
    score: Math.round((shared.length / union.size) * 100),
    sharedSignals: shared.map((value) =>
      value.slice(value.indexOf(":") + 1)
    ),
  };
};

const loadRepositorySignalSource = async (
  repositoryId: string
) => {
  return prisma.repository.findUnique({
    where: {
      id: repositoryId,
    },
    select: {
      id: true,
      name: true,
      fullName: true,

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
        },
      },

      architectureChanges: {
        select: {
          architectureDomain: true,
          detectedTechnology: true,
          repositoryTypes: true,
        },
      },
    },
  });
};

export const knowledgeGraphService = {
  async getRepositoryGraph(
    repositoryId: string
  ): Promise<RepositoryKnowledgeGraph | null> {
    const repository =
      await loadRepositorySignalSource(repositoryId);

    if (!repository) {
      return null;
    }

    const signals = extractSignals(repository);

    const repositoryNode: KnowledgeGraphNode = {
      id: `repository:${repository.id}`,
      type: "REPOSITORY",
      label: repository.fullName,
      value: repository.id,
      repositoryId: repository.id,
      metadata: {
        name: repository.name,
        fullName: repository.fullName,
      },
    };

    const nodes: KnowledgeGraphNode[] = [repositoryNode];
    const edges: KnowledgeGraphEdge[] = [];

    const appendSignals = ({
      values,
      type,
      edgeType,
      edgeLabel,
    }: {
      values: string[];
      type:
        | "TECHNOLOGY"
        | "ARCHITECTURE_DOMAIN"
        | "REPOSITORY_TYPE"
        | "CAPABILITY";
      edgeType:
        | "USES_TECHNOLOGY"
        | "HAS_ARCHITECTURE_DOMAIN"
        | "CLASSIFIED_AS"
        | "HAS_CAPABILITY";
      edgeLabel: string;
    }) => {
      values.forEach((value) => {
        const node = createSignalNode({
          type,
          value,
        });

        nodes.push(node);

        edges.push({
          id: `${repositoryNode.id}:${edgeType}:${node.id}`,
          source: repositoryNode.id,
          target: node.id,
          type: edgeType,
          label: edgeLabel,
          weight: 1,
          metadata: {},
        });
      });
    };

    appendSignals({
      values: signals.technologies,
      type: "TECHNOLOGY",
      edgeType: "USES_TECHNOLOGY",
      edgeLabel: "Uses technology",
    });

    appendSignals({
      values: signals.architectureDomains,
      type: "ARCHITECTURE_DOMAIN",
      edgeType: "HAS_ARCHITECTURE_DOMAIN",
      edgeLabel: "Has architecture domain",
    });

    appendSignals({
      values: signals.repositoryTypes,
      type: "REPOSITORY_TYPE",
      edgeType: "CLASSIFIED_AS",
      edgeLabel: "Classified as",
    });

    appendSignals({
      values: signals.capabilities,
      type: "CAPABILITY",
      edgeType: "HAS_CAPABILITY",
      edgeLabel: "Has capability",
    });

    return {
      repository: {
        id: repository.id,
        name: repository.name,
        fullName: repository.fullName,
      },

      signals,
      nodes,
      edges,

      summary: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        technologies: signals.technologies.length,
        architectureDomains:
          signals.architectureDomains.length,
        repositoryTypes: signals.repositoryTypes.length,
        capabilities: signals.capabilities.length,
      },
    };
  },

  async getPortfolioGraph(
    userId: string
  ): Promise<PortfolioKnowledgeGraph | null> {
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

    const repositories = await prisma.repository.findMany({
      where: {
        userId,
        isTracked: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        name: true,
        fullName: true,

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
          },
        },

        architectureChanges: {
          select: {
            architectureDomain: true,
            detectedTechnology: true,
            repositoryTypes: true,
          },
        },
      },
    });

    const repositorySignals = repositories.map((repository) => ({
      id: repository.id,
      name: repository.name,
      fullName: repository.fullName,
      signals: extractSignals(repository),
    }));

    const nodeMap = new Map<string, KnowledgeGraphNode>();
    const edgeMap = new Map<string, KnowledgeGraphEdge>();

    repositorySignals.forEach((repository) => {
      const repositoryNode: KnowledgeGraphNode = {
        id: `repository:${repository.id}`,
        type: "REPOSITORY",
        label: repository.fullName,
        value: repository.id,
        repositoryId: repository.id,
        metadata: {
          name: repository.name,
          fullName: repository.fullName,
        },
      };

      nodeMap.set(repositoryNode.id, repositoryNode);

      const connectSignals = ({
        values,
        type,
        edgeType,
        edgeLabel,
      }: {
        values: string[];
        type:
          | "TECHNOLOGY"
          | "ARCHITECTURE_DOMAIN"
          | "REPOSITORY_TYPE"
          | "CAPABILITY";
        edgeType:
          | "USES_TECHNOLOGY"
          | "HAS_ARCHITECTURE_DOMAIN"
          | "CLASSIFIED_AS"
          | "HAS_CAPABILITY";
        edgeLabel: string;
      }) => {
        values.forEach((value) => {
          const signalNode = createSignalNode({
            type,
            value,
          });

          nodeMap.set(signalNode.id, signalNode);

          const edge: KnowledgeGraphEdge = {
            id: `${repositoryNode.id}:${edgeType}:${signalNode.id}`,
            source: repositoryNode.id,
            target: signalNode.id,
            type: edgeType,
            label: edgeLabel,
            weight: 1,
            metadata: {},
          };

          edgeMap.set(edge.id, edge);
        });
      };

      connectSignals({
        values: repository.signals.technologies,
        type: "TECHNOLOGY",
        edgeType: "USES_TECHNOLOGY",
        edgeLabel: "Uses technology",
      });

      connectSignals({
        values: repository.signals.architectureDomains,
        type: "ARCHITECTURE_DOMAIN",
        edgeType: "HAS_ARCHITECTURE_DOMAIN",
        edgeLabel: "Has architecture domain",
      });

      connectSignals({
        values: repository.signals.repositoryTypes,
        type: "REPOSITORY_TYPE",
        edgeType: "CLASSIFIED_AS",
        edgeLabel: "Classified as",
      });

      connectSignals({
        values: repository.signals.capabilities,
        type: "CAPABILITY",
        edgeType: "HAS_CAPABILITY",
        edgeLabel: "Has capability",
      });
    });

    /*
     * Repository similarity edges expose relationships that are not obvious
     * from individual repository reports. A small threshold prevents weak,
     * noisy relationships from overwhelming the graph.
     */
    for (
      let sourceIndex = 0;
      sourceIndex < repositorySignals.length;
      sourceIndex += 1
    ) {
      for (
        let targetIndex = sourceIndex + 1;
        targetIndex < repositorySignals.length;
        targetIndex += 1
      ) {
        const source = repositorySignals[sourceIndex];
        const target = repositorySignals[targetIndex];

        const similarity = calculateSimilarity(
          source.signals,
          target.signals
        );

        if (similarity.score < 20) {
          continue;
        }

        const edge: KnowledgeGraphEdge = {
          id: `similarity:${source.id}:${target.id}`,
          source: `repository:${source.id}`,
          target: `repository:${target.id}`,
          type: "SIMILAR_TO",
          label: `${similarity.score}% similar`,
          weight: similarity.score / 100,
          metadata: {
            similarityScore: similarity.score,
            sharedSignals: similarity.sharedSignals,
          },
        };

        edgeMap.set(edge.id, edge);
      }
    }

    const nodes = Array.from(nodeMap.values());
    const edges = Array.from(edgeMap.values());

    const similarityRelationships = edges.filter(
      (edge) => edge.type === "SIMILAR_TO"
    ).length;

    return {
      user,
      nodes,
      edges,
      repositories: repositorySignals,

      summary: {
        totalRepositories: repositorySignals.length,
        totalNodes: nodes.length,
        totalEdges: edges.length,

        totalTechnologies: nodes.filter(
          (node) => node.type === "TECHNOLOGY"
        ).length,

        totalArchitectureDomains: nodes.filter(
          (node) => node.type === "ARCHITECTURE_DOMAIN"
        ).length,

        totalRepositoryTypes: nodes.filter(
          (node) => node.type === "REPOSITORY_TYPE"
        ).length,

        totalCapabilities: nodes.filter(
          (node) => node.type === "CAPABILITY"
        ).length,

        similarityRelationships,
      },
    };
  },
};
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Network,
  RefreshCcw,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { EngineeringKnowledgeGraph } from "@/components/knowledge-graph/EngineeringKnowledgeGraph";
import { KnowledgeGraphSummary } from "@/components/knowledge-graph/KnowledgeGraphSummary";
import { RepositoryIntelligenceNav } from "@/components/repositories/RepositoryIntelligenceNav";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useRepositoryKnowledgeGraph } from "@/hooks/useRepositories";
import { formatIntelligenceLabel } from "@/lib/intelligence-labels";

import type {
  KnowledgeGraphEdge,
  KnowledgeGraphEdgeType,
  KnowledgeGraphNode,
  KnowledgeGraphNodeType,
  KnowledgeGraphSummary as KnowledgeGraphSummaryData,
} from "@/types/knowledge-graph.types";

import type {
  LegacyKnowledgeGraphEdge,
  RepositoryKnowledgeGraphResponse,
} from "@/types/repository-knowledge-graph.types";

function createNodeId(type: KnowledgeGraphNodeType, value: string) {
  const normalizedValue = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${type.toLowerCase()}:${normalizedValue}`;
}

function inferRelationshipType(
  relationship?: string | null
): KnowledgeGraphEdgeType {
  const normalized = relationship
    ?.trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  if (
    normalized === "USES_TECHNOLOGY" ||
    normalized === "USES"
  ) {
    return "USES_TECHNOLOGY";
  }

  if (
    normalized === "HAS_CAPABILITY" ||
    normalized === "CAPABILITY"
  ) {
    return "HAS_CAPABILITY";
  }

  if (
    normalized === "CLASSIFIED_AS" ||
    normalized === "REPOSITORY_TYPE"
  ) {
    return "CLASSIFIED_AS";
  }

  if (
    normalized === "HAS_ARCHITECTURE_DOMAIN" ||
    normalized === "ARCHITECTURE_DOMAIN" ||
    normalized === "BELONGS_TO_DOMAIN"
  ) {
    return "HAS_ARCHITECTURE_DOMAIN";
  }

  return normalized || "RELATIONSHIP";
}

function getReadableRelationshipLabel(
  type: KnowledgeGraphEdgeType
) {
  switch (type) {
    case "USES_TECHNOLOGY":
      return "Uses Technology";

    case "HAS_CAPABILITY":
      return "Has Capability";

    case "CLASSIFIED_AS":
      return "Classified As";

    case "HAS_ARCHITECTURE_DOMAIN":
      return "Has Architecture Domain";

    default:
      return formatIntelligenceLabel(type);
  }
}

function normalizeRichNodes(
  nodes?: KnowledgeGraphNode[]
): KnowledgeGraphNode[] {
  if (!Array.isArray(nodes)) {
    return [];
  }

  return nodes
    .filter(
      (node): node is KnowledgeGraphNode =>
        Boolean(
          node &&
          typeof node.id === "string" &&
          typeof node.type === "string" &&
          typeof node.label === "string"
        )
    )
    .map((node) => ({
      ...node,
      value: node.value ?? node.label,
      metadata:
        node.metadata &&
          typeof node.metadata === "object"
          ? node.metadata
          : null,
    }));
}

function normalizeRichEdges(
  edges?: KnowledgeGraphEdge[]
): KnowledgeGraphEdge[] {
  if (!Array.isArray(edges)) {
    return [];
  }

  return edges
    .filter(
      (edge): edge is KnowledgeGraphEdge =>
        Boolean(
          edge &&
          typeof edge.source === "string" &&
          typeof edge.target === "string"
        )
    )
    .map((edge, index) => {
      const type = inferRelationshipType(
        edge.type ||
        edge.label ||
        edge.relationship
      );

      return {
        ...edge,
        id:
          edge.id ||
          `${edge.source}-${edge.target}-${type}-${index}`,

        type,

        label:
          edge.label ||
          getReadableRelationshipLabel(type),

        relationship:
          edge.relationship ||
          getReadableRelationshipLabel(type),
      };
    });
}

function createLegacyNode(
  type: KnowledgeGraphNodeType,
  value: string
): KnowledgeGraphNode {
  return {
    id: createNodeId(type, value),
    type,
    label: formatIntelligenceLabel(value),
    value,
    metadata: {
      source: "legacy-knowledge-graph",
    },
  };
}

function normalizeLegacyGraph(
  data: RepositoryKnowledgeGraphResponse,
  repositoryId: string
) {
  const repositoryLabel =
    data.repository?.fullName ||
    data.repository?.name ||
    "Repository";

  const repositoryNode: KnowledgeGraphNode = {
    id: data.repository?.id || repositoryId,
    type: "REPOSITORY",
    label: repositoryLabel,
    value:
      data.repository?.fullName ||
      data.repository?.name ||
      repositoryId,

    metadata: {
      repositoryId:
        data.repository?.id || repositoryId,

      name: data.repository?.name || null,

      fullName:
        data.repository?.fullName || null,

      source: "legacy-knowledge-graph",
    },
  };

  const technologyNodes = (
    data.nodes?.technologies ?? []
  ).map((technology) =>
    createLegacyNode("TECHNOLOGY", technology)
  );

  const architectureDomainNodes = (
    data.nodes?.domains ?? []
  ).map((domain) =>
    createLegacyNode(
      "ARCHITECTURE_DOMAIN",
      domain
    )
  );

  const repositoryTypeNodes = (
    data.nodes?.repositoryTypes ?? []
  ).map((repositoryType) =>
    createLegacyNode(
      "REPOSITORY_TYPE",
      repositoryType
    )
  );

  const capabilityNodes = (
    data.nodes?.capabilities ?? []
  ).map((capability) =>
    createLegacyNode("CAPABILITY", capability)
  );

  const nodes = [
    repositoryNode,
    ...technologyNodes,
    ...architectureDomainNodes,
    ...repositoryTypeNodes,
    ...capabilityNodes,
  ];

  const nodeByValue = new Map<string, KnowledgeGraphNode>();

  nodes.forEach((node) => {
    nodeByValue.set(node.id, node);

    nodeByValue.set(
      node.value?.toLowerCase() || "",
      node
    );

    nodeByValue.set(
      node.label.toLowerCase(),
      node
    );
  });

  function resolveLegacyNode(
    value: string
  ): KnowledgeGraphNode | undefined {
    const normalized = value.trim().toLowerCase();

    if (
      normalized === repositoryId.toLowerCase() ||
      normalized ===
      data.repository?.name?.toLowerCase() ||
      normalized ===
      data.repository?.fullName?.toLowerCase()
    ) {
      return repositoryNode;
    }

    return nodeByValue.get(normalized);
  }

  const explicitLegacyEdges = (
    data.graph ?? []
  )
    .map((edge, index) =>
      normalizeLegacyEdge(
        edge,
        index,
        repositoryNode,
        resolveLegacyNode
      )
    )
    .filter(
      (edge): edge is KnowledgeGraphEdge =>
        edge !== null
    );

  /*
   * Older responses sometimes included node arrays without relationship
   * records. These generated edges preserve a useful graph while still
   * treating the richer backend graph as the preferred source.
   */
  const generatedEdges: KnowledgeGraphEdge[] = [
    ...technologyNodes.map((node, index) => ({
      id: `legacy-technology-${index}`,
      source: repositoryNode.id,
      target: node.id,
      type: "USES_TECHNOLOGY",
      label: "Uses Technology",
      relationship: "Uses Technology",
    })),

    ...architectureDomainNodes.map(
      (node, index) => ({
        id: `legacy-domain-${index}`,
        source: repositoryNode.id,
        target: node.id,
        type: "HAS_ARCHITECTURE_DOMAIN",
        label: "Has Architecture Domain",
        relationship:
          "Has Architecture Domain",
      })
    ),

    ...repositoryTypeNodes.map(
      (node, index) => ({
        id: `legacy-type-${index}`,
        source: repositoryNode.id,
        target: node.id,
        type: "CLASSIFIED_AS",
        label: "Classified As",
        relationship: "Classified As",
      })
    ),

    ...capabilityNodes.map((node, index) => ({
      id: `legacy-capability-${index}`,
      source: repositoryNode.id,
      target: node.id,
      type: "HAS_CAPABILITY",
      label: "Has Capability",
      relationship: "Has Capability",
    })),
  ];

  const edges =
    explicitLegacyEdges.length > 0
      ? explicitLegacyEdges
      : generatedEdges;

  return {
    nodes,
    edges,
    summary: createSummary(nodes, edges),
  };
}

function normalizeLegacyEdge(
  edge: LegacyKnowledgeGraphEdge,
  index: number,
  repositoryNode: KnowledgeGraphNode,
  resolveNode: (
    value: string
  ) => KnowledgeGraphNode | undefined
): KnowledgeGraphEdge | null {
  const sourceNode =
    resolveNode(edge.source) ||
    (edge.source === repositoryNode.label
      ? repositoryNode
      : undefined);

  const targetNode =
    resolveNode(edge.target) ||
    (edge.target === repositoryNode.label
      ? repositoryNode
      : undefined);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const type = inferRelationshipType(
    edge.relationship
  );

  return {
    id: `legacy-edge-${index}`,
    source: sourceNode.id,
    target: targetNode.id,
    type,
    label: getReadableRelationshipLabel(type),
    relationship: edge.relationship,
    metadata: {
      source: "legacy-knowledge-graph",
    },
  };
}

function createSummary(
  nodes: KnowledgeGraphNode[],
  edges: KnowledgeGraphEdge[]
): KnowledgeGraphSummaryData {
  return {
    totalRepositories: nodes.filter(
      (node) => node.type === "REPOSITORY"
    ).length,

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

    similarityRelationships: edges.filter(
      (edge) =>
        edge.type === "REPOSITORY_SIMILARITY" ||
        edge.type === "SIMILAR_TO"
    ).length,
  };
}

export default function RepositoryKnowledgeGraphPage() {
  const params = useParams<{ repoId: string }>();
  const repositoryId = params.repoId;

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } =
    useRepositoryKnowledgeGraph(repositoryId);

  const normalizedGraph = useMemo(() => {
    if (!data) {
      return {
        nodes: [],
        edges: [],
        summary: createSummary([], []),
        usesRichGraph: false,
      };
    }

    const richNodes = normalizeRichNodes(
      data.knowledgeGraph?.nodes
    );

    const richEdges = normalizeRichEdges(
      data.knowledgeGraph?.edges
    );

    if (richNodes.length > 0) {
      return {
        nodes: richNodes,
        edges: richEdges,

        summary:
          data.knowledgeGraph?.summary ||
          createSummary(
            richNodes,
            richEdges
          ),

        usesRichGraph: true,
      };
    }

    const legacyGraph = normalizeLegacyGraph(
      data,
      repositoryId
    );

    return {
      ...legacyGraph,
      usesRichGraph: false,
    };
  }, [data, repositoryId]);

  const repositoryName =
    data?.repository?.fullName ||
    data?.repository?.name;

  return (
    <AppShell>
      <PageContent>
        <div className="space-y-6">
          <Button
            asChild
            variant="ghost"
            className="px-0"
          >
            <Link
              href={`/repositories/${repositoryId}`}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to repository overview
            </Link>
          </Button>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Network className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">
                      Repository Knowledge Graph
                    </h1>

                    {repositoryName && (
                      <Badge variant="secondary">
                        {repositoryName}
                      </Badge>
                    )}
                  </div>

                  <p className="mt-2 max-w-3xl text-muted-foreground">
                    Explore how this repository connects to
                    technologies, architecture domains,
                    repository classifications, and engineering
                    capabilities.
                  </p>

                  <p className="mt-3 text-xs text-muted-foreground">
                    {normalizedGraph.usesRichGraph
                      ? "Rendering the upgraded engineering knowledge graph."
                      : "Rendering the backwards-compatible repository graph."}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCcw
                  className={`mr-2 h-4 w-4 ${isFetching
                      ? "animate-spin"
                      : ""
                    }`}
                />

                {isFetching
                  ? "Refreshing..."
                  : "Refresh Graph"}
              </Button>
            </div>
          </div>

          <RepositoryIntelligenceNav
            repositoryId={repositoryId}
          />

          {isLoading && (
            <RepositoryGraphSkeleton />
          )}

          {isError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
              <p className="font-medium text-destructive">
                Failed to load knowledge graph
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "ArcHive could not load this repository's knowledge graph."}
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-5"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCcw
                  className={`mr-2 h-4 w-4 ${isFetching
                      ? "animate-spin"
                      : ""
                    }`}
                />

                Retry
              </Button>
            </div>
          )}

          {!isLoading &&
            !isError &&
            data && (
              <>
                <KnowledgeGraphSummary
                  summary={
                    normalizedGraph.summary
                  }
                />

                <EngineeringKnowledgeGraph
                  nodes={normalizedGraph.nodes}
                  edges={normalizedGraph.edges}
                  emptyTitle="No repository graph available"
                  emptyDescription="ArcHive has not detected enough technologies, architecture domains, repository types, or capabilities to build this repository graph yet."
                />
              </>
            )}
        </div>
      </PageContent>
    </AppShell>
  );
}

function RepositoryGraphSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 6 }).map(
          (_, index) => (
            <Skeleton
              key={index}
              className="h-36 rounded-xl"
            />
          )
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Skeleton className="h-[680px] rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
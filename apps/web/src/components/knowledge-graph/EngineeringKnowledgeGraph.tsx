"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  Boxes,
  Braces,
  CircleDot,
  Layers3,
  Network,
  Puzzle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { formatIntelligenceLabel } from "@/lib/intelligence-labels";
import { cn } from "@/lib/utils";

import { KnowledgeGraphDetailsPanel } from "@/components/knowledge-graph/KnowledgeGraphDetailsPanel";

import type {
  KnowledgeGraphEdge,
  KnowledgeGraphNode,
} from "@/types/knowledge-graph.types";

interface EngineeringKnowledgeGraphProps {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  height?: number;
  emptyTitle?: string;
  emptyDescription?: string;
}

interface PositionedNode extends KnowledgeGraphNode {
  x: number;
  y: number;
}

const GRAPH_WIDTH = 1200;
const DEFAULT_GRAPH_HEIGHT = 680;

function getNodeConfiguration(type: string) {
  switch (type) {
    case "REPOSITORY":
      return {
        icon: Boxes,
        className:
          "border-primary/40 bg-primary/10 text-primary",
        radius: 46,
      };

    case "TECHNOLOGY":
      return {
        icon: Braces,
        className:
          "border-blue-500/40 bg-blue-500/10 text-blue-500",
        radius: 38,
      };

    case "ARCHITECTURE_DOMAIN":
      return {
        icon: Layers3,
        className:
          "border-violet-500/40 bg-violet-500/10 text-violet-500",
        radius: 40,
      };

    case "REPOSITORY_TYPE":
      return {
        icon: Network,
        className:
          "border-amber-500/40 bg-amber-500/10 text-amber-500",
        radius: 40,
      };

    case "CAPABILITY":
      return {
        icon: Puzzle,
        className:
          "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
        radius: 38,
      };

    default:
      return {
        icon: CircleDot,
        className:
          "border-border bg-muted text-muted-foreground",
        radius: 36,
      };
  }
}

function getEdgeLabel(edge: KnowledgeGraphEdge) {
  const type =
    edge.type ||
    edge.label ||
    edge.relationship ||
    "RELATIONSHIP";

  switch (type) {
    case "USES_TECHNOLOGY":
      return "Uses Technology";

    case "HAS_CAPABILITY":
      return "Has Capability";

    case "CLASSIFIED_AS":
      return "Classified As";

    case "HAS_ARCHITECTURE_DOMAIN":
      return "Has Architecture Domain";

    case "REPOSITORY_SIMILARITY": {
      const score = edge.similarity?.similarityScore;

      if (typeof score !== "number") {
        return "Repository Similarity";
      }

      const percentage =
        score <= 1 ? score * 100 : score;

      return `${Math.round(percentage)}% similar`;
    }

    default:
      return formatIntelligenceLabel(type);
  }
}

function isSimilarityEdge(edge: KnowledgeGraphEdge) {
  return edge.type === "REPOSITORY_SIMILARITY";
}

function createPositionedNodes(
  nodes: KnowledgeGraphNode[],
  height: number
): PositionedNode[] {
  if (nodes.length === 0) {
    return [];
  }

  const centreX = GRAPH_WIDTH / 2;
  const centreY = height / 2;

  const repositories = nodes.filter(
    (node) => node.type === "REPOSITORY"
  );

  const secondaryNodes = nodes.filter(
    (node) => node.type !== "REPOSITORY"
  );

  const positionedRepositories = repositories.map(
    (node, index) => {
      if (repositories.length === 1) {
        return {
          ...node,
          x: centreX,
          y: centreY,
        };
      }

      const angle =
        (index / repositories.length) *
          Math.PI *
          2 -
        Math.PI / 2;

      const radius = Math.min(
        GRAPH_WIDTH,
        height
      ) * 0.2;

      return {
        ...node,
        x: centreX + Math.cos(angle) * radius,
        y: centreY + Math.sin(angle) * radius,
      };
    }
  );

  const outerRadius = Math.min(
    GRAPH_WIDTH,
    height
  ) * 0.4;

  const positionedSecondaryNodes = secondaryNodes.map(
    (node, index) => {
      const angle =
        (index / Math.max(secondaryNodes.length, 1)) *
          Math.PI *
          2 -
        Math.PI / 2;

      return {
        ...node,
        x: centreX + Math.cos(angle) * outerRadius,
        y: centreY + Math.sin(angle) * outerRadius,
      };
    }
  );

  return [
    ...positionedRepositories,
    ...positionedSecondaryNodes,
  ];
}

function truncateLabel(
  value: string,
  maxLength = 19
) {
  return value.length > maxLength
    ? `${value.slice(0, maxLength - 1)}…`
    : value;
}

export function EngineeringKnowledgeGraph({
  nodes,
  edges,
  height = DEFAULT_GRAPH_HEIGHT,
  emptyTitle = "No knowledge graph available",
  emptyDescription = "ArcHive has not detected enough engineering relationships to build this graph yet.",
}: EngineeringKnowledgeGraphProps) {
  const [selectedNode, setSelectedNode] =
    useState<KnowledgeGraphNode | null>(null);

  const [selectedEdge, setSelectedEdge] =
    useState<KnowledgeGraphEdge | null>(null);

  const positionedNodes = useMemo(
    () => createPositionedNodes(nodes, height),
    [height, nodes]
  );

  const nodeMap = useMemo(() => {
    return new Map(
      positionedNodes.map((node) => [
        node.id,
        node,
      ])
    );
  }, [positionedNodes]);

  const visibleEdges = useMemo(() => {
    return edges.filter(
      (edge) =>
        nodeMap.has(edge.source) &&
        nodeMap.has(edge.target)
    );
  }, [edges, nodeMap]);

  function selectNode(node: KnowledgeGraphNode) {
    setSelectedNode(node);
    setSelectedEdge(null);
  }

  function selectEdge(edge: KnowledgeGraphEdge) {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }

  function clearSelection() {
    setSelectedNode(null);
    setSelectedEdge(null);
  }

  if (positionedNodes.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <Network className="mx-auto h-10 w-10 text-muted-foreground" />

        <h2 className="mt-4 text-xl font-semibold">
          {emptyTitle}
        </h2>

        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-col justify-between gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold">
              Engineering Knowledge Graph
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Select a node or relationship to inspect its
              details.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <LegendBadge
              label="Repository"
              type="REPOSITORY"
            />

            <LegendBadge
              label="Technology"
              type="TECHNOLOGY"
            />

            <LegendBadge
              label="Architecture"
              type="ARCHITECTURE_DOMAIN"
            />

            <LegendBadge
              label="Repository Type"
              type="REPOSITORY_TYPE"
            />

            <LegendBadge
              label="Capability"
              type="CAPABILITY"
            />
          </div>
        </div>

        <div className="w-full overflow-x-auto bg-background">
          <svg
            viewBox={`0 0 ${GRAPH_WIDTH} ${height}`}
            className="min-w-[900px]"
            style={{
              width: "100%",
              minHeight: `${Math.min(height, 680)}px`,
            }}
            role="img"
            aria-label="Engineering knowledge graph"
          >
            <defs>
              <marker
                id="knowledge-graph-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path
                  d="M0,0 L8,4 L0,8 z"
                  className="fill-muted-foreground"
                />
              </marker>

              <marker
                id="knowledge-graph-similarity-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path
                  d="M0,0 L8,4 L0,8 z"
                  className="fill-primary"
                />
              </marker>
            </defs>

            {visibleEdges.map((edge, index) => {
              const source = nodeMap.get(edge.source);
              const target = nodeMap.get(edge.target);

              if (!source || !target) {
                return null;
              }

              const similarity = isSimilarityEdge(edge);
              const midpointX =
                (source.x + target.x) / 2;
              const midpointY =
                (source.y + target.y) / 2;

              return (
                <g
                  key={
                    edge.id ||
                    `${edge.source}-${edge.target}-${index}`
                  }
                  onClick={() => selectEdge(edge)}
                  className="cursor-pointer"
                >
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    strokeWidth={similarity ? 3 : 1.5}
                    strokeDasharray={
                      similarity ? "8 5" : undefined
                    }
                    className={
                      similarity
                        ? "stroke-primary"
                        : "stroke-muted-foreground/50"
                    }
                    markerEnd={
                      similarity
                        ? "url(#knowledge-graph-similarity-arrow)"
                        : "url(#knowledge-graph-arrow)"
                    }
                  />

                  <rect
                    x={midpointX - 72}
                    y={midpointY - 12}
                    width={144}
                    height={24}
                    rx={12}
                    className="fill-card stroke-border"
                  />

                  <text
                    x={midpointX}
                    y={midpointY + 4}
                    textAnchor="middle"
                    className={
                      similarity
                        ? "fill-primary text-[11px] font-semibold"
                        : "fill-muted-foreground text-[10px]"
                    }
                  >
                    {truncateLabel(
                      getEdgeLabel(edge),
                      23
                    )}
                  </text>
                </g>
              );
            })}

            {positionedNodes.map((node) => {
              const configuration =
                getNodeConfiguration(node.type);

              const isSelected =
                selectedNode?.id === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => selectNode(node)}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                >
                  <circle
                    r={configuration.radius}
                    className={cn(
                      "stroke-2 transition",
                      configuration.className,
                      isSelected &&
                        "stroke-primary stroke-[4px]"
                    )}
                  />

                  <text
                    textAnchor="middle"
                    y="-4"
                    className="fill-current text-[11px] font-semibold"
                  >
                    {truncateLabel(node.label)}
                  </text>

                  <text
                    textAnchor="middle"
                    y="14"
                    className="fill-muted-foreground text-[9px]"
                  >
                    {formatIntelligenceLabel(node.type)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        {selectedNode || selectedEdge ? (
          <KnowledgeGraphDetailsPanel
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            onClose={clearSelection}
          />
        ) : (
          <div className="rounded-xl border border-border bg-card p-6">
            <Network className="h-6 w-6 text-primary" />

            <h2 className="mt-4 text-lg font-semibold">
              Explore the graph
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Select a graph node to inspect its type,
              value, and metadata. Select a relationship to
              inspect how two engineering entities connect.
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-5"
              disabled
            >
              No selection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function LegendBadge({
  label,
  type,
}: {
  label: string;
  type: string;
}) {
  const configuration = getNodeConfiguration(type);

  return (
    <Badge
      variant="outline"
      className={configuration.className}
    >
      {label}
    </Badge>
  );
}
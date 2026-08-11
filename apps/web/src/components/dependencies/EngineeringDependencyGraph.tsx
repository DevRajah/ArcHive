"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ComponentType } from "react";
import {
  Focus,
  Maximize2,
  Network,
  RotateCcw,
  Search,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { ImpactLevelBadge } from "@/components/dependencies/ImpactLevelBadge";
import { RelationshipStrength } from "@/components/dependencies/RelationshipStrength";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type {
  TechnologyDependencyNode,
  TechnologyRelationship,
} from "@/types/dependency-intelligence.types";

const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d"),
  {
    ssr: false,
  }
) as ComponentType<Record<string, unknown>>;

interface DependencyGraphNode extends TechnologyDependencyNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
}

type DependencyGraphLink = Omit<
  TechnologyRelationship,
  "source" | "target"
> & {
  id: string;
  source: string | DependencyGraphNode;
  target: string | DependencyGraphNode;
};

interface ForceGraphController {
  zoom: (level?: number, duration?: number) => number;
  zoomToFit: (duration?: number, padding?: number) => void;
  centerAt: (
    x?: number,
    y?: number,
    duration?: number
  ) => void;
  d3ReheatSimulation: () => void;
}

interface EngineeringDependencyGraphProps {
  technologies: TechnologyDependencyNode[];
  relationships: TechnologyRelationship[];
  height?: number;
}

const DEFAULT_HEIGHT = 760;

function percentage(value?: number | null) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, value <= 1 ? value * 100 : value)
  );
}

function getNodeId(
  value: string | DependencyGraphNode
) {
  return typeof value === "string"
    ? value
    : value.id;
}

function getNodeRadius(
  technology: DependencyGraphNode
) {
  const repositoryWeight =
    Math.max(technology.repositoryCount, 1);

  const centralityWeight =
    percentage(technology.centralityScore) / 25;

  return Math.min(
    16,
    6 + repositoryWeight * 1.5 + centralityWeight
  );
}

function getNodeFill(impactLevel: string) {
  switch (impactLevel) {
    case "CRITICAL":
      return "#fee2e2";

    case "HIGH":
      return "#ffedd5";

    case "MEDIUM":
      return "#fef3c7";

    default:
      return "#dcfce7";
  }
}

function getNodeStroke(impactLevel: string) {
  switch (impactLevel) {
    case "CRITICAL":
      return "#dc2626";

    case "HIGH":
      return "#ea580c";

    case "MEDIUM":
      return "#d97706";

    default:
      return "#16a34a";
  }
}

function truncateLabel(
  value: string,
  maximumLength = 24
) {
  if (value.length <= maximumLength) {
    return value;
  }

  return `${value.slice(0, maximumLength - 1)}…`;
}

function drawRoundedRectangle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const safeRadius = Math.min(
    radius,
    width / 2,
    height / 2
  );

  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);

  context.quadraticCurveTo(
    x + width,
    y,
    x + width,
    y + safeRadius
  );

  context.lineTo(
    x + width,
    y + height - safeRadius
  );

  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - safeRadius,
    y + height
  );

  context.lineTo(x + safeRadius, y + height);

  context.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height - safeRadius
  );

  context.lineTo(x, y + safeRadius);

  context.quadraticCurveTo(
    x,
    y,
    x + safeRadius,
    y
  );

  context.closePath();
}

export function EngineeringDependencyGraph({
  technologies,
  relationships,
  height = DEFAULT_HEIGHT,
}: EngineeringDependencyGraphProps) {
  const graphReference =
    useRef<ForceGraphController | null>(null);

  const containerReference =
    useRef<HTMLDivElement | null>(null);

  const [containerWidth, setContainerWidth] =
    useState(900);

  const [search, setSearch] = useState("");

  const [selectedNode, setSelectedNode] =
    useState<DependencyGraphNode | null>(null);

  const [selectedRelationship, setSelectedRelationship] =
    useState<TechnologyRelationship | null>(null);

  const [hoveredNodeId, setHoveredNodeId] =
    useState<string | null>(null);

  const graphData = useMemo(() => {
    const nodes: DependencyGraphNode[] =
      technologies.map((technology) => ({
        ...technology,
        id: technology.technology,
        label: technology.technology,
      }));

    const knownNodeIds = new Set(
      nodes.map((node) => node.id)
    );

    const links: DependencyGraphLink[] =
      relationships
        .filter(
          (relationship) =>
            knownNodeIds.has(relationship.source) &&
            knownNodeIds.has(relationship.target)
        )
        .map((relationship, index) => ({
          ...relationship,

          id: `${relationship.source}-${relationship.target}-${index}`,

          source: relationship.source,

          target: relationship.target,
        }));

    return {
      nodes,
      links,
    };
  }, [relationships, technologies]);

  useEffect(() => {
    const container =
      containerReference.current;

    if (!container) {
      return;
    }

    const observer = new ResizeObserver(
      (entries) => {
        const width =
          entries[0]?.contentRect.width;

        if (
          typeof width === "number" &&
          width > 0
        ) {
          setContainerWidth(width);
        }
      }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (graphData.nodes.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      graphReference.current?.zoomToFit(
        700,
        80
      );
    }, 900);

    return () => window.clearTimeout(timer);
  }, [
    graphData.links.length,
    graphData.nodes.length,
  ]);

  const focusTechnology = useCallback(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return;
    }

    const technology = graphData.nodes.find(
      (node) =>
        node.technology.toLowerCase().includes(query)
    );

    if (!technology) {
      return;
    }

    setSelectedNode(technology);
    setSelectedRelationship(null);

    if (
      typeof technology.x === "number" &&
      typeof technology.y === "number"
    ) {
      graphReference.current?.centerAt(
        technology.x,
        technology.y,
        500
      );

      graphReference.current?.zoom(2.5, 500);
    }
  }, [graphData.nodes, search]);

  const handleNodeClick = useCallback(
    (value: unknown) => {
      const node = value as DependencyGraphNode;

      setSelectedNode(node);
      setSelectedRelationship(null);

      if (
        typeof node.x === "number" &&
        typeof node.y === "number"
      ) {
        graphReference.current?.centerAt(
          node.x,
          node.y,
          500
        );

        graphReference.current?.zoom(2.4, 500);
      }
    },
    []
  );

  const handleRelationshipClick = useCallback(
    (value: unknown) => {
      const relationship =
        value as DependencyGraphLink;

      setSelectedRelationship({
        ...relationship,

        source: getNodeId(relationship.source),

        target: getNodeId(relationship.target),
      });

      setSelectedNode(null);
    },
    []
  );

  const drawNode = useCallback(
    (
      value: unknown,
      context: CanvasRenderingContext2D,
      globalScale: number
    ) => {
      const node = value as DependencyGraphNode;

      if (
        typeof node.x !== "number" ||
        typeof node.y !== "number"
      ) {
        return;
      }

      const selected =
        selectedNode?.id === node.id;

      const hovered =
        hoveredNodeId === node.id;

      const radius =
        getNodeRadius(node) *
        (selected ? 1.35 : hovered ? 1.15 : 1);

      context.save();

      context.beginPath();

      context.arc(
        node.x,
        node.y,
        radius,
        0,
        Math.PI * 2
      );

      context.fillStyle =
        getNodeFill(node.impactLevel);

      context.fill();

      context.lineWidth = selected
        ? 3
        : hovered
          ? 2
          : 1.2;

      context.strokeStyle =
        getNodeStroke(node.impactLevel);

      context.stroke();

      const showLabel =
        selected ||
        hovered ||
        node.repositoryCount > 1 ||
        globalScale >= 2;

      if (showLabel) {
        const label = truncateLabel(node.label);

        const fontSize = 10 / globalScale;

        context.font = `600 ${fontSize}px sans-serif`;

        const textWidth =
          context.measureText(label).width;

        const horizontalPadding =
          6 / globalScale;

        const verticalPadding =
          4 / globalScale;

        const width =
          textWidth + horizontalPadding * 2;

        const labelHeight =
          fontSize + verticalPadding * 2;

        const x = node.x - width / 2;

        const y =
          node.y +
          radius +
          5 / globalScale;

        drawRoundedRectangle(
          context,
          x,
          y,
          width,
          labelHeight,
          4 / globalScale
        );

        context.fillStyle =
          "rgba(255,255,255,0.95)";

        context.fill();

        context.strokeStyle =
          "rgba(148,163,184,0.7)";

        context.lineWidth = 0.8 / globalScale;

        context.stroke();

        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "#111827";

        context.fillText(
          label,
          node.x,
          y + labelHeight / 2
        );
      }

      context.restore();
    },
    [hoveredNodeId, selectedNode?.id]
  );

  if (graphData.nodes.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <Network className="mx-auto h-10 w-10 text-muted-foreground" />

        <h2 className="mt-4 text-xl font-semibold">
          No dependency network available
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          ArcHive needs portfolio technology relationships before it
          can build the network.
        </p>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-col justify-between gap-4 border-b border-border p-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-semibold">
              Dependency Relationship Network
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Explore technology co-occurrence and shared repository
              usage. Relationships do not confirm runtime dependency
              direction.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() =>
                graphReference.current?.zoom(
                  1.35,
                  300
                )
              }
            >
              <ZoomIn className="h-4 w-4" />
              <span className="sr-only">Zoom in</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() =>
                graphReference.current?.zoom(
                  0.75,
                  300
                )
              }
            >
              <ZoomOut className="h-4 w-4" />
              <span className="sr-only">Zoom out</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() =>
                graphReference.current?.zoomToFit(
                  600,
                  80
                )
              }
            >
              <Maximize2 className="h-4 w-4" />
              <span className="sr-only">Fit graph</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                graphReference.current?.d3ReheatSimulation();

                window.setTimeout(() => {
                  graphReference.current?.zoomToFit(
                    600,
                    80
                  );
                }, 350);
              }}
            >
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Reset graph</span>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  focusTechnology();
                }
              }}
              placeholder="Find a technology..."
              className="pl-9"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={focusTechnology}
            disabled={!search.trim()}
          >
            <Focus className="mr-2 h-4 w-4" />
            Focus
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-border p-4">
          <Badge
            variant="outline"
            className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
          >
            Low
          </Badge>

          <Badge
            variant="outline"
            className="border-amber-500/40 bg-amber-500/10 text-amber-600"
          >
            Medium
          </Badge>

          <Badge
            variant="outline"
            className="border-orange-500/40 bg-orange-500/10 text-orange-600"
          >
            High
          </Badge>

          <Badge
            variant="outline"
            className="border-destructive/40 bg-destructive/10 text-destructive"
          >
            Critical
          </Badge>
        </div>

        <div
          ref={containerReference}
          className="relative min-w-0 overflow-hidden bg-background"
          style={{ height }}
        >
          <ForceGraph2D
            ref={graphReference}
            width={containerWidth}
            height={height}
            graphData={graphData}
            nodeId="id"
            nodeCanvasObject={drawNode}
            nodeLabel={(value: unknown) => {
              const node =
                value as DependencyGraphNode;

              return `${node.technology} · ${node.repositoryCount} repositories`;
            }}
            onNodeClick={handleNodeClick}
            onNodeHover={(value: unknown) => {
              const node =
                value as DependencyGraphNode | null;

              setHoveredNodeId(node?.id ?? null);
            }}
            onLinkClick={handleRelationshipClick}
            linkWidth={(value: unknown) => {
              const relationship =
                value as DependencyGraphLink;

              return Math.max(
                0.5,
                percentage(relationship.strength) / 35
              );
            }}
            linkColor={() =>
              "rgba(100,116,139,0.25)"
            }
            linkLabel={(value: unknown) => {
              const relationship =
                value as DependencyGraphLink;

              return `${getNodeId(
                relationship.source
              )} and ${getNodeId(
                relationship.target
              )} · ${Math.round(
                percentage(relationship.strength)
              )}% strength`;
            }}
            cooldownTicks={150}
            warmupTicks={35}
            d3AlphaDecay={0.035}
            d3VelocityDecay={0.3}
            enableNodeDrag
            enablePanInteraction
            enableZoomInteraction
            minZoom={0.2}
            maxZoom={8}
            backgroundColor="rgba(255,255,255,0)"
          />
        </div>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        {selectedNode ? (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Selected Technology
                </p>

                <h2 className="mt-1 break-words text-lg font-semibold">
                  {selectedNode.technology}
                </h2>
              </div>

              <ImpactLevelBadge
                impactLevel={selectedNode.impactLevel}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric
                label="Repositories"
                value={selectedNode.repositoryCount}
              />

              <Metric
                label="Connections"
                value={
                  selectedNode.connectedTechnologyCount
                }
              />

              <Metric
                label="Centrality"
                value={`${Math.round(
                  percentage(
                    selectedNode.centralityScore
                  )
                )}%`}
              />

              <Metric
                label="Impact"
                value={`${Math.round(
                  percentage(selectedNode.impactScore)
                )}%`}
              />
            </div>

            <div className="mt-5 grid gap-2">
              <Button asChild variant="outline">
                <a
                  href={`/portfolio/dependencies/${encodeURIComponent(
                    selectedNode.technology
                  )}`}
                >
                  Dependency Detail
                </a>
              </Button>

              <Button asChild>
                <a
                  href={`/portfolio/impact/${encodeURIComponent(
                    selectedNode.technology
                  )}`}
                >
                  Impact Report
                </a>
              </Button>
            </div>
          </div>
        ) : selectedRelationship ? (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">
              Selected Relationship
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              {selectedRelationship.source} and{" "}
              {selectedRelationship.target}
            </h2>

            <div className="mt-5">
              <RelationshipStrength
                value={selectedRelationship.strength}
              />
            </div>

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {selectedRelationship.evidenceSummary ||
                "These technologies share repository usage across the portfolio."}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {selectedRelationship.sharedRepositoryNames.map(
                (repositoryName, index) => (
                  <Badge
                    key={`${repositoryName}-${index}`}
                    variant="outline"
                  >
                    {repositoryName}
                  </Badge>
                )
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-6">
            <Network className="h-6 w-6 text-primary" />

            <h2 className="mt-4 text-lg font-semibold">
              Explore the network
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Select a technology to inspect its portfolio reach,
              centrality, impact, and risk level. Select a line to
              inspect its shared repository evidence.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-bold">
        {typeof value === "number"
          ? value.toLocaleString()
          : value}
      </p>
    </div>
  );
}
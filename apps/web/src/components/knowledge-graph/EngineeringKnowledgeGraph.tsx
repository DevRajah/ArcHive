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
    ZoomIn,
    ZoomOut,
} from "lucide-react";

import { KnowledgeGraphDetailsPanel } from "@/components/knowledge-graph/KnowledgeGraphDetailsPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { formatIntelligenceLabel } from "@/lib/intelligence-labels";

import type {
    KnowledgeGraphEdge,
    KnowledgeGraphNode,
} from "@/types/knowledge-graph.types";

/*
 * The graph library depends on browser APIs, so it is loaded only in the
 * browser. This keeps Next.js server rendering from trying to access canvas.
 */
const ForceGraph2D = dynamic(
    () => import("react-force-graph-2d"),
    {
        ssr: false,
    }
) as ComponentType<Record<string, unknown>>;

interface EngineeringKnowledgeGraphProps {
    nodes: KnowledgeGraphNode[];
    edges: KnowledgeGraphEdge[];
    height?: number;
    emptyTitle?: string;
    emptyDescription?: string;
}

interface ForceGraphNode extends KnowledgeGraphNode {
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number;
    fy?: number;
}

type ForceGraphLink = Omit<
    KnowledgeGraphEdge,
    "source" | "target"
> & {
    source: string | ForceGraphNode;
    target: string | ForceGraphNode;
};

interface GraphData {
    nodes: ForceGraphNode[];
    links: ForceGraphLink[];
}

interface ForceGraphController {
    zoom: (zoomLevel?: number, duration?: number) => number;
    zoomToFit: (
        duration?: number,
        padding?: number,
        nodeFilter?: (node: ForceGraphNode) => boolean
    ) => void;
    centerAt: (
        x?: number,
        y?: number,
        duration?: number
    ) => void;
    d3ReheatSimulation: () => void;
    d3Force: (
        forceName: string,
        force?: unknown
    ) => unknown;
}

type NodeTypeConfiguration = {
    background: string;
    border: string;
    text: string;
    shortLabel: string;
    radius: number;
};

const DEFAULT_HEIGHT = 720;

const NODE_TYPE_ORDER = [
    "REPOSITORY",
    "TECHNOLOGY",
    "ARCHITECTURE_DOMAIN",
    "REPOSITORY_TYPE",
    "CAPABILITY",
];

function getNodeConfiguration(
    type: string
): NodeTypeConfiguration {
    switch (type) {
        case "REPOSITORY":
            return {
                background: "#171717",
                border: "#737373",
                text: "#ffffff",
                shortLabel: "Repository",
                radius: 9,
            };

        case "TECHNOLOGY":
            return {
                background: "#dbeafe",
                border: "#3b82f6",
                text: "#1d4ed8",
                shortLabel: "Technology",
                radius: 6,
            };

        case "ARCHITECTURE_DOMAIN":
            return {
                background: "#ede9fe",
                border: "#8b5cf6",
                text: "#6d28d9",
                shortLabel: "Architecture",
                radius: 7,
            };

        case "REPOSITORY_TYPE":
            return {
                background: "#ffedd5",
                border: "#f97316",
                text: "#c2410c",
                shortLabel: "Repository Type",
                radius: 7,
            };

        case "CAPABILITY":
            return {
                background: "#d1fae5",
                border: "#10b981",
                text: "#047857",
                shortLabel: "Capability",
                radius: 6,
            };

        default:
            return {
                background: "#f5f5f5",
                border: "#a3a3a3",
                text: "#525252",
                shortLabel: formatIntelligenceLabel(type),
                radius: 6,
            };
    }
}

function getNodeId(
    value: string | ForceGraphNode
) {
    return typeof value === "string"
        ? value
        : value.id;
}

function getEdgeType(edge: ForceGraphLink) {
    return (
        edge.type ||
        edge.label ||
        edge.relationship ||
        "RELATIONSHIP"
    );
}

function isSimilarityEdge(
    edge: ForceGraphLink
) {
    return (
        getEdgeType(edge).toUpperCase() ===
        "REPOSITORY_SIMILARITY"
    );
}

function getSimilarityPercentage(
    edge: ForceGraphLink
) {
    const score =
        edge.similarity?.similarityScore;

    if (
        typeof score !== "number" ||
        !Number.isFinite(score)
    ) {
        return null;
    }

    return Math.round(
        score <= 1 ? score * 100 : score
    );
}

function getRelationshipLabel(
    edge: ForceGraphLink
) {
    if (isSimilarityEdge(edge)) {
        const percentage =
            getSimilarityPercentage(edge);

        return percentage === null
            ? "Repository Similarity"
            : `${percentage}% similar`;
    }

    switch (getEdgeType(edge).toUpperCase()) {
        case "USES_TECHNOLOGY":
            return "Uses Technology";

        case "HAS_CAPABILITY":
            return "Has Capability";

        case "CLASSIFIED_AS":
            return "Classified As";

        case "HAS_ARCHITECTURE_DOMAIN":
            return "Has Architecture Domain";

        default:
            return formatIntelligenceLabel(
                getEdgeType(edge)
            );
    }
}

function truncateLabel(
    value: string,
    maxLength = 26
) {
    if (value.length <= maxLength) {
        return value;
    }

    return `${value.slice(0, maxLength - 1)}…`;
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

export function EngineeringKnowledgeGraph({
    nodes,
    edges,
    height = DEFAULT_HEIGHT,
    emptyTitle = "No knowledge graph available",
    emptyDescription = "ArcHive has not detected enough engineering relationships to build this graph yet.",
}: EngineeringKnowledgeGraphProps) {
    const graphReference =
        useRef<ForceGraphController | null>(null);

    const containerReference =
        useRef<HTMLDivElement | null>(null);

    const [containerWidth, setContainerWidth] =
        useState(900);

    const [selectedNode, setSelectedNode] =
        useState<KnowledgeGraphNode | null>(
            null
        );

    const [selectedEdge, setSelectedEdge] =
        useState<KnowledgeGraphEdge | null>(
            null
        );

    const [hoveredNodeId, setHoveredNodeId] =
        useState<string | null>(null);

    const [currentZoom, setCurrentZoom] =
        useState(1);

    const graphData = useMemo<GraphData>(() => {
        const graphNodes: ForceGraphNode[] =
            nodes.map((node) => ({
                ...node,
            }));

        const knownNodeIds = new Set(
            graphNodes.map((node) => node.id)
        );

        const graphLinks: ForceGraphLink[] =
            edges
                .filter(
                    (edge) =>
                        knownNodeIds.has(edge.source) &&
                        knownNodeIds.has(edge.target)
                )
                .map((edge, index) => ({
                    ...edge,
                    id:
                        edge.id ||
                        `${edge.source}-${edge.target}-${index}`,
                    source: edge.source,
                    target: edge.target,
                }));

        return {
            nodes: graphNodes,
            links: graphLinks,
        };
    }, [edges, nodes]);

    useEffect(() => {
        const container =
            containerReference.current;

        if (!container) {
            return;
        }

        const resizeObserver = new ResizeObserver(
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

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        if (graphData.nodes.length === 0) {
            return;
        }

        const timer = window.setTimeout(() => {
            graphReference.current?.zoomToFit(
                700,
                70
            );
        }, 800);

        return () => {
            window.clearTimeout(timer);
        };
    }, [
        graphData.nodes.length,
        graphData.links.length,
    ]);

    const handleNodeClick = useCallback(
        (nodeValue: unknown) => {
            const node =
                nodeValue as ForceGraphNode;

            setSelectedNode(node);
            setSelectedEdge(null);

            if (
                typeof node.x === "number" &&
                typeof node.y === "number"
            ) {
                graphReference.current?.centerAt(
                    node.x,
                    node.y,
                    500
                );

                graphReference.current?.zoom(
                    2.4,
                    500
                );

                setCurrentZoom(2.4);
            }
        },
        []
    );

    const handleLinkClick = useCallback(
        (linkValue: unknown) => {
            const edge = linkValue as ForceGraphLink;

            const normalizedEdge: KnowledgeGraphEdge = {
                ...edge,
                source: getNodeId(edge.source),
                target: getNodeId(edge.target),
            };

            setSelectedEdge(normalizedEdge);
            setSelectedNode(null);
        },
        []
    );

    const clearSelection = useCallback(() => {
        setSelectedNode(null);
        setSelectedEdge(null);
    }, []);

    const handleZoomIn = useCallback(() => {
        const nextZoom = Math.min(
            currentZoom * 1.35,
            8
        );

        graphReference.current?.zoom(
            nextZoom,
            300
        );

        setCurrentZoom(nextZoom);
    }, [currentZoom]);

    const handleZoomOut = useCallback(() => {
        const nextZoom = Math.max(
            currentZoom / 1.35,
            0.25
        );

        graphReference.current?.zoom(
            nextZoom,
            300
        );

        setCurrentZoom(nextZoom);
    }, [currentZoom]);

    const handleZoomToFit =
        useCallback(() => {
            graphReference.current?.zoomToFit(
                600,
                70
            );

            setCurrentZoom(1);
        }, []);

    const handleReset = useCallback(() => {
        clearSelection();

        graphReference.current?.d3ReheatSimulation();

        window.setTimeout(() => {
            graphReference.current?.zoomToFit(
                600,
                70
            );

            setCurrentZoom(1);
        }, 350);
    }, [clearSelection]);

    const drawNode = useCallback(
        (
            nodeValue: unknown,
            context: CanvasRenderingContext2D,
            globalScale: number
        ) => {
            const node =
                nodeValue as ForceGraphNode;

            if (
                typeof node.x !== "number" ||
                typeof node.y !== "number"
            ) {
                return;
            }

            const configuration =
                getNodeConfiguration(node.type);

            const selected =
                selectedNode?.id === node.id;

            const hovered =
                hoveredNodeId === node.id;

            const radius =
                configuration.radius *
                (selected ? 1.35 : hovered ? 1.18 : 1);

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
                configuration.background;

            context.fill();

            context.lineWidth = selected
                ? 2.8
                : hovered
                    ? 2
                    : 1.2;

            context.strokeStyle =
                selected
                    ? "#111827"
                    : configuration.border;

            context.stroke();

            const shouldShowLabel =
                node.type === "REPOSITORY" ||
                selected ||
                hovered ||
                globalScale >= 2.2;

            if (shouldShowLabel) {
                const label = truncateLabel(
                    node.label,
                    node.type === "REPOSITORY"
                        ? 34
                        : 24
                );

                const fontSize =
                    node.type === "REPOSITORY"
                        ? 12 / globalScale
                        : 10 / globalScale;

                context.font = `${node.type === "REPOSITORY"
                    ? "600"
                    : "500"
                    } ${fontSize}px sans-serif`;

                const textWidth =
                    context.measureText(label).width;

                const horizontalPadding =
                    6 / globalScale;

                const verticalPadding =
                    4 / globalScale;

                const labelWidth =
                    textWidth +
                    horizontalPadding * 2;

                const labelHeight =
                    fontSize +
                    verticalPadding * 2;

                const labelX =
                    node.x - labelWidth / 2;

                const labelY =
                    node.y +
                    radius +
                    5 / globalScale;

                drawRoundedRectangle(
                    context,
                    labelX,
                    labelY,
                    labelWidth,
                    labelHeight,
                    4 / globalScale
                );

                context.fillStyle =
                    "rgba(255, 255, 255, 0.94)";

                context.fill();

                context.lineWidth =
                    0.7 / globalScale;

                context.strokeStyle =
                    "rgba(163, 163, 163, 0.65)";

                context.stroke();

                context.textAlign = "center";
                context.textBaseline = "middle";
                context.fillStyle =
                    configuration.text;

                context.fillText(
                    label,
                    node.x,
                    labelY + labelHeight / 2
                );
            }

            context.restore();
        },
        [hoveredNodeId, selectedNode?.id]
    );

    const nodePointerArea = useCallback(
        (
            nodeValue: unknown,
            colour: string,
            context: CanvasRenderingContext2D
        ) => {
            const node =
                nodeValue as ForceGraphNode;

            if (
                typeof node.x !== "number" ||
                typeof node.y !== "number"
            ) {
                return;
            }

            const radius =
                getNodeConfiguration(node.type)
                    .radius * 1.6;

            context.fillStyle = colour;
            context.beginPath();
            context.arc(
                node.x,
                node.y,
                radius,
                0,
                Math.PI * 2
            );
            context.fill();
        },
        []
    );

    if (graphData.nodes.length === 0) {
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
                <div className="flex flex-col justify-between gap-4 border-b border-border p-4 lg:flex-row lg:items-center">
                    <div>
                        <h2 className="font-semibold">
                            Engineering Knowledge Graph
                        </h2>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Drag nodes, zoom, pan, and select
                            relationships to inspect engineering
                            connections.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleZoomOut}
                        >
                            <ZoomOut className="h-4 w-4" />
                            <span className="sr-only">
                                Zoom out
                            </span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleZoomIn}
                        >
                            <ZoomIn className="h-4 w-4" />
                            <span className="sr-only">
                                Zoom in
                            </span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleZoomToFit}
                        >
                            <Maximize2 className="h-4 w-4" />
                            <span className="sr-only">
                                Fit graph
                            </span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                                if (
                                    selectedNode &&
                                    typeof (
                                        selectedNode as ForceGraphNode
                                    ).x === "number" &&
                                    typeof (
                                        selectedNode as ForceGraphNode
                                    ).y === "number"
                                ) {
                                    const node =
                                        selectedNode as ForceGraphNode;

                                    graphReference.current?.centerAt(
                                        node.x,
                                        node.y,
                                        400
                                    );
                                }
                            }}
                            disabled={!selectedNode}
                        >
                            <Focus className="h-4 w-4" />
                            <span className="sr-only">
                                Focus selected node
                            </span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleReset}
                        >
                            <RotateCcw className="h-4 w-4" />
                            <span className="sr-only">
                                Reset graph
                            </span>
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 border-b border-border p-4">
                    {NODE_TYPE_ORDER.map((type) => (
                        <LegendBadge
                            key={type}
                            type={type}
                        />
                    ))}

                    <Badge
                        variant="outline"
                        className="border-primary/40 text-primary"
                    >
                        Dashed line: Similarity
                    </Badge>
                </div>

                <div
                    ref={containerReference}
                    className="relative min-w-0 overflow-hidden bg-background"
                    style={{
                        height,
                    }}
                >
                    <ForceGraph2D
                        ref={graphReference}
                        width={containerWidth}
                        height={height}
                        graphData={graphData}
                        nodeId="id"
                        nodeLabel={(nodeValue: unknown) => {
                            const node =
                                nodeValue as ForceGraphNode;

                            return `${node.label} · ${formatIntelligenceLabel(
                                node.type
                            )}`;
                        }}
                        nodeRelSize={7}
                        nodeCanvasObject={drawNode}
                        nodePointerAreaPaint={
                            nodePointerArea
                        }
                        onNodeClick={handleNodeClick}
                        onNodeHover={(nodeValue: unknown) => {
                            const node =
                                nodeValue as
                                | ForceGraphNode
                                | null;

                            setHoveredNodeId(
                                node?.id ?? null
                            );
                        }}
                        onLinkClick={handleLinkClick}
                        linkLabel={(linkValue: unknown) =>
                            getRelationshipLabel(
                                linkValue as ForceGraphLink
                            )
                        }
                        linkWidth={(linkValue: unknown) =>
                            isSimilarityEdge(
                                linkValue as ForceGraphLink
                            )
                                ? 2.4
                                : 0.85
                        }
                        linkColor={(linkValue: unknown) =>
                            isSimilarityEdge(
                                linkValue as ForceGraphLink
                            )
                                ? "rgba(37, 99, 235, 0.8)"
                                : "rgba(115, 115, 115, 0.28)"
                        }
                        linkLineDash={(
                            linkValue: unknown
                        ) =>
                            isSimilarityEdge(
                                linkValue as ForceGraphLink
                            )
                                ? [7, 4]
                                : null
                        }
                        linkDirectionalArrowLength={3.5}
                        linkDirectionalArrowRelPos={1}
                        linkDirectionalParticles={(
                            linkValue: unknown
                        ) =>
                            isSimilarityEdge(
                                linkValue as ForceGraphLink
                            )
                                ? 1
                                : 0
                        }
                        linkDirectionalParticleWidth={2}
                        linkDirectionalParticleSpeed={0.003}
                        cooldownTicks={140}
                        warmupTicks={30}
                        d3AlphaDecay={0.035}
                        d3VelocityDecay={0.3}
                        enableNodeDrag
                        enablePanInteraction
                        enableZoomInteraction
                        minZoom={0.25}
                        maxZoom={8}
                        backgroundColor="rgba(255,255,255,0)"
                        onZoom={(transformValue: unknown) => {
                            const transform =
                                transformValue as {
                                    k?: number;
                                };

                            if (
                                typeof transform.k ===
                                "number"
                            ) {
                                setCurrentZoom(transform.k);
                            }
                        }}
                    />
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
                            Drag nodes to reorganise the graph.
                            Select a node to inspect its type,
                            value, metadata, and repository links.
                            Select a relationship to inspect how
                            two engineering entities connect.
                        </p>

                        <div className="mt-5 space-y-3 rounded-xl border border-border bg-background p-4">
                            <GraphHint
                                title="Move"
                                description="Drag nodes or the canvas."
                            />

                            <GraphHint
                                title="Inspect"
                                description="Select a node or relationship."
                            />

                            <GraphHint
                                title="Navigate"
                                description="Scroll to zoom and drag to pan."
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function LegendBadge({
    type,
}: {
    type: string;
}) {
    const configuration =
        getNodeConfiguration(type);

    return (
        <Badge
            variant="outline"
            style={{
                backgroundColor:
                    configuration.background,
                borderColor: configuration.border,
                color: configuration.text,
            }}
        >
            {configuration.shortLabel}
        </Badge>
    );
}

function GraphHint({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div>
            <p className="text-sm font-medium">
                {title}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
                {description}
            </p>
        </div>
    );
}
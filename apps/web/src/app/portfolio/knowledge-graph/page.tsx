"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    useRouter,
} from "next/navigation";
import axios from "axios";
import {
    Network,
    RefreshCcw,
    SearchX,
    ShieldAlert,
    TriangleAlert,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { PortfolioNavigation } from "@/components/portfolio/PortfolioNavigation";

import { EngineeringKnowledgeGraph } from "@/components/knowledge-graph/EngineeringKnowledgeGraph";
import { KnowledgeGraphFilters } from "@/components/knowledge-graph/KnowledgeGraphFilters";
import { KnowledgeGraphSummary } from "@/components/knowledge-graph/KnowledgeGraphSummary";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { usePortfolioKnowledgeGraph } from "@/hooks/useKnowledgeGraph";

import { getUserId } from "@/lib/auth";

import type {
    KnowledgeGraphEdge,
    KnowledgeGraphFilterState,
    KnowledgeGraphNode,
} from "@/types/knowledge-graph.types";

const initialFilters: KnowledgeGraphFilterState = {
    repository: "",
    technology: "",
    architectureDomain: "",
    capability: "",
    repositoryType: "",
    similarityOnly: false,
};

function getHttpStatus(error: unknown) {
    if (!axios.isAxiosError(error)) {
        return null;
    }

    return error.response?.status ?? null;
}

function getNodeValue(node: KnowledgeGraphNode) {
    return node.value || node.label;
}

export default function PortfolioKnowledgeGraphPage() {
    const router = useRouter();
    const userId = getUserId();

    const [filters, setFilters] =
        useState<KnowledgeGraphFilterState>(
            initialFilters
        );

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = usePortfolioKnowledgeGraph(userId);

    const status = getHttpStatus(error);

    useEffect(() => {
        if (status === 401) {
            router.replace("/connect-github");
        }
    }, [router, status]);

    const filteredGraph = useMemo(() => {
        const nodes: KnowledgeGraphNode[] =
            data?.nodes ?? [];

        const edges: KnowledgeGraphEdge[] =
            data?.edges ?? [];

        if (nodes.length === 0) {
            return {
                nodes: [],
                edges: [],
            };
        }

        const directlyMatchedNodeIds =
            new Set<string>();

        nodes.forEach((node) => {
            const value = getNodeValue(node);

            const matchesRepository =
                !filters.repository ||
                (node.type === "REPOSITORY" &&
                    value === filters.repository);

            const matchesTechnology =
                !filters.technology ||
                (node.type === "TECHNOLOGY" &&
                    value === filters.technology);

            const matchesArchitectureDomain =
                !filters.architectureDomain ||
                (node.type ===
                    "ARCHITECTURE_DOMAIN" &&
                    value ===
                    filters.architectureDomain);

            const matchesCapability =
                !filters.capability ||
                (node.type === "CAPABILITY" &&
                    value === filters.capability);

            const matchesRepositoryType =
                !filters.repositoryType ||
                (node.type === "REPOSITORY_TYPE" &&
                    value === filters.repositoryType);

            if (
                matchesRepository &&
                matchesTechnology &&
                matchesArchitectureDomain &&
                matchesCapability &&
                matchesRepositoryType
            ) {
                directlyMatchedNodeIds.add(node.id);
            }
        });

        const hasEntityFilters =
            Boolean(filters.repository) ||
            Boolean(filters.technology) ||
            Boolean(filters.architectureDomain) ||
            Boolean(filters.capability) ||
            Boolean(filters.repositoryType);

        let candidateEdges = edges;

        if (filters.similarityOnly) {
            candidateEdges = candidateEdges.filter(
                (edge: KnowledgeGraphEdge) =>
                    edge.type ===
                    "REPOSITORY_SIMILARITY"
            );
        }

        if (!hasEntityFilters) {
            const visibleNodeIds = new Set<string>();

            candidateEdges.forEach((edge: KnowledgeGraphEdge) => {
                visibleNodeIds.add(edge.source);
                visibleNodeIds.add(edge.target);
            });

            const visibleNodes =
                filters.similarityOnly
                    ? nodes.filter((node: KnowledgeGraphNode) =>
                        visibleNodeIds.has(node.id)
                    )
                    : nodes;

            return {
                nodes: visibleNodes,
                edges: candidateEdges,
            };
        }

        const connectedNodeIds =
            new Set(directlyMatchedNodeIds);

        candidateEdges.forEach((edge) => {
            if (
                directlyMatchedNodeIds.has(edge.source) ||
                directlyMatchedNodeIds.has(edge.target)
            ) {
                connectedNodeIds.add(edge.source);
                connectedNodeIds.add(edge.target);
            }
        });

        const visibleNodes = nodes.filter(
            (node) =>
                connectedNodeIds.has(node.id)
        );

        const visibleNodeIdSet = new Set(
            visibleNodes.map((node) => node.id)
        );

        const visibleEdges = candidateEdges.filter(
            (edge) =>
                visibleNodeIdSet.has(edge.source) &&
                visibleNodeIdSet.has(edge.target)
        );

        return {
            nodes: visibleNodes,
            edges: visibleEdges,
        };
    }, [data, filters]);

    return (
        <AppShell>
            <PageContent>
                <PortfolioNavigation />

                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <Network className="h-5 w-5 text-primary" />
                            </div>

                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Engineering Portfolio Knowledge Graph
                                </h1>

                                <p className="mt-2 max-w-3xl text-muted-foreground">
                                    Visualize how your repositories
                                    connect through technologies,
                                    architecture, capabilities, and
                                    repository types.
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

                {isLoading && (
                    <PortfolioGraphSkeleton />
                )}

                {isError && status === 403 && (
                    <GraphErrorState
                        icon={ShieldAlert}
                        title="Portfolio access denied"
                        description="The current ArcHive account does not have permission to view this portfolio knowledge graph."
                    />
                )}

                {isError && status === 404 && (
                    <GraphErrorState
                        icon={SearchX}
                        title="Portfolio not found"
                        description="ArcHive could not find a portfolio knowledge graph for the current user."
                    />
                )}

                {isError &&
                    status !== 401 &&
                    status !== 403 &&
                    status !== 404 && (
                        <GraphErrorState
                            icon={TriangleAlert}
                            title="Failed to load portfolio knowledge graph"
                            description={
                                error instanceof Error
                                    ? error.message
                                    : "ArcHive could not load the engineering portfolio graph."
                            }
                            onRetry={() => refetch()}
                            isRetrying={isFetching}
                        />
                    )}

                {!isLoading &&
                    !isError &&
                    data && (
                        <>
                            <KnowledgeGraphSummary
                                summary={data.summary}
                                showRepositories
                                showSimilarity
                            />

                            <KnowledgeGraphFilters
                                nodes={data.nodes}
                                filters={filters}
                                onChange={setFilters}
                            />

                            {filteredGraph.nodes.length ===
                                0 ? (
                                <div className="rounded-xl border border-border bg-card p-10 text-center">
                                    <Network className="mx-auto h-10 w-10 text-muted-foreground" />

                                    <h2 className="mt-4 text-xl font-semibold">
                                        No graph results match these
                                        filters
                                    </h2>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Reset or change the graph
                                        filters to reveal more
                                        engineering relationships.
                                    </p>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-6"
                                        onClick={() =>
                                            setFilters(initialFilters)
                                        }
                                    >
                                        Reset filters
                                    </Button>
                                </div>
                            ) : (
                                <EngineeringKnowledgeGraph
                                    nodes={filteredGraph.nodes}
                                    edges={filteredGraph.edges}
                                    height={760}
                                    emptyTitle="No portfolio graph available"
                                    emptyDescription="ArcHive has not detected enough cross-repository engineering relationships to build this portfolio graph yet."
                                />
                            )}
                        </>
                    )}
            </PageContent>
        </AppShell>
    );
}

function PortfolioGraphSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 8 }).map(
                    (_, index) => (
                        <Skeleton
                            key={index}
                            className="h-36 rounded-xl"
                        />
                    )
                )}
            </div>

            <Skeleton className="h-48 rounded-xl" />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                <Skeleton className="h-[760px] rounded-xl" />
                <Skeleton className="h-96 rounded-xl" />
            </div>
        </div>
    );
}

function GraphErrorState({
    icon: Icon,
    title,
    description,
    onRetry,
    isRetrying = false,
}: {
    icon: typeof Network;
    title: string;
    description: string;
    onRetry?: () => void;
    isRetrying?: boolean;
}) {
    return (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                <Icon className="h-6 w-6 text-muted-foreground" />
            </div>

            <h2 className="mt-5 text-2xl font-semibold">
                {title}
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {description}
            </p>

            {onRetry && (
                <Button
                    type="button"
                    variant="outline"
                    className="mt-6"
                    onClick={onRetry}
                    disabled={isRetrying}
                >
                    <RefreshCcw
                        className={`mr-2 h-4 w-4 ${isRetrying
                                ? "animate-spin"
                                : ""
                            }`}
                    />

                    Retry
                </Button>
            )}
        </div>
    );
}
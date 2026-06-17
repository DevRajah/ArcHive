"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, GitBranch, Network } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepositoryKnowledgeGraph } from "@/hooks/useRepositories";
import { formatFilterLabel } from "@/lib/filters";
import { RepositoryIntelligenceNav } from "@/components/repositories/RepositoryIntelligenceNav";

export default function RepositoryKnowledgeGraphPage() {
    const params = useParams<{ repoId: string }>();
    const repoId = params.repoId;

    const { data, isLoading, isError, error } =
        useRepositoryKnowledgeGraph(repoId);

    return (
        <AppShell>
            <div className="space-y-6">
                <Button asChild variant="ghost" className="px-0">
                    <Link href={`/repositories/${repoId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to repository overview
                    </Link>
                </Button>

                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                            <Network className="h-5 w-5 text-primary" />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Repository Knowledge Graph
                            </h1>

                            <p className="mt-2 max-w-3xl text-muted-foreground">
                                Relationship map showing how technologies, architecture domains,
                                and repository types connect inside this system.
                            </p>
                        </div>
                    </div>
                </div>

                <RepositoryIntelligenceNav repositoryId={repoId} />

                {isLoading && <Skeleton className="h-80 rounded-xl" />}

                {isError && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
                        <p className="font-medium text-destructive">
                            Failed to load knowledge graph
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {error instanceof Error ? error.message : "Please check backend."}
                        </p>
                    </div>
                )}

                {!isLoading && !isError && data && (
                    <>
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="rounded-xl border border-border bg-card p-5">
                                <p className="text-sm font-medium">Technologies</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {data.nodes?.technologies?.length ? (
                                        data.nodes.technologies.map((item) => (
                                            <Badge key={item} variant="outline">
                                                {item}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No technology nodes.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-xl border border-border bg-card p-5">
                                <p className="text-sm font-medium">Domains</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {data.nodes?.domains?.length ? (
                                        data.nodes.domains.map((item) => (
                                            <Badge key={item} variant="secondary">
                                                {formatFilterLabel(item)}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No domain nodes.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-xl border border-border bg-card p-5">
                                <p className="text-sm font-medium">Repository Types</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {data.nodes?.repositoryTypes?.length ? (
                                        data.nodes.repositoryTypes.map((item) => (
                                            <Badge key={item}>{formatFilterLabel(item)}</Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No repository type nodes.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-6">
                            <h2 className="text-lg font-semibold">Relationship Edges</h2>

                            {data.graph.length === 0 ? (
                                <p className="mt-4 text-sm text-muted-foreground">
                                    No knowledge graph relationships detected yet.
                                </p>
                            ) : (
                                <div className="mt-6 space-y-4">
                                    {data.graph.map((edge, index) => (
                                        <div
                                            key={`${edge.source}-${edge.target}-${index}`}
                                            className="rounded-xl border border-border bg-background p-5"
                                        >
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Badge variant="outline">{edge.source}</Badge>

                                                <GitBranch className="h-4 w-4 text-muted-foreground" />

                                                <Badge>{edge.target}</Badge>
                                            </div>

                                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                                {edge.relationship}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </AppShell>
    );
}
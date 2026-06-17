"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Lightbulb, XCircle } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepositoryRecommendations } from "@/hooks/useRepositories";
import { RepositoryRecommendation } from "@/types/repository-recommendations.types";
import { formatFilterLabel } from "@/lib/filters";
import { RepositoryCrossLinks } from "@/components/repositories/RepositoryCrossLinks";
import { RepositoryIntelligenceNav } from "@/components/repositories/RepositoryIntelligenceNav";

function RecommendationCard({
    recommendation,
}: {
    recommendation: RepositoryRecommendation;
}) {
    return (
        <div className="rounded-xl border border-border bg-background p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                    <h3 className="font-semibold">{recommendation.title}</h3>

                    {recommendation.description && (
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {recommendation.description}
                        </p>
                    )}
                </div>

                <Badge variant="secondary">
                    {formatFilterLabel(recommendation.status)}
                </Badge>
            </div>

            {recommendation.evidence && (
                <div className="mt-4 rounded-lg border border-border bg-card p-3">
                    <p className="text-xs font-medium">Evidence</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {recommendation.evidence}
                    </p>
                </div>
            )}

            {recommendation.resolvedAt && (
                <p className="mt-3 text-xs text-muted-foreground">
                    Resolved: {new Date(recommendation.resolvedAt).toLocaleString()}
                </p>
            )}
        </div>
    );
}

function RecommendationGroup({
    title,
    icon,
    items,
}: {
    title: string;
    icon: React.ReactNode;
    items: RepositoryRecommendation[];
}) {
    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
                {icon}
                <h2 className="text-lg font-semibold">{title}</h2>
                <Badge variant="secondary">{items.length}</Badge>
            </div>

            {items.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                    No recommendations in this category.
                </p>
            ) : (
                <div className="mt-5 space-y-4">
                    {items.map((item, index) => (
                        <RecommendationCard
                            key={`${item.id || item.title}-${index}`}
                            recommendation={item}
                        />
                    ))}
                </div>
            )}
        </div>

    );
}

export default function RepositoryRecommendationsPage() {
    const params = useParams<{ repoId: string }>();
    const repoId = params.repoId;

    const { data, isLoading, isError, error } =
        useRepositoryRecommendations(repoId);

    const grouped = useMemo(() => {
        const all = data?.recommendations || [
            ...(data?.active || []),
            ...(data?.resolved || []),
            ...(data?.dismissed || []),
        ];

        return {
            active:
                data?.active ||
                all.filter((item) => item.status?.toUpperCase() === "ACTIVE"),
            resolved:
                data?.resolved ||
                all.filter((item) => item.status?.toUpperCase() === "RESOLVED"),
            dismissed:
                data?.dismissed ||
                all.filter((item) => item.status?.toUpperCase() === "DISMISSED"),
        };
    }, [data]);

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
                            <Lightbulb className="h-5 w-5 text-primary" />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Engineering Recommendations
                            </h1>

                            <p className="mt-2 max-w-3xl text-muted-foreground">
                                Lifecycle-aware engineering recommendations generated from
                                repository intelligence, architecture signals, risks, and
                                evidence.
                            </p>
                        </div>
                    </div>
                </div>

                <RepositoryIntelligenceNav repositoryId={repoId} />

                {isLoading && <Skeleton className="h-96 rounded-xl" />}

                {isError && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
                        <p className="font-medium text-destructive">
                            Failed to load recommendations
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {error instanceof Error ? error.message : "Please check backend."}
                        </p>
                    </div>
                )}

                {!isLoading && !isError && (
                    <div className="grid gap-6 xl:grid-cols-3">
                        <RecommendationGroup
                            title="Active"
                            icon={<Lightbulb className="h-5 w-5 text-primary" />}
                            items={grouped.active}
                        />

                        <RecommendationGroup
                            title="Resolved"
                            icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
                            items={grouped.resolved}
                        />

                        <RecommendationGroup
                            title="Dismissed"
                            icon={<XCircle className="h-5 w-5 text-primary" />}
                            items={grouped.dismissed}
                        />
                    </div>
                )}

                <RepositoryCrossLinks
                    title="Recommendation Context"
                    links={[
                        {
                            label: "Architecture Intelligence",
                            description: "Review the architecture signals behind recommendations.",
                            href: `/repositories/${repoId}/architecture`,
                        },
                        {
                            label: "Capability Intelligence",
                            description: "Inspect capability gaps and maturity signals.",
                            href: `/repositories/${repoId}/capabilities`,
                        },
                        {
                            label: "Intelligence Audit",
                            description: "Check confidence, warnings, and improvement areas.",
                            href: `/repositories/${repoId}/audit`,
                        },
                    ]}
                />
            </div>
        </AppShell>
    );
}
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    Brain,
    CheckCircle2,
    GitBranch,
    Network,
    ShieldCheck,
    Sparkles,
    TriangleAlert,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { RepositoryLiveStatus } from "@/components/repositories/RepositoryLiveStatus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepositoryIntelligenceReport } from "@/hooks/useRepositories";
import { useRepositoryLiveStatus } from "@/hooks/useRepositoryLiveStatus";
import { formatFilterLabel } from "@/lib/filters";


import {
    useRelatedRepositories,
    useRepositoryIntelligenceTimeline,
    useRepositoryMarkdownReport,
} from "@/hooks/useRepositories";

import { RepositoryIntelligenceTimeline } from "@/components/repositories/RepositoryIntelligenceTimeline";
import { RelatedEngineeringRepositories } from "@/components/repositories/RelatedEngineeringRepositories";
import { RepositoryMarkdownReport } from "@/components/repositories/RepositoryMarkdownReport";


function getDisplayValue(item: unknown) {
    if (typeof item === "string") return item;

    if (typeof item === "number") return String(item);

    if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;

        return (
            String(
                record.title ||
                record.label ||
                record.name ||
                record.description ||
                record.summary ||
                JSON.stringify(record)
            )
        );
    }

    return "Unknown signal";
}

function BadgeList({
    items,
    variant = "secondary",
}: {
    items?: string[];
    variant?: "default" | "secondary" | "outline";
}) {
    if (!items || items.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No signals detected yet.
            </p>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item, index) => {
                const value = getDisplayValue(item);

                return (
                    <Badge key={`${value}-${index}`} variant={variant}>
                        {formatFilterLabel(value)}
                    </Badge>
                );
            })}
        </div>
    );
}

function InsightList({
    items,
    empty,
    tone = "neutral",
}: {
    items?: string[];
    empty: string;
    tone?: "neutral" | "warning" | "success";
}) {
    if (!items || items.length === 0) {
        return <p className="text-sm text-muted-foreground">{empty}</p>;
    }

    return (
        <ul className="space-y-2 text-sm text-muted-foreground">
            {items.map((item, index) => {
                const value = getDisplayValue(item);

                return (
                    <li
                        key={`${value}-${index}`}
                        className={`rounded-lg border p-3 ${tone === "warning"
                                ? "border-yellow-500/30 bg-yellow-500/10"
                                : tone === "success"
                                    ? "border-emerald-500/30 bg-emerald-500/10"
                                    : "border-border bg-background"
                            }`}
                    >
                        {value}
                    </li>
                );
            })}
        </ul>
    );
}

export default function RepositoryIntelligencePage() {
    const params = useParams<{ repoId: string }>();
    const repoId = params.repoId;

    const liveStatus = useRepositoryLiveStatus(repoId);

    const {
        data,
        isLoading,
        isError,
        error,
    } = useRepositoryIntelligenceReport(repoId);

    const {
        data: intelligenceTimeline,
        isLoading: isIntelligenceTimelineLoading,
    } = useRepositoryIntelligenceTimeline(repoId);

    const {
        data: relatedRepositories,
        isLoading: isRelatedRepositoriesLoading,
    } = useRelatedRepositories(repoId);

    const {
        data: markdownReport,
        isLoading: isMarkdownReportLoading,
    } = useRepositoryMarkdownReport(repoId);

    const repositoryName = data?.repository?.fullName || "repository";

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
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Repository Intelligence Report
                                </h1>

                                {data?.repository?.fullName && (
                                    <Badge variant="secondary">{data.repository.fullName}</Badge>
                                )}
                            </div>

                            <p className="mt-2 max-w-3xl text-muted-foreground">
                                AI Staff Engineer style analysis of repository purpose,
                                semantic identity, architecture reasoning, evidence, risks,
                                and engineering trajectory.
                            </p>

                            <div className="mt-4">
                                <RepositoryLiveStatus
                                    isConnected={liveStatus.isConnected}
                                    lastUpdatedAt={liveStatus.lastUpdatedAt}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="space-y-6">
                        <Skeleton className="h-56 rounded-xl" />
                        <Skeleton className="h-72 rounded-xl" />
                        <Skeleton className="h-72 rounded-xl" />
                    </div>
                )}

                {isError && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
                        <p className="font-medium text-destructive">
                            Failed to load intelligence report
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                            {error instanceof Error
                                ? error.message
                                : "Please check backend connection."}
                        </p>
                    </div>
                )}

                <RepositoryIntelligenceTimeline
                    data={intelligenceTimeline}
                    isLoading={isIntelligenceTimelineLoading}
                />

                <RelatedEngineeringRepositories
                    data={relatedRepositories}
                    isLoading={isRelatedRepositoriesLoading}
                />

                <RepositoryMarkdownReport
                    data={markdownReport}
                    isLoading={isMarkdownReportLoading}
                    repositoryName={repositoryName}
                />

                {!isLoading && !isError && data && (
                    <>
                        <div className="rounded-xl border border-border bg-card p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="text-lg font-semibold">
                                            Executive Intelligence Summary
                                        </h2>

                                        {data.confidence?.confidenceLevel && (
                                            <Badge variant="secondary">
                                                {data.confidence.confidenceLevel} Confidence
                                                {typeof data.confidence.confidenceScore === "number"
                                                    ? ` · ${data.confidence.confidenceScore}%`
                                                    : ""}
                                            </Badge>
                                        )}
                                    </div>

                                    <h3 className="mt-4 text-2xl font-bold">
                                        {data.report?.headline ||
                                            "Repository intelligence report unavailable"}
                                    </h3>

                                    {data.report?.summary && (
                                        <p className="mt-4 max-w-4xl text-sm leading-7 text-muted-foreground">
                                            {data.report.summary}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                            <div className="rounded-xl border border-border bg-card p-6">
                                <div className="flex items-center gap-3">
                                    <Brain className="h-5 w-5 text-primary" />
                                    <h2 className="text-lg font-semibold">Semantic Profile</h2>
                                </div>

                                <h3 className="mt-4 text-xl font-bold">
                                    {data.semanticProfile?.semanticLabel || "Unknown semantic identity"}
                                </h3>

                                {data.semanticProfile?.semanticDescription && (
                                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                        {data.semanticProfile.semanticDescription}
                                    </p>
                                )}



                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                    <div className="rounded-xl border border-border bg-background p-4">
                                        <p className="text-sm font-medium">Repository Types</p>
                                        <div className="mt-3">
                                            <BadgeList
                                                items={data.intelligence?.repositoryTypes}
                                                variant="secondary"
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-border bg-background p-4">
                                        <p className="text-sm font-medium">Architecture Styles</p>
                                        <div className="mt-3">
                                            <BadgeList
                                                items={data.intelligence?.architectureStyles}
                                                variant="outline"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-border bg-card p-6">
                                <div className="flex items-center gap-3">
                                    <GitBranch className="h-5 w-5 text-primary" />
                                    <h2 className="text-lg font-semibold">
                                        Evolution Direction
                                    </h2>
                                </div>

                                <h3 className="mt-4 text-xl font-bold">
                                    {data.evolutionDirection?.label || "Evolution direction unknown"}
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                    {data.evolutionDirection?.description ||
                                        "ArcHive has not detected a clear engineering trajectory yet."}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-6">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold">
                                    Staff Engineer Reasoning
                                </h2>
                            </div>

                            {data.engineeringReasoning?.maturitySignal && (
                                <div className="mt-5 rounded-xl border border-border bg-background p-4">
                                    <p className="text-sm font-medium">Maturity Signal</p>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {data.engineeringReasoning.maturitySignal}
                                    </p>
                                </div>
                            )}

                            <div className="mt-6 grid gap-6 md:grid-cols-2">
                                <div>
                                    <p className="mb-3 text-sm font-medium">Strengths</p>
                                    <InsightList
                                        items={data.engineeringReasoning?.strengths}
                                        empty="No strengths detected yet."
                                        tone="success"
                                    />
                                </div>

                                <div>
                                    <p className="mb-3 text-sm font-medium">Observations</p>
                                    <InsightList
                                        items={data.engineeringReasoning?.observations}
                                        empty="No observations detected yet."
                                    />
                                </div>

                                <div>
                                    <p className="mb-3 text-sm font-medium">Risks</p>
                                    <InsightList
                                        items={data.engineeringReasoning?.risks}
                                        empty="No risks detected yet."
                                        tone="warning"
                                    />
                                </div>

                                <div>
                                    <p className="mb-3 text-sm font-medium">Recommendations</p>
                                    <InsightList
                                        items={data.engineeringReasoning?.recommendations}
                                        empty="No recommendations detected yet."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-3">
                            <div className="rounded-xl border border-border bg-card p-6">
                                <div className="flex items-center gap-3">
                                    <Network className="h-5 w-5 text-primary" />
                                    <h2 className="text-lg font-semibold">Domains</h2>
                                </div>

                                <div className="mt-4">
                                    <BadgeList items={data.intelligence?.domains} />
                                </div>
                            </div>

                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="text-lg font-semibold">Technologies</h2>

                                <div className="mt-4">
                                    <BadgeList
                                        items={data.intelligence?.technologies}
                                        variant="outline"
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="text-lg font-semibold">Reasoning Signals</h2>

                                <div className="mt-4">
                                    <InsightList
                                        items={data.intelligence?.reasoningSignals}
                                        empty="No reasoning signals detected yet."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-6">
                            <div className="flex items-center gap-3">
                                <TriangleAlert className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold">
                                    Intelligence Quality Audit
                                </h2>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <Badge variant="secondary">
                                    {data.audit?.auditStatus
                                        ? formatFilterLabel(data.audit.auditStatus)
                                        : "Audit Status Unknown"}
                                </Badge>
                            </div>

                            <div className="mt-6 grid gap-6 md:grid-cols-3">
                                <div>
                                    <p className="mb-3 text-sm font-medium">Audit Strengths</p>
                                    <InsightList
                                        items={data.audit?.strengths}
                                        empty="No audit strengths detected yet."
                                        tone="success"
                                    />
                                </div>

                                <div>
                                    <p className="mb-3 text-sm font-medium">Warnings</p>
                                    <InsightList
                                        items={data.audit?.warnings}
                                        empty="No warnings detected yet."
                                        tone="warning"
                                    />
                                </div>

                                <div>
                                    <p className="mb-3 text-sm font-medium">Improvement Areas</p>
                                    <InsightList
                                        items={data.audit?.improvementAreas}
                                        empty="No improvement areas detected yet."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-6">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold">
                                    Narrative Signals
                                </h2>
                            </div>

                            <div className="mt-6 grid gap-6 md:grid-cols-3">
                                <div>
                                    <p className="mb-3 text-sm font-medium">Strengths</p>
                                    <BadgeList items={data.narrative?.strengths} />
                                </div>

                                <div>
                                    <p className="mb-3 text-sm font-medium">Dominant Patterns</p>
                                    <BadgeList items={data.narrative?.dominantPatterns} />
                                </div>

                                <div>
                                    <p className="mb-3 text-sm font-medium">Specializations</p>
                                    <BadgeList items={data.narrative?.detectedSpecializations} />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppShell>
    );
}
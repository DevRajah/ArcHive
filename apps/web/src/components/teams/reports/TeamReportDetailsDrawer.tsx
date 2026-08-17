"use client";

import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Boxes,
    CalendarDays,
    CheckCircle2,
    Code2,
    FileBarChart2,
    GitBranch,
    Lightbulb,
    ShieldAlert,
    Sparkles,
    TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

import { TeamReportStatusBadge } from "@/components/teams/reports/TeamReportStatusBadge";

import type {
    TeamExecutiveReport,
    TeamReportRepositoryHighlight,
    TeamReportTrendDirection,
} from "@/types/team.types";

import type {
    TechnologyInsight,
} from "@/types/report.types";

interface TeamReportDetailsDrawerProps {
    report: TeamExecutiveReport | null;
    open: boolean;
    isLoading: boolean;
    onOpenChange: (open: boolean) => void;
}

interface KpiCardProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
    helper?: string;
}

interface RepositoryHighlightCardProps {
    repository: TeamReportRepositoryHighlight;
    variant: "strong" | "attention";
}

function formatDate(
    value: string | null | undefined,
) {
    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function formatNumber(
    value: number | null | undefined,
) {
    if (
        typeof value !== "number" ||
        !Number.isFinite(value)
    ) {
        return "0";
    }

    return new Intl.NumberFormat("en-GB").format(value);
}

function formatScore(
    value: number | null | undefined,
) {
    if (
        typeof value !== "number" ||
        !Number.isFinite(value)
    ) {
        return "N/A";
    }

    return Number.isInteger(value)
        ? String(value)
        : value.toFixed(1);
}

function normaliseProgressValue(
    value: number | null | undefined,
) {
    if (
        typeof value !== "number" ||
        !Number.isFinite(value)
    ) {
        return 0;
    }

    return Math.min(
        Math.max(value, 0),
        100,
    );
}

function getTrendDetails(
    direction: TeamReportTrendDirection,
) {
    switch (direction) {
        case "IMPROVING":
            return {
                label: "Improving",
                icon: ArrowUpRight,
                className:
                    "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            };

        case "DECLINING":
            return {
                label: "Declining",
                icon: ArrowDownRight,
                className:
                    "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
            };

        case "STABLE":
            return {
                label: "Stable",
                icon: ArrowRight,
                className:
                    "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
            };

        default:
            return {
                label: "Unknown",
                icon: Activity,
                className:
                    "border-border bg-muted text-muted-foreground",
            };
    }
}

function KpiCard({
    label,
    value,
    icon: Icon,
    helper,
}: KpiCardProps) {
    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            {label}
                        </p>

                        <p className="mt-2 text-2xl font-bold tracking-tight">
                            {value}
                        </p>

                        {helper ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                                {helper}
                            </p>
                        ) : null}
                    </div>

                    <div className="rounded-xl border bg-muted/40 p-2.5">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function RepositoryHighlightCard({
    repository,
    variant,
}: RepositoryHighlightCardProps) {
    const isStrong = variant === "strong";

    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            {isStrong ? (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                            )}

                            <h4 className="truncate font-semibold">
                                {repository.name}
                            </h4>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {isStrong
                                ? "One of the strongest engineering performers in this Team Workspace."
                                : "This repository currently requires additional engineering attention."}
                        </p>
                    </div>

                    <Badge variant="outline">
                        {formatScore(repository.score)}
                    </Badge>
                </div>

                {repository.riskLevel ? (
                    <div className="mt-4">
                        <Badge variant="secondary">
                            {repository.riskLevel} risk
                        </Badge>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}

function TeamReportDrawerSkeleton() {
    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map(
                    (_, index) => (
                        <Skeleton
                            key={index}
                            className="h-28 rounded-xl"
                        />
                    ),
                )}
            </div>

            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
        </div>
    );
}

export function TeamReportDetailsDrawer({
    report,
    open,
    isLoading,
    onOpenChange,
}: TeamReportDetailsDrawerProps) {
    const snapshot = report?.reportData;

    /*
 * Keep the technology collection explicitly typed so clean production
 * builds do not rely on contextual inference across workspace packages.
 */
    const topTechnologies: TechnologyInsight[] =
        snapshot?.technologyAnalysis.topTechnologies ?? [];

    const strongestRepositories: TeamReportRepositoryHighlight[] =
        snapshot?.repositoryHighlights.strongest ?? [];

    const repositoriesRequiringAttention: TeamReportRepositoryHighlight[] =
        snapshot?.repositoryHighlights.needsAttention ?? [];

    const maximumTechnologyUsage = Math.max(
        ...topTechnologies.map(
            (technology) => technology.usageCount,
        ),
        1,
    );

    return (
        <Sheet
            open={open}
            onOpenChange={onOpenChange}
        >
            <SheetContent className="w-full p-0 sm:max-w-2xl lg:max-w-4xl">
                {/*
   * Radix requires every SheetContent to always contain a
   * SheetTitle and SheetDescription, including while loading.
   *
   * This hidden header remains mounted for screen readers during
   * the loading, error, and completed report states.
   */}
                <SheetHeader className="sr-only">
                    <SheetTitle>
                        {report?.title ??
                            "Team Executive Report"}
                    </SheetTitle>

                    <SheetDescription>
                        View the selected Team Executive Report and its stored
                        engineering analytics.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-screen">
                    <div className="px-6 py-6 sm:px-8">
                        {isLoading ? (
                            <TeamReportDrawerSkeleton />
                        ) : !report ? (
                            <div className="py-16 text-center">
                                <AlertTriangle className="mx-auto h-10 w-10 text-muted-foreground" />

                                <h2 className="mt-4 text-lg font-semibold">
                                    Unable to load report
                                </h2>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    ArcHive could not retrieve the selected Team Report.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/*
           * This is the visible report header.
           *
           * We use regular elements here because the accessible
           * SheetTitle and SheetDescription already exist above.
           */}
                                <header className="text-left">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <TeamReportStatusBadge
                                            status={report.status}
                                        />

                                        <Badge variant="outline">
                                            Team Executive Report
                                        </Badge>

                                        {snapshot ? (
                                            <Badge variant="secondary">
                                                Schema v
                                                {snapshot.schemaVersion}
                                            </Badge>
                                        ) : null}
                                    </div>

                                    <h2 className="pt-2 text-2xl font-semibold tracking-tight">
                                        {report.title}
                                    </h2>

                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                        {report.description ||
                                            "Leadership-ready engineering intelligence for this Team Workspace."}
                                    </p>
                                </header>

                                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4" />

                                        {formatDate(
                                            report.generatedAt ||
                                            report.createdAt,
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <FileBarChart2 className="h-4 w-4" />

                                        Report ID:{" "}
                                        {report.id.slice(0, 8)}
                                    </div>
                                </div>

                                <Separator className="my-7" />

                                {report.status === "FAILED" ? (
                                    <Card className="border-destructive/30 bg-destructive/5">
                                        <CardContent className="px-6 py-12 text-center">
                                            <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />

                                            <h3 className="mt-4 text-lg font-semibold">
                                                Report generation failed
                                            </h3>

                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {report.error ||
                                                    "ArcHive could not complete this Team Report."}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : !snapshot ? (
                                    <Card className="border-blue-500/20 bg-blue-500/5">
                                        <CardContent className="px-6 py-12 text-center">
                                            <FileBarChart2 className="mx-auto h-10 w-10 animate-pulse text-blue-500" />

                                            <h3 className="mt-4 text-lg font-semibold">
                                                Report analytics are being prepared
                                            </h3>

                                            <p className="mt-2 text-sm text-muted-foreground">
                                                The Team Report is still being generated.
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-10 pb-10">
                                        <section>
                                            <div className="mb-4 flex items-center gap-2">
                                                <Sparkles className="h-5 w-5 text-muted-foreground" />

                                                <h2 className="text-xl font-semibold">
                                                    Executive Summary
                                                </h2>
                                            </div>

                                            <Card>
                                                <CardContent className="space-y-6 p-6">
                                                    <p className="text-lg font-semibold leading-7">
                                                        {snapshot.executiveSummary.headline}
                                                    </p>

                                                    <p className="leading-7 text-muted-foreground">
                                                        {snapshot.executiveSummary.overallHealth}
                                                    </p>

                                                    {snapshot.executiveSummary.strengths.length >
                                                        0 ? (
                                                        <div>
                                                            <h3 className="mb-3 font-semibold">
                                                                Strengths
                                                            </h3>

                                                            <ul className="space-y-2">
                                                                {snapshot.executiveSummary.strengths.map(
                                                                    (strength: string, index: number) => (
                                                                        <li
                                                                            key={`strength-${index}`}
                                                                            className="flex gap-3 text-sm leading-6 text-muted-foreground"
                                                                        >
                                                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                                                            {strength}
                                                                        </li>
                                                                    ),
                                                                )}
                                                            </ul>
                                                        </div>
                                                    ) : null}

                                                    {snapshot.executiveSummary.concerns.length >
                                                        0 ? (
                                                        <div>
                                                            <h3 className="mb-3 font-semibold">
                                                                Concerns
                                                            </h3>

                                                            <ul className="space-y-2">
                                                                {snapshot.executiveSummary.concerns.map(
                                                                    (concern: string, index: number) => (
                                                                        <li
                                                                            key={`concern-${index}`}
                                                                            className="flex gap-3 text-sm leading-6 text-muted-foreground"
                                                                        >
                                                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                                                                            {concern}
                                                                        </li>
                                                                    ),
                                                                )}
                                                            </ul>
                                                        </div>
                                                    ) : null}

                                                    {snapshot.executiveSummary.recommendations
                                                        .length > 0 ? (
                                                        <div>
                                                            <h3 className="mb-3 font-semibold">
                                                                Recommendations
                                                            </h3>

                                                            <ul className="space-y-2">
                                                                {snapshot.executiveSummary.recommendations.map(
                                                                    (recommendation: string, index: number) => (
                                                                        <li
                                                                            key={`recommendation-${index}`}
                                                                            className="flex gap-3 text-sm leading-6 text-muted-foreground"
                                                                        >
                                                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                                                            {recommendation}
                                                                        </li>
                                                                    ),
                                                                )}
                                                            </ul>
                                                        </div>
                                                    ) : null}
                                                </CardContent>
                                            </Card>
                                        </section>

                                        <section>
                                            <div className="mb-4 flex items-center gap-2">
                                                <TrendingUp className="h-5 w-5 text-muted-foreground" />

                                                <h2 className="text-xl font-semibold">
                                                    Executive KPIs
                                                </h2>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                                <KpiCard
                                                    label="Repositories"
                                                    value={formatNumber(
                                                        snapshot.executiveKpis.repositories,
                                                    )}
                                                    icon={GitBranch}
                                                />

                                                <KpiCard
                                                    label="Average Architecture Score"
                                                    value={formatScore(
                                                        snapshot.executiveKpis
                                                            .averageArchitectureScore,
                                                    )}
                                                    icon={Boxes}
                                                />

                                                <KpiCard
                                                    label="Engineering Events"
                                                    value={formatNumber(
                                                        snapshot.executiveKpis.engineeringEvents,
                                                    )}
                                                    icon={Activity}
                                                />

                                                <KpiCard
                                                    label="Recommendations"
                                                    value={formatNumber(
                                                        snapshot.executiveKpis.recommendations,
                                                    )}
                                                    icon={Lightbulb}
                                                />

                                                <KpiCard
                                                    label="Technologies"
                                                    value={formatNumber(
                                                        snapshot.executiveKpis.technologies,
                                                    )}
                                                    icon={Code2}
                                                />

                                                <KpiCard
                                                    label="High Risk Repositories"
                                                    value={formatNumber(
                                                        snapshot.executiveKpis
                                                            .highRiskRepositories,
                                                    )}
                                                    icon={ShieldAlert}
                                                />
                                            </div>
                                        </section>

                                        <section>
                                            <div className="mb-4 flex items-center gap-2">
                                                <ShieldAlert className="h-5 w-5 text-muted-foreground" />

                                                <h2 className="text-xl font-semibold">
                                                    Risk Breakdown
                                                </h2>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                {[
                                                    ["Critical", snapshot.riskBreakdown.critical],
                                                    ["High", snapshot.riskBreakdown.high],
                                                    ["Medium", snapshot.riskBreakdown.medium],
                                                    ["Low", snapshot.riskBreakdown.low],
                                                    ["Unknown", snapshot.riskBreakdown.unknown],
                                                    ["Total", snapshot.riskBreakdown.total],
                                                ].map(([label, value]) => (
                                                    <Card key={String(label)}>
                                                        <CardContent className="p-5">
                                                            <p className="text-sm text-muted-foreground">
                                                                {label}
                                                            </p>

                                                            <p className="mt-2 text-2xl font-bold">
                                                                {formatNumber(
                                                                    value as number,
                                                                )}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </section>

                                        <section>
                                            <div className="mb-4 flex items-center gap-2">
                                                <Code2 className="h-5 w-5 text-muted-foreground" />

                                                <h2 className="text-xl font-semibold">
                                                    Technology Analysis
                                                </h2>
                                            </div>

                                            <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="text-base">
                                                            Technology Overview
                                                        </CardTitle>
                                                    </CardHeader>

                                                    <CardContent className="space-y-5">
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Dominant technology
                                                            </p>

                                                            <p className="mt-1 text-xl font-semibold">
                                                                {snapshot.technologyAnalysis
                                                                    .dominantTechnology ||
                                                                    "Not available"}
                                                            </p>
                                                        </div>

                                                        <Separator />

                                                        <div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Total technologies
                                                            </p>

                                                            <p className="mt-1 text-3xl font-bold">
                                                                {formatNumber(
                                                                    snapshot.technologyAnalysis
                                                                        .totalTechnologies,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="text-base">
                                                            Top Technologies
                                                        </CardTitle>
                                                    </CardHeader>

                                                    <CardContent className="space-y-5">
                                                        {topTechnologies.length > 0 ? (
                                                            topTechnologies.map(
                                                                (technology) => {
                                                                    const progress =
                                                                        (technology.usageCount /
                                                                            maximumTechnologyUsage) *
                                                                        100;

                                                                    return (
                                                                        <div
                                                                            key={technology.name}
                                                                            className="space-y-2"
                                                                        >
                                                                            <div className="flex items-center justify-between gap-4">
                                                                                <span className="font-medium">
                                                                                    {technology.name}
                                                                                </span>

                                                                                <span className="text-sm text-muted-foreground">
                                                                                    {formatNumber(
                                                                                        technology.usageCount,
                                                                                    )}
                                                                                </span>
                                                                            </div>

                                                                            <Progress
                                                                                value={normaliseProgressValue(
                                                                                    progress,
                                                                                )}
                                                                            />
                                                                        </div>
                                                                    );
                                                                },
                                                            )
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">
                                                                No technology data was stored.
                                                            </p>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </section>

                                        <section>
                                            <div className="mb-4 flex items-center gap-2">
                                                <TrendingUp className="h-5 w-5 text-muted-foreground" />

                                                <h2 className="text-xl font-semibold">
                                                    Engineering Trend
                                                </h2>
                                            </div>

                                            {(() => {
                                                const trend = getTrendDetails(
                                                    snapshot.trendAnalysis.direction,
                                                );

                                                const TrendIcon = trend.icon;

                                                return (
                                                    <Card>
                                                        <CardContent className="p-6">
                                                            <div className="grid gap-6 sm:grid-cols-4">
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Direction
                                                                    </p>

                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`mt-2 ${trend.className}`}
                                                                    >
                                                                        <TrendIcon className="mr-1 h-3.5 w-3.5" />
                                                                        {trend.label}
                                                                    </Badge>
                                                                </div>

                                                                <KpiCard
                                                                    label="Latest"
                                                                    value={formatScore(
                                                                        snapshot.trendAnalysis.latestValue,
                                                                    )}
                                                                    icon={Activity}
                                                                />

                                                                <KpiCard
                                                                    label="Previous"
                                                                    value={formatScore(
                                                                        snapshot.trendAnalysis.previousValue,
                                                                    )}
                                                                    icon={Activity}
                                                                />

                                                                <KpiCard
                                                                    label="Percentage Change"
                                                                    value={
                                                                        snapshot.trendAnalysis
                                                                            .percentageChange === null
                                                                            ? "N/A"
                                                                            : `${snapshot.trendAnalysis.percentageChange > 0 ? "+" : ""}${formatScore(snapshot.trendAnalysis.percentageChange)}%`
                                                                    }
                                                                    icon={TrendingUp}
                                                                />
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })()}
                                        </section>

                                        <section>
                                            <div className="mb-4 flex items-center gap-2">
                                                <GitBranch className="h-5 w-5 text-muted-foreground" />

                                                <h2 className="text-xl font-semibold">
                                                    Repository Highlights
                                                </h2>
                                            </div>

                                            <div className="grid gap-6 xl:grid-cols-2">
                                                <div>
                                                    <h3 className="mb-3 font-semibold">
                                                        Strongest Repositories
                                                    </h3>

                                                    <div className="space-y-3">
                                                        {strongestRepositories.length > 0 ? (
                                                            strongestRepositories.map(
                                                                (repository, index) => (
                                                                    <RepositoryHighlightCard
                                                                        key={
                                                                            repository.repositoryId ??
                                                                            `${repository.name}-${index}`
                                                                        }
                                                                        repository={repository}
                                                                        variant="strong"
                                                                    />
                                                                ),
                                                            )
                                                        ) : (
                                                            <Card>
                                                                <CardContent className="p-5 text-sm text-muted-foreground">
                                                                    No strongest repositories were stored.
                                                                </CardContent>
                                                            </Card>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="mb-3 font-semibold">
                                                        Repositories Requiring Attention
                                                    </h3>

                                                    <div className="space-y-3">
                                                        {repositoriesRequiringAttention.length >
                                                            0 ? (
                                                            repositoriesRequiringAttention.map(
                                                                (repository, index) => (
                                                                    <RepositoryHighlightCard
                                                                        key={
                                                                            repository.repositoryId ??
                                                                            `${repository.name}-${index}`
                                                                        }
                                                                        repository={repository}
                                                                        variant="attention"
                                                                    />
                                                                ),
                                                            )
                                                        ) : (
                                                            <Card>
                                                                <CardContent className="p-5 text-sm text-muted-foreground">
                                                                    No repositories currently require attention.
                                                                </CardContent>
                                                            </Card>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
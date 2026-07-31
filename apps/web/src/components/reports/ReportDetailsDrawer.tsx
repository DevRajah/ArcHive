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

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

import { Separator } from "@/components/ui/separator";

import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";

import type {
    EngineeringTrendDirection,
    ExecutiveReport,
    ReportRepositoryHighlight,
} from "@/types/report.types";

interface ReportDetailsDrawerProps {
    report: ExecutiveReport | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function formatDate(value: string | null) {
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

    return new Intl.NumberFormat(
        "en-GB",
    ).format(value);
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

interface KpiCardProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
    helper?: string;
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

                        {helper && (
                            <p className="mt-1 text-xs text-muted-foreground">
                                {helper}
                            </p>
                        )}
                    </div>

                    <div className="rounded-xl border bg-muted/40 p-2.5">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface RiskCardProps {
    label: string;
    value: number;
    className: string;
}

function RiskCard({
    label,
    value,
    className,
}: RiskCardProps) {
    return (
        <div className="rounded-xl border p-4">
            <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">
                    {label}
                </span>

                <span
                    className={`h-2.5 w-2.5 rounded-full ${className}`}
                />
            </div>

            <p className="mt-3 text-2xl font-bold">
                {formatNumber(value)}
            </p>
        </div>
    );
}

function getTrendDetails(
    direction: EngineeringTrendDirection,
) {
    switch (direction) {
        case "UP":
            return {
                label: "Improving",
                icon: ArrowUpRight,
                className:
                    "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            };

        case "DOWN":
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

interface RepositoryHighlightCardProps {
    repository: ReportRepositoryHighlight;
    variant: "strong" | "attention";
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
                                {repository.repositoryName}
                            </h4>
                        </div>

                        {repository.summary && (
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {repository.summary}
                            </p>
                        )}
                    </div>

                    {repository.score !== undefined &&
                        repository.score !== null && (
                            <Badge variant="outline">
                                {formatScore(repository.score)}
                            </Badge>
                        )}
                </div>

                {repository.riskLevel && (
                    <div className="mt-4">
                        <Badge
                            variant="secondary"
                            className="capitalize"
                        >
                            {repository.riskLevel.toLowerCase()} risk
                        </Badge>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ReportNotReady({
    report,
}: {
    report: ExecutiveReport;
}) {
    if (report.status === "FAILED") {
        return (
            <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="flex flex-col items-center px-6 py-12 text-center">
                    <ShieldAlert className="h-10 w-10 text-destructive" />

                    <h3 className="mt-4 text-lg font-semibold">
                        Report generation failed
                    </h3>

                    <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                        {report.failureReason ||
                            "ArcHive could not complete this report. Generate a new report or try again later."}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="flex flex-col items-center px-6 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
                    <FileBarChart2 className="h-7 w-7 animate-pulse text-blue-500" />
                </div>

                <h3 className="mt-4 text-lg font-semibold">
                    Report analytics are being prepared
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    ArcHive is analysing the organisation&apos;s engineering
                    intelligence. This drawer will update when generation
                    completes.
                </p>
            </CardContent>
        </Card>
    );
}

export function ReportDetailsDrawer({
    report,
    open,
    onOpenChange,
}: ReportDetailsDrawerProps) {
    if (!report) {
        return null;
    }

    const snapshot = report.snapshot;

    const strongestRepositories =
        Array.isArray(
            snapshot?.repositoryHighlights
                ?.strongestRepositories,
        )
            ? snapshot.repositoryHighlights
                .strongestRepositories
            : [];

    const repositoriesRequiringAttention =
        Array.isArray(
            snapshot?.repositoryHighlights
                ?.repositoriesRequiringAttention,
        )
            ? snapshot.repositoryHighlights
                .repositoriesRequiringAttention
            : [];

    const generatedDate =
        report.generatedAt || report.createdAt;

    return (
        <Sheet
            open={open}
            onOpenChange={onOpenChange}
        >
            <SheetContent className="w-full p-0 sm:max-w-2xl lg:max-w-4xl">
                <ScrollArea className="h-screen">
                    <div className="px-6 py-6 sm:px-8">
                        <SheetHeader className="text-left">
                            <div className="flex flex-wrap items-center gap-2">
                                <ReportStatusBadge status={report.status} />

                                <Badge variant="outline">
                                    Executive Report
                                </Badge>
                            </div>

                            <SheetTitle className="pt-2 text-2xl">
                                {report.title}
                            </SheetTitle>

                            <SheetDescription className="max-w-2xl leading-6">
                                {report.description ||
                                    "Leadership-ready engineering intelligence generated by ArcHive."}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                {formatDate(generatedDate)}
                            </div>

                            <div className="flex items-center gap-2">
                                <FileBarChart2 className="h-4 w-4" />
                                Report ID: {report.id.slice(0, 8)}
                            </div>
                        </div>

                        <Separator className="my-7" />

                        {!snapshot ? (
                            <ReportNotReady report={report} />
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
                                        <CardContent className="space-y-4 p-6">
                                            {Array.isArray(
                                                snapshot.executiveSummary,
                                            ) &&
                                                snapshot.executiveSummary.length > 0 ? (
                                                snapshot.executiveSummary.map(
                                                    (paragraph, index) => (
                                                        <p
                                                            key={`${report.id}-summary-${index}`}
                                                            className="leading-7 text-muted-foreground"
                                                        >
                                                            {paragraph}
                                                        </p>
                                                    ),
                                                )
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    No executive summary was stored for this
                                                    report.
                                                </p>
                                            )}
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
                                                snapshot.kpis.repositories,
                                            )}
                                            icon={GitBranch}
                                        />

                                        <KpiCard
                                            label="Average Architecture Score"
                                            value={formatScore(
                                                snapshot.kpis
                                                    .averageArchitectureScore,
                                            )}
                                            helper="Across analysed repositories"
                                            icon={Boxes}
                                        />

                                        <KpiCard
                                            label="Engineering Events"
                                            value={formatNumber(
                                                snapshot.kpis.engineeringEvents,
                                            )}
                                            icon={Activity}
                                        />

                                        <KpiCard
                                            label="Recommendations"
                                            value={formatNumber(
                                                snapshot.kpis.recommendations,
                                            )}
                                            icon={Lightbulb}
                                        />

                                        <KpiCard
                                            label="Technologies"
                                            value={formatNumber(
                                                snapshot.kpis.technologies,
                                            )}
                                            icon={Code2}
                                        />

                                        <KpiCard
                                            label="High Risk Repositories"
                                            value={formatNumber(
                                                snapshot.kpis
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
                                        <RiskCard
                                            label="Critical"
                                            value={
                                                snapshot.riskBreakdown.critical
                                            }
                                            className="bg-red-600"
                                        />

                                        <RiskCard
                                            label="High"
                                            value={snapshot.riskBreakdown.high}
                                            className="bg-orange-500"
                                        />

                                        <RiskCard
                                            label="Medium"
                                            value={
                                                snapshot.riskBreakdown.medium
                                            }
                                            className="bg-amber-500"
                                        />

                                        <RiskCard
                                            label="Low"
                                            value={snapshot.riskBreakdown.low}
                                            className="bg-emerald-500"
                                        />

                                        <RiskCard
                                            label="Unknown"
                                            value={
                                                snapshot.riskBreakdown.unknown
                                            }
                                            className="bg-slate-400"
                                        />

                                        <RiskCard
                                            label="Total Risks"
                                            value={
                                                snapshot.riskBreakdown.totalRisks
                                            }
                                            className="bg-primary"
                                        />
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
                                                            ?.dominantTechnology ||
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
                                                                .totalTechnologies ?? 0,
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
                                                {Array.isArray(
                                                    snapshot.technologyAnalysis?.topTechnologies,
                                                ) &&
                                                    snapshot.technologyAnalysis.topTechnologies.length > 0 ? (
                                                    snapshot.technologyAnalysis.topTechnologies.map(
                                                        (technology) => {
                                                            const maximumCount = Math.max(
                                                                ...snapshot.technologyAnalysis.topTechnologies.map(
                                                                    (item) => item.count,
                                                                ),
                                                                1,
                                                            );

                                                            const progress =
                                                                (technology.count /
                                                                    maximumCount) *
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
                                                                                technology.count,
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
                                                        No technology analysis was stored.
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
                                            snapshot.engineeringTrend.direction,
                                        );

                                        const TrendIcon = trend.icon;

                                        return (
                                            <Card>
                                                <CardContent className="p-6">
                                                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
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

                                                        <div className="grid flex-1 gap-4 sm:grid-cols-3">
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Latest value
                                                                </p>

                                                                <p className="mt-1 text-2xl font-bold">
                                                                    {formatScore(
                                                                        snapshot.engineeringTrend
                                                                            .latestValue,
                                                                    )}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Previous value
                                                                </p>

                                                                <p className="mt-1 text-2xl font-bold">
                                                                    {formatScore(
                                                                        snapshot.engineeringTrend
                                                                            .previousValue,
                                                                    )}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Percentage change
                                                                </p>

                                                                <p className="mt-1 text-2xl font-bold">
                                                                    {snapshot.engineeringTrend
                                                                        .percentageChange > 0
                                                                        ? "+"
                                                                        : ""}
                                                                    {formatScore(
                                                                        snapshot.engineeringTrend
                                                                            .percentageChange,
                                                                    )}
                                                                    %
                                                                </p>
                                                            </div>
                                                        </div>
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
                                            <div className="mb-3 flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />

                                                <h3 className="font-semibold">
                                                    Strongest Repositories
                                                </h3>
                                            </div>

                                            <div className="space-y-3">
                                                {strongestRepositories.length > 0 ? (
                                                    strongestRepositories.map(
                                                        (repository) => (
                                                            <RepositoryHighlightCard
                                                                key={
                                                                    repository.repositoryId
                                                                }
                                                                repository={repository}
                                                                variant="strong"
                                                            />
                                                        ),
                                                    )
                                                ) : (
                                                    <Card>
                                                        <CardContent className="p-5 text-sm text-muted-foreground">
                                                            No strongest repositories were
                                                            stored.
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="mb-3 flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-amber-500" />

                                                <h3 className="font-semibold">
                                                    Repositories Requiring Attention
                                                </h3>
                                            </div>

                                            <div className="space-y-3">
                                                {repositoriesRequiringAttention.length > 0 ? (
                                                    repositoriesRequiringAttention.map(
                                                        (repository) => (
                                                            <RepositoryHighlightCard
                                                                key={
                                                                    repository.repositoryId
                                                                }
                                                                repository={repository}
                                                                variant="attention"
                                                            />
                                                        ),
                                                    )
                                                ) : (
                                                    <Card>
                                                        <CardContent className="p-5 text-sm text-muted-foreground">
                                                            No repositories currently require
                                                            attention.
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    Activity,
    BarChart3,
    GitBranch,
    History,
    Layers3,
    Lightbulb,
    RefreshCcw,
} from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { PortfolioNavigation } from "@/components/portfolio/PortfolioNavigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { usePortfolioTrends } from "@/hooks/usePortfolioTrends";
import { getUserId } from "@/lib/auth";
import { formatIntelligenceLabel } from "@/lib/intelligence-labels";
import type {
    PortfolioDistributionItem,
    PortfolioRepositoryActivity,
    PortfolioTrendPeriod,
} from "@/types/portfolio.types";

const periodOptions: Array<{
    value: PortfolioTrendPeriod;
    label: string;
}> = [
        { value: "7d", label: "7 days" },
        { value: "30d", label: "30 days" },
        { value: "90d", label: "90 days" },
        { value: "1y", label: "1 year" },
    ];

export default function PortfolioTrendsPage() {
    const userId = getUserId();

    const [period, setPeriod] =
        useState<PortfolioTrendPeriod>("30d");

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = usePortfolioTrends(userId, period);

    const repositoryRanking = useMemo(() => {
        return [...(data?.repositoryActivity ?? [])].sort(
            (first, second) =>
                second.totalActivity - first.totalActivity
        );
    }, [data?.repositoryActivity]);

    return (
        <AppShell>
            <PageContent>
                <PortfolioNavigation />

                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Engineering Trends
                            </h1>

                            <p className="mt-2 max-w-3xl text-muted-foreground">
                                Explore engineering activity, repository engagement,
                                architecture evolution, technologies, and recommendations
                                across your portfolio.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <select
                                value={period}
                                onChange={(event) =>
                                    setPeriod(
                                        event.target.value as PortfolioTrendPeriod
                                    )
                                }
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                {periodOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => refetch()}
                                disabled={isFetching}
                            >
                                <RefreshCcw
                                    className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""
                                        }`}
                                />

                                {isFetching ? "Refreshing..." : "Refresh Trends"}
                            </Button>
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Skeleton key={index} className="h-36 rounded-xl" />
                            ))}
                        </div>

                        <Skeleton className="h-96 rounded-xl" />

                        <div className="grid gap-6 xl:grid-cols-2">
                            <Skeleton className="h-96 rounded-xl" />
                            <Skeleton className="h-96 rounded-xl" />
                        </div>
                    </div>
                )}

                {isError && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
                        <p className="font-medium text-destructive">
                            Failed to load portfolio trends
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                            {error instanceof Error
                                ? error.message
                                : "Please check the backend connection."}
                        </p>

                        <Button
                            type="button"
                            variant="outline"
                            className="mt-5"
                            onClick={() => refetch()}
                        >
                            Retry
                        </Button>
                    </div>
                )}

                {!isLoading && !isError && data && (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
                            <TrendMetricCard
                                label="Portfolio Activity"
                                value={data.totals?.totalPortfolioActivity}
                                icon={Activity}
                            />

                            <TrendMetricCard
                                label="Engineering Events"
                                value={data.totals?.totalEngineeringEvents}
                                icon={GitBranch}
                            />

                            <TrendMetricCard
                                label="Timeline Entries"
                                value={data.totals?.totalTimelineEntries}
                                icon={History}
                            />

                            <TrendMetricCard
                                label="Architecture Changes"
                                value={data.totals?.totalArchitectureChanges}
                                icon={Layers3}
                            />

                            <TrendMetricCard
                                label="Recommendations"
                                value={data.totals?.totalRecommendations}
                                icon={Lightbulb}
                            />
                        </div>

                        <section className="rounded-xl border border-border bg-card p-6">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" />

                                <h2 className="text-lg font-semibold">
                                    Engineering Activity Trend
                                </h2>
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Activity between {data.dateRange.start} and{" "}
                                {data.dateRange.end}.
                            </p>

                            {data.trend.length === 0 ? (
                                <EmptyChartState />
                            ) : (
                                <div className="mt-6 h-96 min-w-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={data.trend}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                            />

                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 11 }}
                                            />

                                            <YAxis
                                                allowDecimals={false}
                                                tick={{ fontSize: 11 }}
                                            />

                                            <Tooltip />

                                            <Legend />

                                            <Line
                                                type="monotone"
                                                dataKey="totalActivity"
                                                name="Total Activity"
                                                stroke="currentColor"
                                                className="text-primary"
                                                strokeWidth={3}
                                                dot={false}
                                            />

                                            <Line
                                                type="monotone"
                                                dataKey="engineeringEvents"
                                                name="Engineering Events"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                dot={false}
                                            />

                                            <Line
                                                type="monotone"
                                                dataKey="architectureChanges"
                                                name="Architecture Changes"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                dot={false}
                                            />

                                            <Line
                                                type="monotone"
                                                dataKey="recommendations"
                                                name="Recommendations"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </section>

                        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                            <RepositoryRanking
                                repositories={repositoryRanking}
                            />

                            <div className="space-y-6">
                                <HighlightCard
                                    title="Most Active Repository"
                                    repository={
                                        data.highlights.mostActiveRepository
                                    }
                                />

                                <HighlightCard
                                    title="Least Active Repository"
                                    repository={
                                        data.highlights.leastActiveRepository
                                    }
                                />

                                <InactiveRepositories
                                    repositories={
                                        data.highlights.inactiveTrackedRepositories
                                    }
                                />
                            </div>
                        </section>

                        <section className="grid gap-6 xl:grid-cols-2">
                            <DistributionChart
                                title="Technology Distribution"
                                items={data.distributions.technologies}
                                humanize={false}
                            />

                            <DistributionChart
                                title="Architecture Domains"
                                items={data.distributions.architectureDomains}
                            />

                            <DistributionChart
                                title="Repository Types"
                                items={data.distributions.repositoryTypes}
                            />

                            <DistributionChart
                                title="Languages"
                                items={data.distributions.languages}
                                humanize={false}
                            />

                            <DistributionChart
                                title="Engineering Event Types"
                                items={data.distributions.engineeringEventTypes}
                            />

                            <DistributionChart
                                title="Recommendation Statuses"
                                items={data.distributions.recommendationStatuses}
                            />
                        </section>
                    </>
                )}
            </PageContent>
        </AppShell>
    );
}

function TrendMetricCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value?: number | null;
    icon: typeof Activity;
}) {
    const safeValue =
        typeof value === "number" && Number.isFinite(value)
            ? value
            : 0;

    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>

                    <p className="mt-3 text-3xl font-bold">
                        {safeValue.toLocaleString()}
                    </p>
                </div>

                <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
            </div>
        </div>
    );
}

function RepositoryRanking({
    repositories,
}: {
    repositories: PortfolioRepositoryActivity[];
}) {
    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">
                Repository Activity Ranking
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
                Repositories ranked by total activity during the selected period.
            </p>

            {repositories.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">
                    No repository activity is available.
                </p>
            ) : (
                <div className="mt-5 space-y-3">
                    {repositories.map((repository, index) => {
                        const repositoryKey =
                            repository.repositoryId ??
                            repository.repositoryFullName ??
                            repository.repositoryName ??
                            `repository-${index}`;


                        return (
                            <Link
                                key={repositoryKey}
                                href={
                                    repository.repositoryId
                                        ? `/repositories/${repository.repositoryId}/intelligence`
                                        : "#"
                                }
                                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4 transition hover:border-primary/50 hover:bg-accent"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <Badge variant="secondary">
                                        {index + 1}
                                    </Badge>

                                    <div className="min-w-0">
                                        <p className="truncate font-medium">
                                            {repository.repositoryFullName ||
                                                repository.repositoryName ||
                                                "Unknown Repository"}
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {(repository.totalActivity ?? 0).toLocaleString()} total activity
                                        </p>
                                    </div>
                                </div>

                                <Badge>
                                    {(repository.totalActivity ?? 0).toLocaleString()}
                                </Badge>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function HighlightCard({
    title,
    repository,
}: {
    title: string;
    repository: PortfolioRepositoryActivity | null;
}) {
    if (!repository) {
        return (
            <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">{title}</p>

                <p className="mt-3 font-medium">
                    No repository highlight available
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                    ArcHive does not have enough activity data for this highlight yet.
                </p>
            </div>
        );
    }

    const safeTotalActivity =
        typeof repository.totalActivity === "number" &&
            Number.isFinite(repository.totalActivity)
            ? repository.totalActivity
            : 0;

    const repositoryLabel =
        repository.repositoryFullName ||
        repository.repositoryName ||
        "Unknown repository";

    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{title}</p>

            <h3 className="mt-3 break-words text-xl font-bold">
                {repositoryLabel}
            </h3>

            <Badge variant="secondary" className="mt-3">
                {safeTotalActivity.toLocaleString()} activities
            </Badge>

            {repository.repositoryId ? (
                <Link
                    href={`/repositories/${repository.repositoryId}/intelligence`}
                    className="mt-4 block text-sm font-medium text-primary hover:underline"
                >
                    Open repository intelligence
                </Link>
            ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                    Repository link unavailable.
                </p>
            )}
        </div>
    );
}

function InactiveRepositories({
    repositories,
}: {
    repositories: PortfolioRepositoryActivity[];
}) {
    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold">
                Inactive Tracked Repositories
            </h2>

            {repositories.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                    All tracked repositories recorded activity during this period.
                </p>
            ) : (
                <div className="mt-4 space-y-2">
                    {repositories.map((repository) => (
                        <Link
                            key={repository.repositoryId}
                            href={`/repositories/${repository.repositoryId}/intelligence`}
                            className="block rounded-lg border border-border bg-background px-3 py-2 text-sm transition hover:bg-accent"
                        >
                            {repository.repositoryFullName ||
                                repository.repositoryName ||
                                repository.repositoryId}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

function DistributionChart({
    title,
    items,
    humanize = true,
}: {
    title: string;
    items: PortfolioDistributionItem[];
    humanize?: boolean;
}) {
    const data = items.slice(0, 10).map((item) => ({
        ...item,
        displayName: humanize
            ? formatIntelligenceLabel(item.name)
            : item.name,
    }));

    return (
        <div className="min-w-0 rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">{title}</h2>

            {data.length === 0 ? (
                <EmptyChartState />
            ) : (
                <div className="mt-6 h-80 min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{
                                top: 10,
                                right: 10,
                                left: 0,
                                bottom: 80,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="displayName"
                                interval={0}
                                angle={-35}
                                textAnchor="end"
                                height={100}
                                tick={{ fontSize: 11 }}
                            />

                            <YAxis
                                allowDecimals={false}
                                tick={{ fontSize: 11 }}
                            />

                            <Tooltip
                                formatter={(value) => [
                                    Number(value).toLocaleString(),
                                    "Count",
                                ]}
                            />

                            <Bar
                                dataKey="count"
                                fill="currentColor"
                                className="text-primary"
                                radius={[6, 6, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

function EmptyChartState() {
    return (
        <div className="mt-6 rounded-xl border border-border bg-background p-10 text-center">
            <p className="text-sm text-muted-foreground">
                No trend data is available for this period.
            </p>
        </div>
    );
}
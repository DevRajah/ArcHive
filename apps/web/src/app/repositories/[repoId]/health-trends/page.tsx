"use client";

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
    Activity,
    ArrowLeft,
    Award,
    Blocks,
    CheckCircle2,
    Code2,
    Gauge,
    HeartPulse,
    Layers3,
    Rocket,
    ShieldAlert,
    TriangleAlert,
    X,
} from "lucide-react";
import Link from "next/link";
import {
    use,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useRouter } from "next/navigation";

import { HealthMetricCard } from "@/components/health-trends/HealthMetricCard";
import { RepositoryHealthHero } from "@/components/health-trends/RepositoryHealthHero";
import { EngineeringInsightCard } from "@/components/health-trends/EngineeringInsightCard";
import { HealthTrendSummary } from "@/components/health-trends/HealthTrendSummary";
import { MultiMetricTrendChart } from "@/components/health-trends/MultiMetricTrendChart";
import { RepositoryDirectionPanel } from "@/components/health-trends/RepositoryDirectionPanel";
import { RepositoryHealthTimeline } from "@/components/health-trends/RepositoryHealthTimeline";
import { RepositoryHealthLoadingSkeleton } from "@/components/health-trends/RepositoryHealthLoadingSkeleton";
import {
    RepositoryHealthEmptyState,
    RepositoryHealthErrorState,
} from "@/components/health-trends/RepositoryHealthState";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
    useRefreshRepositoryHealthTrends,
    useRepositoryHealthChanges,
    useRepositoryHealthHistory,
    useRepositoryHealthSummary,
    useRepositoryHealthTrends,
} from "@/hooks/useRepositoryHealthTrends";
import { useRepositoryOverview } from "@/hooks/useRepositoryOverview";

import { normalizeHealthScore } from "@/utils/repository-health-trends";

import type {
    RepositoryHealthMetric,
    RepositoryHealthChange,
    RepositoryHealthSnapshot,
    RepositoryHealthScoreBreakdown,
    RepositoryHealthSummary,
} from "@/types/repository-health-trends.types";

interface RepositoryHealthTrendsPageProps {
    params: Promise<{
        repoId: string;
    }>;
}


type HealthMetricKey =
    | "architecture"
    | "engineeringQuality"
    | "productionReadiness"
    | "capability"
    | "maturity"
    | "confidence"
    | "risk"
    | "health";

interface BackendHealthSummary {
    direction:
    | "IMPROVING"
    | "DECLINING"
    | "STABLE";
    healthScore: number | null;
    previousHealthScore: number | null;
    healthScoreChange: number | null;
    maturity: string;
    riskLevel:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL"
    | "UNASSESSED";
    confidenceScore: number;
    snapshotCount: number;
    firstRecordedAt: string | null;
    lastRecordedAt: string | null;
    hasEnoughHistory?: boolean;
}

interface BackendLatestScores {
    architecture: number;
    engineeringQuality: number;
    productionReadiness: number;
    capability: number;
    maturity: number;
    confidence: number;
    risk: number | null;
    health: number | null;
}

interface BackendMetricTrend {
    current: number | null;
    previous: number | null;
    change: number | null;
    percentageChange?: number | null;
    direction?: string;
    status?: string;
}

type BackendMetricTrends = Partial<
    Record<HealthMetricKey, BackendMetricTrend>
>;

interface BackendHealthTrendsPayload {
    repository?: {
        id?: string;
        name?: string;
        fullName?: string;
    };
    repositoryName?: string;
    summary?: BackendHealthSummary;
    latestScores?: BackendLatestScores;
    trends?: BackendMetricTrends;
    history?: unknown[];
    changes?: RepositoryHealthChange[];
    insights?: RepositoryHealthSummary["insights"];
    generatedAt?: string;
}

function unwrapResponseData<T>(value: unknown): T | undefined {
    if (!value || typeof value !== "object") {
        return undefined;
    }

    const record = value as Record<string, unknown>;

    if (
        record.data &&
        typeof record.data === "object"
    ) {
        return record.data as T;
    }

    return value as T;
}

function buildHealthMetric(
    current: number | null | undefined,
    trend: BackendMetricTrend | undefined,
): RepositoryHealthMetric {
    /*
     * Missing evidence is different from a genuine score of zero.
     *
     * Do not allow null/undefined to pass through normalizeHealthScore(),
     * because that utility intentionally converts invalid values to zero
     * for ordinary numeric display purposes.
     */
    const rawCurrent =
        current ?? trend?.current ?? null;

    const score =
        rawCurrent === null
            ? null
            : normalizeHealthScore(rawCurrent);

    const previousScore =
        trend?.previous === null ||
            trend?.previous === undefined
            ? null
            : normalizeHealthScore(
                trend.previous,
            );

    const delta =
        score === null
            ? null
            : trend?.change === null ||
                trend?.change === undefined
                ? previousScore === null
                    ? null
                    : score - previousScore
                : trend.change;

    return {
        score,
        previousScore,
        delta,
    };
}

function unwrapData<T>(value: unknown): T | undefined {
    if (!value || typeof value !== "object") {
        return undefined;
    }

    const record = value as Record<string, unknown>;

    if (
        "data" in record &&
        record.data &&
        typeof record.data === "object"
    ) {
        return record.data as T;
    }

    return value as T;
}

function getHttpStatus(error: unknown) {
    return axios.isAxiosError(error)
        ? error.response?.status ?? null
        : null;
}

export default function RepositoryHealthTrendsPage({
    params,
}: RepositoryHealthTrendsPageProps) {
    const { repoId } = use(params);
    const router = useRouter();

    const [showSuccessToast, setShowSuccessToast] =
        useState(false);

    const trendsQuery =
        useRepositoryHealthTrends(repoId);

    const summaryQuery =
        useRepositoryHealthSummary(repoId);

    /*
     * These queries are loaded now so later phases can add the charts and
     * change timeline without changing the page's data architecture.
     */
    const historyQuery =
        useRepositoryHealthHistory(repoId);

    const changesQuery =
        useRepositoryHealthChanges(repoId);

    void changesQuery;

    const repositoryOverviewQuery =
        useRepositoryOverview(repoId);

    const refreshMutation =
        useRefreshRepositoryHealthTrends(repoId);

    const primaryError =
        trendsQuery.error ?? summaryQuery.error;

    const status = getHttpStatus(primaryError);

    useEffect(() => {
        if (status === 401) {
            router.replace("/connect-github");
        }
    }, [router, status]);

    useEffect(() => {
        if (!showSuccessToast) {
            return;
        }

        const timer = window.setTimeout(() => {
            setShowSuccessToast(false);
        }, 5000);

        return () => window.clearTimeout(timer);
    }, [showSuccessToast]);

    /*
     * The service may return either the inner `data` object or the complete
     * API envelope. This helper supports both without inventing another
     * frontend response contract.
     */
    const trendsPayload = useMemo(
        () =>
            unwrapResponseData<BackendHealthTrendsPayload>(
                trendsQuery.data,
            ),
        [trendsQuery.data],
    );

    const directSummary = useMemo(
        () =>
            unwrapResponseData<BackendHealthSummary>(
                summaryQuery.data,
            ),
        [summaryQuery.data],
    );

    const summary =
        directSummary ?? trendsPayload?.summary ?? null;

    const latestScores =
        trendsPayload?.latestScores;

    const trends = trendsPayload?.trends ?? {};

    /*
     * Current scores come from `latestScores`.
     * Previous scores and deltas come from the matching entry in `trends`.
     */
    const metrics = useMemo(
        () => ({
            architecture: buildHealthMetric(
                latestScores?.architecture,
                trends.architecture,
            ),

            engineeringQuality: buildHealthMetric(
                latestScores?.engineeringQuality,
                trends.engineeringQuality,
            ),

            productionReadiness: buildHealthMetric(
                latestScores?.productionReadiness,
                trends.productionReadiness,
            ),

            capability: buildHealthMetric(
                latestScores?.capability,
                trends.capability,
            ),

            maturity: buildHealthMetric(
                latestScores?.maturity,
                trends.maturity,
            ),

            confidence: buildHealthMetric(
                latestScores?.confidence ??
                summary?.confidenceScore,
                trends.confidence,
            ),

            risk: buildHealthMetric(
                latestScores?.risk,
                trends.risk,
            ),

            overallHealth: buildHealthMetric(
                latestScores?.health ??
                summary?.healthScore,
                trends.health,
            ),
        }),
        [latestScores, summary, trends],
    );

    const historyResponse =
        unwrapResponseData<{
            history?: unknown[];
            snapshotCount?: number;
        }>(historyQuery.data);

    // const historyPayload = unwrapData<{
    //     history?: RepositoryHealthSnapshot[];
    //     snapshotCount?: number;
    // }>(historyQuery.data);

    // const history: RepositoryHealthSnapshot[] =
    //     (historyPayload?.history ??
    //         trendsPayload?.history ??
    //         []) as RepositoryHealthSnapshot[];

    const history: RepositoryHealthSnapshot[] =
        historyQuery.data?.history ??
        (trendsPayload?.history as RepositoryHealthSnapshot[] | undefined) ??
        [];

    const insights = trendsPayload?.insights ?? [];

    const repositoryName =
        trendsPayload?.repository?.fullName ??
        trendsPayload?.repository?.name ??
        trendsPayload?.repositoryName ??
        repositoryOverviewQuery.data?.repository
            ?.fullName ??
        repositoryOverviewQuery.data?.repository
            ?.name ??
        `Repository ${repoId}`;

    const snapshotCount =
        summary?.snapshotCount ??
        historyResponse?.snapshotCount ??
        history.length;

    const hasEnoughHistory =
        summary?.hasEnoughHistory ??
        snapshotCount > 1;

    const isInitialLoading =
        (trendsQuery.isLoading ||
            summaryQuery.isLoading) &&
        !summary;

    const hasPrimaryError =
        trendsQuery.isError &&
        summaryQuery.isError;

    async function handleRefresh() {
        try {
            await refreshMutation.mutateAsync();
            setShowSuccessToast(true);
        } catch {
            /*
             * Mutation errors are shown inside the page. We deliberately avoid
             * presenting a success message when regeneration fails.
             */
        }
    }

    return (
        <AppShell>
            <PageContent>
                <AnimatePresence>
                    {showSuccessToast && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: -16,
                                scale: 0.98,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                y: -10,
                                scale: 0.98,
                            }}
                            className="fixed right-5 top-5 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-emerald-500/30 bg-background p-4 shadow-xl"
                        >
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />

                            <div>
                                <p className="font-semibold">
                                    Repository health refreshed
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    ArcHive generated a new health
                                    snapshot and refreshed the trend
                                    data.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowSuccessToast(false)
                                }
                                className="ml-auto text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <X className="h-4 w-4" />

                                <span className="sr-only">
                                    Dismiss notification
                                </span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mb-5">
                    <Button
                        asChild
                        variant="ghost"
                        className="-ml-3"
                    >
                        <Link href={`/repositories/${repoId}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Repository Overview
                        </Link>
                    </Button>
                </div>

                {isInitialLoading && (
                    <RepositoryHealthLoadingSkeleton />
                )}

                {hasPrimaryError &&
                    status === 403 && (
                        <RepositoryHealthErrorState
                            title="Repository health access denied"
                            description="The current ArcHive account cannot access health trends for this repository."
                        />
                    )}

                {hasPrimaryError &&
                    status === 404 && (
                        <RepositoryHealthErrorState
                            title="Repository health trends unavailable"
                            description="ArcHive could not find health trend information for this repository. Refresh the repository health snapshot after repository intelligence has been generated."
                            onRetry={() => {
                                void Promise.all([
                                    trendsQuery.refetch(),
                                    summaryQuery.refetch(),
                                ]);
                            }}
                        />
                    )}

                {hasPrimaryError &&
                    status !== 401 &&
                    status !== 403 &&
                    status !== 404 && (
                        <RepositoryHealthErrorState
                            title="Failed to load Repository Health Trends"
                            description={
                                primaryError instanceof Error
                                    ? primaryError.message
                                    : "ArcHive could not load repository health information."
                            }
                            onRetry={() => {
                                void Promise.all([
                                    trendsQuery.refetch(),
                                    summaryQuery.refetch(),
                                ]);
                            }}
                        />
                    )}

                {!isInitialLoading &&
                    !hasPrimaryError &&
                    !summary && (
                        <RepositoryHealthEmptyState
                            repositoryId={repoId}
                            isRefreshing={
                                refreshMutation.isPending
                            }
                            onRefresh={handleRefresh}
                        />
                    )}

                {summary && (
                    <div className="space-y-10">
                        <RepositoryHealthHero
                            repositoryName={repositoryName}
                            overallHealthScore={
                                metrics.overallHealth.score
                            }
                            direction={summary.direction}
                            confidenceScore={
                                summary.confidenceScore
                            }
                            riskScore={metrics.risk.score}
                            riskLevel={summary.riskLevel}
                            lastUpdatedAt={
                                summary.lastRecordedAt ??
                                trendsPayload?.generatedAt
                            }
                            isRefreshing={
                                refreshMutation.isPending
                            }
                            onRefresh={handleRefresh}
                        />

                        {refreshMutation.isError && (
                            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                                <div className="flex gap-3">
                                    <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

                                    <div>
                                        <p className="font-semibold text-destructive">
                                            Health refresh failed
                                        </p>

                                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                            {refreshMutation.error instanceof
                                                Error
                                                ? refreshMutation.error
                                                    .message
                                                : "ArcHive could not generate a new repository health snapshot."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <section>
                            <SectionHeading
                                eyebrow="Health breakdown"
                                title="Repository Health Scores"
                                description="A structured view of the engineering signals that contribute to the repository's overall health."
                                trailing={
                                    <Badge variant="secondary">
                                        {snapshotCount.toLocaleString()}{" "}
                                        {snapshotCount === 1
                                            ? "snapshot"
                                            : "snapshots"}
                                    </Badge>
                                }
                            />

                            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <HealthMetricCard
                                    title="Architecture"
                                    description="Structural quality, architecture coherence, and detected architecture maturity."
                                    metric={
                                        metrics.architecture
                                    }
                                    icon={Layers3}
                                    index={0}
                                />

                                <HealthMetricCard
                                    title="Engineering Quality"
                                    description="Maintainability, implementation discipline, and engineering practice quality."
                                    metric={
                                        metrics.engineeringQuality
                                    }
                                    icon={Code2}
                                    index={1}
                                />

                                <HealthMetricCard
                                    title="Production Readiness"
                                    description="Operational resilience, production safety, observability, and deployment readiness."
                                    metric={
                                        metrics.productionReadiness
                                    }
                                    icon={Rocket}
                                    index={2}
                                />

                                <HealthMetricCard
                                    title="Capability"
                                    description="Breadth and strength of meaningful engineering capabilities detected by ArcHive."
                                    metric={
                                        metrics.capability
                                    }
                                    icon={Blocks}
                                    index={3}
                                />

                                <HealthMetricCard
                                    title="Maturity"
                                    description="The repository's overall engineering maturity based on available intelligence evidence."
                                    metric={
                                        metrics.maturity
                                    }
                                    icon={Award}
                                    index={4}
                                />

                                <HealthMetricCard
                                    title="Confidence"
                                    description="How strongly the available evidence supports the repository health assessment."
                                    metric={
                                        metrics.confidence
                                    }
                                    icon={Gauge}
                                    index={5}
                                />

                                <HealthMetricCard
                                    title="Risk"
                                    description="The repository's current engineering and production risk exposure. Lower is healthier."
                                    metric={
                                        metrics.risk
                                    }
                                    icon={ShieldAlert}
                                    index={6}
                                    inverseTrend
                                />

                                <HealthMetricCard
                                    title="Overall Health"
                                    description="The combined ArcHive repository health score across architecture, quality, readiness, capability, confidence, and risk."
                                    metric={
                                        metrics.overallHealth
                                    }
                                    icon={HeartPulse}
                                    index={7}
                                />
                            </div>
                        </section>

                        <RepositoryDirectionPanel
                            direction={summary.direction}
                            overallDelta={summary.healthScoreChange}
                            confidenceScore={summary.confidenceScore}
                            riskScore={metrics.risk.score}
                        />

                        {!hasEnoughHistory && (
                            <div className="rounded-xl border border-dashed border-border bg-card p-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                        <Activity className="h-5 w-5 text-primary" />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            More historical snapshots are
                                            required
                                        </h2>

                                        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                            The current repository health can
                                            be displayed, but more historical
                                            snapshots are required before trends
                                            can be generated. Refresh health
                                            after meaningful repository changes
                                            to build an accurate timeline.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <section>
                            <SectionHeading
                                eyebrow="Historical health"
                                title="Repository Health Timeline"
                                description="Track the repository's overall engineering health across every stored assessment snapshot."
                                trailing={
                                    <Badge variant="outline">
                                        {history.length} timeline points
                                    </Badge>
                                }
                            />

                            <div className="mt-6">
                                {historyQuery.isLoading ? (
                                    <div className="h-[430px] animate-pulse rounded-xl bg-muted" />
                                ) : historyQuery.isError ? (
                                    <InlineQueryError
                                        title="Health history could not be loaded"
                                        description="The current repository health remains available. Retry the history request to restore trend visualisation."
                                        onRetry={() => historyQuery.refetch()}
                                    />
                                ) : (
                                    <RepositoryHealthTimeline history={history} />
                                )}
                            </div>
                        </section>

                        <section>
                            <SectionHeading
                                eyebrow="Metric explorer"
                                title="Multi-Metric Trends"
                                description="Compare architecture, quality, readiness, capability, maturity, confidence, risk, and overall health over time."
                            />

                            <div className="mt-6">
                                <MultiMetricTrendChart history={history} />
                            </div>
                        </section>

                        {history.length > 0 && (
                            <section>
                                <SectionHeading
                                    eyebrow="Trend statistics"
                                    title="Repository Trend Summary"
                                    description="Calculated statistics that explain the repository's strongest movement, weakest movement, consistency, and historical range."
                                />

                                <div className="mt-6">
                                    <HealthTrendSummary history={history} />
                                </div>
                            </section>
                        )}

                        <section>
                            <SectionHeading
                                eyebrow="Engineering intelligence"
                                title="Health Insights"
                                description="Evidence-backed observations generated by ArcHive from the repository's current health and historical movement."
                                trailing={
                                    <Badge variant="secondary">
                                        {insights.length} {insights.length === 1 ? "insight" : "insights"}
                                    </Badge>
                                }
                            />

                            {insights.length === 0 ? (
                                <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-8 text-center">
                                    <Activity className="mx-auto h-8 w-8 text-muted-foreground" />

                                    <h3 className="mt-4 font-semibold">
                                        No engineering insights recorded
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                                        The backend did not return a dedicated insight section for the latest
                                        repository health assessment.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-6 grid gap-5 xl:grid-cols-2">
                                    {insights.map((insight, index) => (
                                        <EngineeringInsightCard
                                            key={insight.id ?? `${insight.title}-${index}`}
                                            insight={insight}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </PageContent>
        </AppShell>
    );
}

function InlineQueryError({
    title,
    description,
    onRetry,
}: {
    title: string;
    description: string;
    onRetry: () => void;
}) {
    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <p className="font-semibold">{title}</p>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
            </p>

            <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={onRetry}
            >
                Retry
            </Button>
        </div>
    );
}

function SectionHeading({
    eyebrow,
    title,
    description,
    trailing,
}: {
    eyebrow: string;
    title: string;
    description: string;
    trailing?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {eyebrow}
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight">
                    {title}
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
            </div>

            {trailing && (
                <div className="shrink-0">
                    {trailing}
                </div>
            )}
        </div>
    );
}
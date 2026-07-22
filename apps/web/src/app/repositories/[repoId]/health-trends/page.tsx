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
  Target,
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

import {
  createFallbackMetric,
  normalizeHealthScore,
} from "@/utils/repository-health-trends";

import type {
  RepositoryHealthMetric,
  RepositoryHealthScoreBreakdown,
  RepositoryHealthSummary,
} from "@/types/repository-health-trends.types";

interface RepositoryHealthTrendsPageProps {
  params: Promise<{
    repoId: string;
  }>;
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

  const summary = useMemo(() => {
    return resolveHealthSummary(
      summaryQuery.data,
      trendsQuery.data?.summary,
    );
  }, [
    summaryQuery.data,
    trendsQuery.data?.summary,
  ]);

  const repositoryName =
    summary?.repositoryName ??
    trendsQuery.data?.repositoryName ??
    repositoryOverviewQuery.data?.repository
      ?.fullName ??
    repositoryOverviewQuery.data?.repository
      ?.name ??
    `Repository ${repoId}`;

  const snapshotCount =
    summary?.snapshotCount ??
    historyQuery.data?.snapshotCount ??
    historyQuery.data?.history.length ??
    trendsQuery.data?.history?.length ??
    0;

  /*
   * A single snapshot can show the repository's current condition, but
   * cannot establish a historical direction. The backend may explicitly
   * provide hasEnoughHistory, otherwise we derive it from snapshot count.
   */
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
                summary.overallHealthScore
              }
              direction={summary.direction}
              confidenceScore={
                summary.confidenceScore
              }
              riskScore={summary.riskScore}
              riskLevel={summary.riskLevel}
              lastUpdatedAt={
                summary.lastUpdatedAt ??
                summary.generatedAt ??
                trendsQuery.data?.generatedAt
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
                    summary.scoreBreakdown
                      .architecture
                  }
                  icon={Layers3}
                  index={0}
                />

                <HealthMetricCard
                  title="Engineering Quality"
                  description="Maintainability, implementation discipline, and engineering practice quality."
                  metric={
                    summary.scoreBreakdown
                      .engineeringQuality
                  }
                  icon={Code2}
                  index={1}
                />

                <HealthMetricCard
                  title="Production Readiness"
                  description="Operational resilience, production safety, observability, and deployment readiness."
                  metric={
                    summary.scoreBreakdown
                      .productionReadiness
                  }
                  icon={Rocket}
                  index={2}
                />

                <HealthMetricCard
                  title="Capability"
                  description="Breadth and strength of meaningful engineering capabilities detected by ArcHive."
                  metric={
                    summary.scoreBreakdown
                      .capability
                  }
                  icon={Blocks}
                  index={3}
                />

                <HealthMetricCard
                  title="Maturity"
                  description="The repository's overall engineering maturity based on available intelligence evidence."
                  metric={
                    summary.scoreBreakdown
                      .maturity
                  }
                  icon={Award}
                  index={4}
                />

                <HealthMetricCard
                  title="Confidence"
                  description="How strongly the available evidence supports the repository health assessment."
                  metric={
                    summary.scoreBreakdown
                      .confidence
                  }
                  icon={Gauge}
                  index={5}
                />

                <HealthMetricCard
                  title="Risk"
                  description="The repository's current engineering and production risk exposure. Lower is healthier."
                  metric={
                    summary.scoreBreakdown.risk
                  }
                  icon={ShieldAlert}
                  index={6}
                  inverseTrend
                />

                <HealthMetricCard
                  title="Overall Health"
                  description="The combined ArcHive repository health score across architecture, quality, readiness, capability, confidence, and risk."
                  metric={
                    summary.scoreBreakdown
                      .overallHealth
                  }
                  icon={HeartPulse}
                  index={7}
                />
              </div>
            </section>

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
                eyebrow="Coming in the next build phase"
                title="Health Timeline and Metric Trends"
                description="The data layer is already connected to repository history. Phase 2 will render the interactive health timeline and multi-metric trend chart here."
                trailing={
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {
                        historyQuery.data?.history
                          .length ?? 0
                      }{" "}
                      history points
                    </Badge>

                    <Badge variant="outline">
                      {
                        changesQuery.data?.changes
                          .length ?? 0
                      }{" "}
                      detected changes
                    </Badge>
                  </div>
                }
              />

              <div className="mt-6 grid min-h-72 place-items-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
                <div className="max-w-xl">
                  <Target className="mx-auto h-10 w-10 text-muted-foreground" />

                  <h3 className="mt-4 text-lg font-semibold">
                    Trend visualisation foundation is
                    ready
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    The history and changes APIs are
                    connected. The next phase adds the
                    Recharts timeline, metric switcher,
                    engineering insights, and repository
                    change timeline.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </PageContent>
    </AppShell>
  );
}

function resolveHealthSummary(
  directSummary:
    | RepositoryHealthSummary
    | undefined,
  trendsSummary:
    | RepositoryHealthSummary
    | undefined,
) {
  const source =
    directSummary ?? trendsSummary;

  if (!source) {
    return null;
  }

  /*
   * Some backend implementations may provide the headline values while
   * omitting a fully expanded scoreBreakdown. These fallbacks keep the
   * page safe while still respecting the existing backend response.
   */
  const scoreBreakdown =
    source.scoreBreakdown ??
    createFallbackScoreBreakdown(source);

  return {
    ...source,
    overallHealthScore:
      normalizeHealthScore(
        source.overallHealthScore,
      ),

    previousOverallHealthScore:
      source.previousOverallHealthScore ===
        null ||
      source.previousOverallHealthScore ===
        undefined
        ? null
        : normalizeHealthScore(
            source.previousOverallHealthScore,
          ),

    confidenceScore:
      normalizeHealthScore(
        source.confidenceScore,
      ),

    riskScore:
      normalizeHealthScore(source.riskScore),

    scoreBreakdown,
    insights: source.insights ?? [],
  };
}

function createFallbackScoreBreakdown(
  summary: RepositoryHealthSummary,
): RepositoryHealthScoreBreakdown {
  return {
    architecture: resolveMetric(
      summary,
      "architecture",
    ),

    engineeringQuality: resolveMetric(
      summary,
      "engineeringQuality",
    ),

    productionReadiness: resolveMetric(
      summary,
      "productionReadiness",
    ),

    capability: resolveMetric(
      summary,
      "capability",
    ),

    maturity: resolveMetric(
      summary,
      "maturity",
    ),

    confidence: createFallbackMetric(
      summary.confidenceScore,
    ),

    risk: createFallbackMetric(
      summary.riskScore,
    ),

    overallHealth: createFallbackMetric(
      summary.overallHealthScore,
      summary.previousOverallHealthScore,
      summary.overallHealthDelta,
    ),
  };
}

function resolveMetric(
  summary: RepositoryHealthSummary,
  key:
    | "architecture"
    | "engineeringQuality"
    | "productionReadiness"
    | "capability"
    | "maturity",
): RepositoryHealthMetric {
  const summaryRecord =
    summary as unknown as Record<
      string,
      unknown
    >;

  const scoreAliases: Record<
    typeof key,
    string[]
  > = {
    architecture: [
      "architectureScore",
      "architecture",
    ],

    engineeringQuality: [
      "engineeringQualityScore",
      "engineeringQuality",
    ],

    productionReadiness: [
      "productionReadinessScore",
      "productionReadiness",
    ],

    capability: [
      "capabilityScore",
      "capability",
    ],

    maturity: [
      "maturityScore",
      "maturity",
    ],
  };

  const previousAliases: Record<
    typeof key,
    string[]
  > = {
    architecture: [
      "previousArchitectureScore",
    ],

    engineeringQuality: [
      "previousEngineeringQualityScore",
    ],

    productionReadiness: [
      "previousProductionReadinessScore",
    ],

    capability: [
      "previousCapabilityScore",
    ],

    maturity: [
      "previousMaturityScore",
    ],
  };

  const deltaAliases: Record<
    typeof key,
    string[]
  > = {
    architecture: ["architectureDelta"],

    engineeringQuality: [
      "engineeringQualityDelta",
    ],

    productionReadiness: [
      "productionReadinessDelta",
    ],

    capability: ["capabilityDelta"],

    maturity: ["maturityDelta"],
  };

  return createFallbackMetric(
    readNumber(
      summaryRecord,
      scoreAliases[key],
    ),

    readNumber(
      summaryRecord,
      previousAliases[key],
    ),

    readNumber(
      summaryRecord,
      deltaAliases[key],
    ),
  );
}

function readNumber(
  source: Record<string, unknown>,
  keys: string[],
) {
  for (const key of keys) {
    const value = source[key];

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }
  }

  return null;
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
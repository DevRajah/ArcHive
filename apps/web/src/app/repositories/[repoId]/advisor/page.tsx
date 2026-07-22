"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
    Activity,
    ArrowLeft,
    Award,
    Blocks,
    Boxes,
    BrainCircuit,
    CheckCircle2,
    ClipboardCheck,
    Code2,
    Gauge,
    GitBranch,
    Layers3,
    Network,
    RefreshCcw,
    Rocket,
    SearchX,
    ShieldAlert,
    Sparkles,
    Target,
    TriangleAlert,
    X,
} from "lucide-react";

import { AdvisorEvidencePanel } from "@/components/advisor/AdvisorEvidencePanel";
import { AdvisorFindingCard } from "@/components/advisor/AdvisorFindingCard";
import { AdvisorHistoryTimeline } from "@/components/advisor/AdvisorHistoryTimeline";
import { AdvisorLoadingSkeleton } from "@/components/advisor/AdvisorLoadingSkeleton";
import { AdvisorPriorityRoadmap } from "@/components/advisor/AdvisorPriorityRoadmap";
import { AdvisorScoreCard } from "@/components/advisor/AdvisorScoreCard";
import { AdvisorSeverityBadge } from "@/components/advisor/AdvisorSeverityBadge";
import { useRepositoryOverview } from "@/hooks/useRepositoryOverview";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
    useArchitectureAdvisor,
    useArchitectureAdvisorHistory,
    useRefreshArchitectureAdvisor,
} from "@/hooks/useArchitectureAdvisor";

import type {
    AdvisorFinding,
    AdvisorRecommendedStep,
    AdvisorStrength,
} from "@/types/architecture-advisor.types";

interface AdvisorPageProps {
    params: Promise<{
        repoId: string;
    }>;
}

function getStatus(error: unknown) {
    return axios.isAxiosError(error)
        ? error.response?.status ?? null
        : null;
}

function percentage(value: number) {
    const normalized =
        value <= 1 ? value * 100 : value;

    return Math.max(
        0,
        Math.min(100, Math.round(normalized))
    );
}

/*
 * The advisor backend may expose score names using slightly different
 * aliases as the contract evolves. This helper keeps the page resilient
 * without changing or inventing any API endpoint.
 */
function getAdvisorScore(
    scores: unknown,
    keys: string[]
) {
    if (
        typeof scores !== "object" ||
        scores === null
    ) {
        return 0;
    }

    const scoreRecord = scores as Record<
        string,
        unknown
    >;

    for (const key of keys) {
        const value = scoreRecord[key];

        if (
            typeof value === "number" &&
            Number.isFinite(value)
        ) {
            return value;
        }
    }

    return 0;
}

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "long",
        timeStyle: "short",
    }).format(date);
}

function normalizeEvidence(
    evidence: string[] | string
) {
    if (Array.isArray(evidence)) {
        return evidence;
    }

    return evidence ? [evidence] : [];
}

export default function ArchitectureAdvisorPage({
    params,
}: AdvisorPageProps) {
    const { repoId } = use(params);
    const router = useRouter();

    const [showSuccessToast, setShowSuccessToast] =
        useState(false);

    const advisorQuery =
        useArchitectureAdvisor(repoId);

    const historyQuery =
        useArchitectureAdvisorHistory(repoId);

    const refreshMutation =
        useRefreshArchitectureAdvisor(repoId);

    /*
     * Reuse ArcHive's existing repository overview query so the hero can
     * display the real repository name even when the advisor payload only
     * contains the repository ID.
     */
    const repositoryOverviewQuery =
        useRepositoryOverview(repoId);

    const status = getStatus(advisorQuery.error);

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

    const assessment = advisorQuery.data;

    const resolvedRepositoryName =
        assessment?.repositoryName ||
        repositoryOverviewQuery.data?.repository
            ?.fullName ||
        repositoryOverviewQuery.data?.repository?.name;

    const architectureScore = assessment
        ? getAdvisorScore(assessment.scores, [
              "architectureScore",
              "architecture",
              "architectureMaturityScore",
              "architectureQualityScore",
          ])
        : 0;

    const engineeringQualityScore = assessment
        ? getAdvisorScore(assessment.scores, [
              "engineeringQuality",
              "engineeringQualityScore",
              "qualityScore",
          ])
        : 0;

    const capabilityScore = assessment
        ? getAdvisorScore(assessment.scores, [
              "capabilityScore",
              "capability",
              "capabilitiesScore",
          ])
        : 0;

    const productionReadinessScore = assessment
        ? getAdvisorScore(assessment.scores, [
              "productionReadiness",
              "productionReadinessScore",
              "readinessScore",
          ])
        : 0;

    const findingSections = useMemo(
        () =>
            assessment
                ? [
                      {
                          id: "architecture",
                          title: "Architecture Concerns",
                          description:
                              "Structural design concerns found in the repository architecture.",
                          findings:
                              assessment.architectureConcerns,
                      },
                      {
                          id: "production",
                          title: "Production Risks",
                          description:
                              "Conditions that may affect safe and predictable production operation.",
                          findings:
                              assessment.productionRisks,
                      },
                      {
                          id: "security",
                          title: "Security Observations",
                          description:
                              "Security-related signals requiring engineering review.",
                          findings:
                              assessment.securityObservations,
                      },
                      {
                          id: "scalability",
                          title: "Scalability Concerns",
                          description:
                              "Potential limitations as traffic, workloads, and data volumes grow.",
                          findings:
                              assessment.scalabilityConcerns,
                      },
                      {
                          id: "reliability",
                          title: "Reliability Concerns",
                          description:
                              "Signals affecting resilience, fault tolerance, and service continuity.",
                          findings:
                              assessment.reliabilityConcerns,
                      },
                      {
                          id: "maintainability",
                          title: "Maintainability",
                          description:
                              "Factors that may increase the long-term cost of changing the system.",
                          findings:
                              assessment.maintainabilityConcerns,
                      },
                      {
                          id: "observability",
                          title: "Observability",
                          description:
                              "Logging, metrics, tracing, diagnostics, and operational visibility.",
                          findings:
                              assessment.observabilityConcerns,
                      },
                      {
                          id: "data",
                          title: "Data Concerns",
                          description:
                              "Signals related to persistence, integrity, access, and data lifecycle.",
                          findings:
                              assessment.dataConcerns,
                      },
                      {
                          id: "delivery",
                          title: "Delivery Concerns",
                          description:
                              "Deployment, testing, release, and engineering workflow observations.",
                          findings:
                              assessment.deliveryConcerns,
                      },
                  ]
                : [],
        [assessment]
    );

    async function handleRefresh() {
        try {
            await refreshMutation.mutateAsync();
            setShowSuccessToast(true);
        } catch {
            /*
             * The mutation error is displayed in the page below.
             * We do not show a misleading success toast.
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
                                    Assessment refreshed
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    ArcHive has generated a new
                                    architecture assessment.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowSuccessToast(false)
                                }
                                className="ml-auto text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">
                                    Dismiss
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
                        <Link
                            href={`/repositories/${repoId}`}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Repository Overview
                        </Link>
                    </Button>
                </div>

                {advisorQuery.isLoading && (
                    <AdvisorLoadingSkeleton />
                )}

                {advisorQuery.isError &&
                    status === 403 && (
                        <AdvisorErrorState
                            icon={ShieldAlert}
                            title="Architecture Advisor access denied"
                            description="The current ArcHive account cannot access this repository assessment."
                        />
                    )}

                {advisorQuery.isError &&
                    status === 404 && (
                        <AdvisorErrorState
                            icon={SearchX}
                            title="Architecture assessment unavailable"
                            description="ArcHive could not find an advisor assessment for this repository. Generate repository intelligence first, then retry."
                            onRetry={() =>
                                advisorQuery.refetch()
                            }
                        />
                    )}

                {advisorQuery.isError &&
                    status !== 401 &&
                    status !== 403 &&
                    status !== 404 && (
                        <AdvisorErrorState
                            icon={TriangleAlert}
                            title="Failed to load Architecture Advisor"
                            description={
                                advisorQuery.error instanceof
                                Error
                                    ? advisorQuery.error.message
                                    : "ArcHive could not load this engineering assessment."
                            }
                            onRetry={() =>
                                advisorQuery.refetch()
                            }
                        />
                    )}

                {!advisorQuery.isLoading &&
                    !advisorQuery.isError &&
                    !assessment && (
                        <AdvisorEmptyState
                            repositoryId={repoId}
                            isRefreshing={
                                refreshMutation.isPending
                            }
                            onRefresh={handleRefresh}
                        />
                    )}

                {assessment && (
                    <div className="space-y-10">
                        <AdvisorHero
                            repositoryId={repoId}
                            repositoryName={
                                resolvedRepositoryName
                            }
                            assessment={
                                assessment.overallAssessment
                            }
                            maturityLabel={
                                assessment.maturityLabel
                            }
                            riskScore={percentage(
                                assessment.overallRiskScore
                            )}
                            confidenceScore={percentage(
                                assessment.confidenceScore
                            )}
                            generatedAt={
                                assessment.generatedAt
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
                                            Refresh failed
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {refreshMutation.error instanceof
                                            Error
                                                ? refreshMutation
                                                      .error
                                                      .message
                                                : "ArcHive could not regenerate the assessment."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <section>
                            <SectionHeading
                                eyebrow="Engineering scores"
                                title="Repository Assessment"
                                description="A structured view of the architecture, engineering quality, capabilities, and production readiness detected by ArcHive."
                            />

                            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <AdvisorScoreCard
                                    label="Architecture Score"
                                    value={
                                        architectureScore
                                    }
                                    icon={Layers3}
                                    description="How coherently the repository structure and detected architecture patterns work together."
                                />

                                <AdvisorScoreCard
                                    label="Engineering Quality"
                                    value={
                                        engineeringQualityScore
                                    }
                                    icon={Code2}
                                    description="Evidence of maintainable engineering practices, separation of concerns, and implementation discipline."
                                />

                                <AdvisorScoreCard
                                    label="Capability Score"
                                    value={
                                        capabilityScore
                                    }
                                    icon={Blocks}
                                    description="The breadth and strength of meaningful engineering capabilities detected in the repository."
                                />

                                <AdvisorScoreCard
                                    label="Production Readiness"
                                    value={
                                        productionReadinessScore
                                    }
                                    icon={Rocket}
                                    description="How prepared the system appears for reliable, secure, and observable production operation."
                                />

                                <AdvisorScoreCard
                                    label="Confidence"
                                    value={percentage(
                                        assessment.confidenceScore
                                    )}
                                    icon={Gauge}
                                    description="How strongly the available repository evidence supports this assessment."
                                />

                                <AdvisorScoreCard
                                    label="Maturity"
                                    value={
                                        assessment.maturityLabel
                                    }
                                    progress={percentage(
                                        architectureScore
                                    )}
                                    icon={Award}
                                    description="The advisor's overall maturity classification based on the available engineering evidence."
                                />
                            </div>
                        </section>

                        <section>
                            <SectionHeading
                                eyebrow="Repository profile"
                                title="Detected Engineering Context"
                                description="The technologies, architecture domains, repository types, and capabilities used as assessment context."
                            />

                            <div className="mt-6 grid gap-5 xl:grid-cols-2">
                                <BadgePanel
                                    title="Technologies"
                                    description="Technology signals identified across the repository."
                                    values={
                                        assessment.technologies
                                    }
                                    icon={Code2}
                                />

                                <BadgePanel
                                    title="Repository Types"
                                    description="The repository roles and product classifications detected by ArcHive."
                                    values={
                                        assessment.repositoryTypes
                                    }
                                    icon={GitBranch}
                                />

                                <BadgePanel
                                    title="Architecture Domains"
                                    description="Architecture areas represented by the repository."
                                    values={
                                        assessment.architectureDomains
                                    }
                                    icon={Network}
                                />

                                <BadgePanel
                                    title="Capabilities"
                                    description="Meaningful engineering capabilities identified from repository evidence."
                                    values={
                                        assessment.capabilities
                                    }
                                    icon={Boxes}
                                />
                            </div>
                        </section>

                        <section>
                            <SectionHeading
                                eyebrow="Positive signals"
                                title="Engineering Strengths"
                                description="Evidence-backed areas where the repository demonstrates strong engineering practice."
                            />

                            {assessment.strengths.length ===
                            0 ? (
                                <InlineEmptyState
                                    title="No strengths recorded"
                                    description="The current assessment did not return a dedicated strength section."
                                />
                            ) : (
                                <div className="mt-6 grid gap-5 xl:grid-cols-2">
                                    {assessment.strengths.map(
                                        (
                                            strength,
                                            index
                                        ) => (
                                            <StrengthCard
                                                key={`${strength.title}-${index}`}
                                                strength={
                                                    strength
                                                }
                                                index={
                                                    index
                                                }
                                            />
                                        )
                                    )}
                                </div>
                            )}
                        </section>

                        {findingSections.map(
                            (section) => (
                                <AdvisorFindingSection
                                    key={section.id}
                                    title={section.title}
                                    description={
                                        section.description
                                    }
                                    findings={
                                        section.findings
                                    }
                                />
                            )
                        )}

                        <section>
                            <SectionHeading
                                eyebrow="Engineering roadmap"
                                title="Priority Actions"
                                description="The highest-value actions ArcHive recommends addressing first."
                            />

                            <div className="mt-6">
                                <AdvisorPriorityRoadmap
                                    actions={
                                        assessment.priorityActions
                                    }
                                />
                            </div>
                        </section>

                        <section>
                            <SectionHeading
                                eyebrow="Recommended sequence"
                                title="Recommended Next Steps"
                                description="A practical implementation sequence for improving the repository."
                            />

                            <div className="mt-6">
                                <RecommendedSteps
                                    steps={
                                        assessment.recommendedNextSteps
                                    }
                                />
                            </div>
                        </section>

                        <AdvisorEvidencePanel
                            evidence={
                                assessment.evidenceSummary
                            }
                        />

                        <section>
                            <SectionHeading
                                eyebrow="Assessment evolution"
                                title="Advisor History"
                                description="Track how repository maturity, risk, and advisor confidence change over time."
                            />

                            <div className="mt-6">
                                {historyQuery.isLoading ? (
                                    <div className="space-y-4">
                                        {Array.from({
                                            length: 3,
                                        }).map(
                                            (_, index) => (
                                                <div
                                                    key={
                                                        index
                                                    }
                                                    className="h-40 animate-pulse rounded-xl bg-muted"
                                                />
                                            )
                                        )}
                                    </div>
                                ) : historyQuery.isError ? (
                                    <div className="rounded-xl border border-border bg-card p-6">
                                        <p className="font-semibold">
                                            Advisor history could
                                            not be loaded
                                        </p>

                                        <p className="mt-2 text-sm text-muted-foreground">
                                            The current assessment
                                            remains available. Retry
                                            the history request when
                                            ready.
                                        </p>

                                        <Button
                                            variant="outline"
                                            className="mt-4"
                                            onClick={() =>
                                                historyQuery.refetch()
                                            }
                                        >
                                            Retry History
                                        </Button>
                                    </div>
                                ) : (
                                    <AdvisorHistoryTimeline
                                        history={
                                            historyQuery.data
                                                ?.history ?? []
                                        }
                                    />
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </PageContent>
        </AppShell>
    );
}

function AdvisorHero({
    repositoryId,
    repositoryName,
    assessment,
    maturityLabel,
    riskScore,
    confidenceScore,
    generatedAt,
    isRefreshing,
    onRefresh,
}: {
    repositoryId: string;
    repositoryName?: string;
    assessment: string;
    maturityLabel: string;
    riskScore: number;
    confidenceScore: number;
    generatedAt: string;
    isRefreshing: boolean;
    onRefresh: () => void;
}) {
    return (
        <motion.section
            initial={{
                opacity: 0,
                y: 12,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
        >
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative">
                <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
                    <div className="max-w-4xl">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className="border-primary/30 bg-primary/5 text-primary"
                            >
                                <BrainCircuit className="mr-1.5 h-3.5 w-3.5" />
                                Architecture Advisor
                            </Badge>

                            <Badge variant="secondary">
                                Evidence-based assessment
                            </Badge>
                        </div>

                        <p className="mt-6 text-sm font-medium text-muted-foreground">
                            Repository
                        </p>

                        <h1 className="mt-1 break-words text-3xl font-bold tracking-tight md:text-4xl">
                            {repositoryName ??
                                `Repository ${repositoryId}`}
                        </h1>

                        <div className="mt-6 inline-flex rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                    Maturity
                                </p>

                                <p className="mt-1 text-xl font-bold">
                                    {maturityLabel}
                                </p>
                            </div>
                        </div>

                        <div className="mt-7">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Overall Assessment
                            </p>

                            <p className="mt-3 text-base leading-8 text-foreground/90 md:text-lg">
                                {assessment}
                            </p>
                        </div>
                    </div>

                    <Button
                        type="button"
                        size="lg"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="shrink-0"
                    >
                        <RefreshCcw
                            className={`mr-2 h-4 w-4 ${
                                isRefreshing
                                    ? "animate-spin"
                                    : ""
                            }`}
                        />

                        {isRefreshing
                            ? "Refreshing Assessment"
                            : "Refresh Assessment"}
                    </Button>
                </div>

                <div className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
                    <HeroMetric
                        label="Overall Risk"
                        value={`${riskScore}%`}
                        description="Lower is healthier"
                        icon={ShieldAlert}
                    />

                    <HeroMetric
                        label="Confidence"
                        value={`${confidenceScore}%`}
                        description="Evidence confidence"
                        icon={Target}
                    />

                    <HeroMetric
                        label="Generated"
                        value={formatDate(generatedAt)}
                        description="Latest advisor review"
                        icon={Activity}
                        compact
                    />
                </div>
            </div>
        </motion.section>
    );
}

function HeroMetric({
    label,
    value,
    description,
    icon: Icon,
    compact = false,
}: {
    label: string;
    value: string;
    description: string;
    icon: typeof Activity;
    compact?: boolean;
}) {
    return (
        <div className="rounded-xl border border-border bg-background/70 p-4">
            <Icon className="h-5 w-5 text-primary" />

            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </p>

            <p
                className={
                    compact
                        ? "mt-1 text-base font-bold leading-6"
                        : "mt-1 text-2xl font-bold"
                }
            >
                {value}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function BadgePanel({
    title,
    description,
    values,
    icon: Icon,
}: {
    title: string;
    description: string;
    values: string[];
    icon: typeof Code2;
}) {
    return (
        <article className="rounded-xl border border-border bg-card p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
            </div>

            <h3 className="mt-4 text-lg font-semibold">
                {title}
            </h3>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {description}
            </p>

            {values.length === 0 ? (
                <p className="mt-5 text-sm text-muted-foreground">
                    No values were detected.
                </p>
            ) : (
                <div className="mt-5 flex flex-wrap gap-2">
                    {values.map((value, index) => (
                        <Badge
                            key={`${value}-${index}`}
                            variant="secondary"
                            className="max-w-full break-all"
                        >
                            {value}
                        </Badge>
                    ))}
                </div>
            )}
        </article>
    );
}

function StrengthCard({
    strength,
    index,
}: {
    strength: AdvisorStrength;
    index: number;
}) {
    const evidence = normalizeEvidence(
        strength.evidence
    );

    return (
        <motion.article
            initial={{
                opacity: 0,
                y: 14,
            }}
            whileInView={{
                opacity: 1,
                y: 0,
            }}
            viewport={{ once: true }}
            transition={{
                duration: 0.35,
                delay: Math.min(index * 0.05, 0.2),
            }}
            className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-5"
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>

            <h3 className="mt-4 text-lg font-semibold">
                {strength.title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {strength.description}
            </p>

            {evidence.length > 0 && (
                <div className="mt-4 rounded-lg border border-emerald-500/20 bg-background/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                        Supporting evidence
                    </p>

                    <ul className="mt-3 space-y-2">
                        {evidence.map(
                            (item, evidenceIndex) => (
                                <li
                                    key={`${item}-${evidenceIndex}`}
                                    className="flex gap-2 text-sm leading-6 text-muted-foreground"
                                >
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                    {item}
                                </li>
                            )
                        )}
                    </ul>
                </div>
            )}
        </motion.article>
    );
}

function AdvisorFindingSection({
    title,
    description,
    findings,
}: {
    title: string;
    description: string;
    findings: AdvisorFinding[];
}) {
    if (findings.length === 0) {
        return null;
    }

    const severityOrder = {
        CRITICAL: 5,
        HIGH: 4,
        MEDIUM: 3,
        LOW: 2,
        INFO: 1,
    };

    const sortedFindings = [...findings].sort(
        (first, second) =>
            severityOrder[second.severity] -
            severityOrder[first.severity]
    );

    return (
        <section>
            <SectionHeading
                eyebrow="Advisor findings"
                title={title}
                description={description}
                count={findings.length}
            />

            <div className="mt-6 grid gap-5 xl:grid-cols-2">
                {sortedFindings.map(
                    (finding, index) => (
                        <AdvisorFindingCard
                            key={`${finding.title}-${index}`}
                            finding={finding}
                            index={index}
                        />
                    )
                )}
            </div>
        </section>
    );
}

function RecommendedSteps({
    steps,
}: {
    steps: Array<
        string | AdvisorRecommendedStep
    >;
}) {
    if (steps.length === 0) {
        return (
            <InlineEmptyState
                title="No additional next steps"
                description="The advisor did not return a separate implementation sequence."
            />
        );
    }

    return (
        <div className="grid gap-4">
            {steps.map((step, index) => {
                const normalizedStep =
                    typeof step === "string"
                        ? {
                              title: step,
                          }
                        : step;

                return (
                    <motion.article
                        key={`${normalizedStep.title}-${index}`}
                        initial={{
                            opacity: 0,
                            x: -10,
                        }}
                        whileInView={{
                            opacity: 1,
                            x: 0,
                        }}
                        viewport={{ once: true }}
                        transition={{
                            duration: 0.3,
                            delay: Math.min(
                                index * 0.05,
                                0.25
                            ),
                        }}
                        className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-[48px_1fr]"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
                            {index + 1}
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold">
                                    {normalizedStep.title}
                                </h3>

                                {normalizedStep.category && (
                                    <Badge variant="outline">
                                        {
                                            normalizedStep.category
                                        }
                                    </Badge>
                                )}
                            </div>

                            {normalizedStep.description && (
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {
                                        normalizedStep.description
                                    }
                                </p>
                            )}

                            {normalizedStep.rationale && (
                                <p className="mt-3 text-sm leading-6">
                                    <span className="font-semibold">
                                        Rationale:
                                    </span>{" "}
                                    {
                                        normalizedStep.rationale
                                    }
                                </p>
                            )}
                        </div>
                    </motion.article>
                );
            })}
        </div>
    );
}

function SectionHeading({
    eyebrow,
    title,
    description,
    count,
}: {
    eyebrow: string;
    title: string;
    description: string;
    count?: number;
}) {
    return (
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
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

            {typeof count === "number" && (
                <Badge
                    variant="secondary"
                    className="w-fit"
                >
                    {count}{" "}
                    {count === 1
                        ? "finding"
                        : "findings"}
                </Badge>
            )}
        </div>
    );
}

function InlineEmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <ClipboardCheck className="mx-auto h-8 w-8 text-muted-foreground" />

            <h3 className="mt-4 font-semibold">
                {title}
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function AdvisorEmptyState({
    repositoryId,
    isRefreshing,
    onRefresh,
}: {
    repositoryId: string;
    isRefreshing: boolean;
    onRefresh: () => void;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <BrainCircuit className="h-8 w-8 text-primary" />
            </div>

            <h1 className="mt-6 text-2xl font-bold">
                No architecture assessment yet
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                ArcHive has not generated an Architecture
                Advisor assessment for this repository. Generate
                one using the repository intelligence already
                available.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                >
                    <Sparkles
                        className={`mr-2 h-4 w-4 ${
                            isRefreshing
                                ? "animate-pulse"
                                : ""
                        }`}
                    />

                    {isRefreshing
                        ? "Generating Assessment"
                        : "Generate Assessment"}
                </Button>

                <Button
                    asChild
                    variant="outline"
                >
                    <Link
                        href={`/repositories/${repositoryId}/intelligence`}
                    >
                        Repository Intelligence
                    </Link>
                </Button>
            </div>
        </div>
    );
}

function AdvisorErrorState({
    icon: Icon,
    title,
    description,
    onRetry,
}: {
    icon: typeof TriangleAlert;
    title: string;
    description: string;
    onRetry?: () => void;
}) {
    return (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
                <Icon className="h-7 w-7 text-destructive" />
            </div>

            <h1 className="mt-5 text-2xl font-bold">
                {title}
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {description}
            </p>

            {onRetry && (
                <Button
                    variant="outline"
                    className="mt-6"
                    onClick={onRetry}
                >
                    Retry
                </Button>
            )}
        </div>
    );
}
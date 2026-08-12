"use client";

import Link from "next/link";

import {
    useMemo,
    useState,
} from "react";

import {
    ArrowRight,
    GitCompareArrows,
    Sparkles,
} from "lucide-react";

import {
    formatIntelligenceLabel,
} from "@/lib/intelligence-labels";

import {
    ComparisonScoreCard,
} from "@/components/comparison/ComparisonScoreCard";

import {
    TechnologyOverlap,
} from "@/components/comparison/TechnologyOverlap";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
    useRepositoryComparison,
    useRepositoryIntelligenceReport,
    useTrackedRepositories,
} from "@/hooks/useRepositories";

import type {
    RepositoryComparisonSummary,
} from "@/types/repository-comparison.types";

type IntelligenceShape = {
    repository?: {
        id?: string;
        name?: string;
        fullName?: string | null;
        language?: string | null;
    };

    summary?: {
        primaryRepositoryType?:
        | string
        | null;

        persona?:
        | string
        | null;

        healthScore?:
        | number
        | null;

        healthStatus?:
        | string
        | null;

        maturityScore?:
        | number
        | null;

        maturityLevel?:
        | string
        | null;

        productionReadinessScore?:
        | number
        | null;

        productionReadinessLevel?:
        | string
        | null;

        engineeringQualityScore?:
        | number
        | null;
    };

    repositoryIntelligence?: {
        identity?: {
            primaryRepositoryType?:
            | string
            | null;

            repositoryTypes?: string[];

            repositoryPersona?:
            | string
            | null;
        };

        signals?: {
            technologies?: string[];

            architectureDomains?: string[];

            capabilities?: Record<
                string,
                boolean
            >;
        };

        advisor?: {
            strengthReport?: {
                strengths?: unknown[];
            };

            weaknessReport?: {
                weaknesses?: unknown[];
            };

            recommendationReport?: {
                recommendations?: unknown[];
            };
        };
    };

    legacy?: {
        repositoryTypes?: string[];
        technologies?: string[];
        architectureDomains?: string[];
    };
};

interface ComparisonInsightItem {
    category?: string | null;
    title?: string | null;
    description?: string | null;
    evidence?: string | null;
    severity?: string | null;
}

interface CoreMetric {
    label: string;
    left?: number | null;
    right?: number | null;
}

function getEnabledCapabilities(
    capabilities?: Record<
        string,
        boolean
    >,
) {
    if (!capabilities) {
        return [];
    }

    return Object.entries(
        capabilities,
    )
        .filter(
            ([, enabled]) =>
                enabled,
        )
        .map(([name]) => name);
}

function normalizeInsightText(
    item: unknown,
) {
    if (
        typeof item === "string" ||
        typeof item === "number"
    ) {
        return String(item);
    }

    if (
        item &&
        typeof item === "object" &&
        !Array.isArray(item)
    ) {
        const record =
            item as Record<
                string,
                unknown
            >;

        return String(
            record.title ||
            record.action ||
            record.reason ||
            record.description ||
            "Insight",
        );
    }

    return "Insight";
}

function toSummary(
    data?: unknown,
): RepositoryComparisonSummary | null {
    const report =
        data as
        | IntelligenceShape
        | undefined;

    if (!report?.repository?.id) {
        return null;
    }

    const intelligence =
        report.repositoryIntelligence;

    return {
        id:
            report.repository.id,

        name:
            report.repository.name ||
            "Repository",

        fullName:
            report.repository.fullName,

        /*
         * Repository identity is canonical.
         * Summary is retained only as a compatibility fallback.
         */
        primaryRepositoryType:
            intelligence?.identity
                ?.primaryRepositoryType ??
            report.summary
                ?.primaryRepositoryType,

        persona:
            intelligence?.identity
                ?.repositoryPersona ??
            report.summary?.persona,

        healthScore:
            report.summary?.healthScore,

        healthStatus:
            report.summary?.healthStatus,

        maturityScore:
            report.summary
                ?.maturityScore,

        maturityLevel:
            report.summary
                ?.maturityLevel,

        productionReadinessScore:
            report.summary
                ?.productionReadinessScore,

        productionReadinessLevel:
            report.summary
                ?.productionReadinessLevel,

        engineeringQualityScore:
            report.summary
                ?.engineeringQualityScore,

        technologies:
            intelligence?.signals
                ?.technologies ||
            report.legacy
                ?.technologies ||
            [],

        architectureDomains:
            intelligence?.signals
                ?.architectureDomains ||
            report.legacy
                ?.architectureDomains ||
            [],

        repositoryTypes:
            intelligence?.identity
                ?.repositoryTypes ||
            report.legacy
                ?.repositoryTypes ||
            [],

        enabledCapabilities:
            getEnabledCapabilities(
                intelligence?.signals
                    ?.capabilities,
            ),

        strengths:
            intelligence?.advisor
                ?.strengthReport
                ?.strengths?.map(
                    normalizeInsightText,
                ) || [],

        weaknesses:
            intelligence?.advisor
                ?.weaknessReport
                ?.weaknesses?.map(
                    normalizeInsightText,
                ) || [],

        recommendations:
            intelligence?.advisor
                ?.recommendationReport
                ?.recommendations?.map(
                    normalizeInsightText,
                ) || [],
    };
}

function unique(
    items?: string[],
) {
    return Array.from(
        new Set(items || []),
    );
}

function getSharedItems(
    left?: string[],
    right?: string[],
) {
    const rightSet =
        new Set(unique(right));

    return unique(left).filter(
        (item) =>
            rightSet.has(item),
    );
}

function getCoreMetrics(
    left: RepositoryComparisonSummary,
    right: RepositoryComparisonSummary,
): CoreMetric[] {
    return [
        {
            label:
                "Engineering Quality",
            left:
                left.engineeringQualityScore,
            right:
                right.engineeringQualityScore,
        },
        {
            label:
                "Repository Health",
            left:
                left.healthScore,
            right:
                right.healthScore,
        },
        {
            label:
                "Maturity",
            left:
                left.maturityScore,
            right:
                right.maturityScore,
        },
        {
            label:
                "Production Readiness",
            left:
                left.productionReadinessScore,
            right:
                right.productionReadinessScore,
        },
    ];
}

function getComparisonSummary(
    left: RepositoryComparisonSummary,
    right: RepositoryComparisonSummary,
) {
    const metrics =
        getCoreMetrics(
            left,
            right,
        );

    let leftLeads = 0;
    let rightLeads = 0;
    let ties = 0;
    let availableMetrics = 0;

    metrics.forEach((metric) => {
        if (
            typeof metric.left !==
            "number" ||
            typeof metric.right !==
            "number"
        ) {
            return;
        }

        availableMetrics += 1;

        if (
            metric.left ===
            metric.right
        ) {
            ties += 1;
            return;
        }

        if (
            metric.left >
            metric.right
        ) {
            leftLeads += 1;
        } else {
            rightLeads += 1;
        }
    });

    const sharedCapabilities =
        getSharedItems(
            left.enabledCapabilities,
            right.enabledCapabilities,
        );

    const identityComparison =
        left.primaryRepositoryType &&
            right.primaryRepositoryType
            ? left.primaryRepositoryType ===
                right.primaryRepositoryType
                ? `Both repositories share the canonical purpose ${formatIntelligenceLabel(
                    left.primaryRepositoryType,
                )}.`
                : `${left.name} is classified as ${formatIntelligenceLabel(
                    left.primaryRepositoryType,
                )}, while ${right.name} is classified as ${formatIntelligenceLabel(
                    right.primaryRepositoryType,
                )}.`
            : "Canonical repository-purpose comparison is partially unavailable.";

    let scoreSummary =
        "The available core engineering scores are currently balanced.";

    if (
        availableMetrics === 0
    ) {
        scoreSummary =
            "Comparable core engineering scores are not currently available for both repositories.";
    } else if (
        leftLeads > rightLeads
    ) {
        scoreSummary =
            `${left.name} leads in ${leftLeads} of ${availableMetrics} available core engineering metrics, while ${right.name} leads in ${rightLeads}.`;
    } else if (
        rightLeads > leftLeads
    ) {
        scoreSummary =
            `${right.name} leads in ${rightLeads} of ${availableMetrics} available core engineering metrics, while ${left.name} leads in ${leftLeads}.`;
    } else {
        scoreSummary =
            `The repositories are balanced across the ${availableMetrics} available core engineering metrics${ties ? `, including ${ties} tied metric${ties === 1 ? "" : "s"}` : ""}.`;
    }

    const capabilitySummary =
        sharedCapabilities.length
            ? `They share ${sharedCapabilities.length} enabled engineering ${sharedCapabilities.length ===
                1
                ? "capability"
                : "capabilities"
            }.`
            : "No enabled engineering capabilities are currently shared between both repositories.";

    return {
        identityComparison,
        scoreSummary,
        capabilitySummary,
    };
}

function RepoSelect({
    label,
    value,
    onChange,
    repositories,
}: {
    label: string;
    value: string;

    onChange: (
        value: string,
    ) => void;

    repositories: Array<{
        id: string;
        name: string;
        fullName?: string | null;
    }>;
}) {
    return (
        <div>
            <label className="text-sm font-medium">
                {label}
            </label>

            <select
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value,
                    )
                }
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
                <option value="">
                    Select repository
                </option>

                {repositories.map(
                    (repo) => (
                        <option
                            key={repo.id}
                            value={repo.id}
                        >
                            {repo.fullName ||
                                repo.name}
                        </option>
                    ),
                )}
            </select>
        </div>
    );
}

function isComparisonInsightItem(
    item: unknown,
): item is ComparisonInsightItem {
    return Boolean(
        item &&
        typeof item ===
        "object" &&
        !Array.isArray(item),
    );
}

function getInsightKey(
    item: unknown,
    index: number,
) {
    if (
        typeof item === "string"
    ) {
        return `${item}-${index}`;
    }

    if (
        isComparisonInsightItem(
            item,
        )
    ) {
        return [
            item.category,
            item.title,
            item.description,
            index,
        ]
            .filter(Boolean)
            .join("-");
    }

    return `insight-${index}`;
}

function InsightColumn({
    title,
    items,
    emptyMessage,
}: {
    title: string;
    items?: unknown[];
    emptyMessage?: string;
}) {
    const normalizedItems =
        Array.isArray(items)
            ? items
            : [];

    return (
        <div className="min-w-0 rounded-xl border border-border bg-card">
            <details>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
                    <div>
                        <h3 className="font-semibold">
                            {title}
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {normalizedItems.length
                                ? `${normalizedItems.length} ${normalizedItems.length ===
                                    1
                                    ? "item"
                                    : "items"
                                } available`
                                : "No insights available"}
                        </p>
                    </div>

                    <Badge variant="secondary">
                        {normalizedItems.length}
                    </Badge>
                </summary>

                <div className="border-t border-border p-5">
                    {normalizedItems.length ===
                        0 ? (
                        <p className="text-sm text-muted-foreground">
                            {emptyMessage ||
                                "No comparison insights available."}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {normalizedItems.map(
                                (
                                    item,
                                    index,
                                ) => {
                                    if (
                                        typeof item ===
                                        "string" ||
                                        typeof item ===
                                        "number"
                                    ) {
                                        return (
                                            <div
                                                key={getInsightKey(
                                                    item,
                                                    index,
                                                )}
                                                className="rounded-lg border border-border bg-background p-4"
                                            >
                                                <p className="text-sm leading-6 text-muted-foreground">
                                                    {String(item)}
                                                </p>
                                            </div>
                                        );
                                    }

                                    if (
                                        isComparisonInsightItem(
                                            item,
                                        )
                                    ) {
                                        return (
                                            <div
                                                key={getInsightKey(
                                                    item,
                                                    index,
                                                )}
                                                className="rounded-lg border border-border bg-background p-4"
                                            >
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {item.category ? (
                                                        <Badge variant="secondary">
                                                            {formatIntelligenceLabel(
                                                                item.category,
                                                            )}
                                                        </Badge>
                                                    ) : null}

                                                    {item.severity ? (
                                                        <Badge variant="outline">
                                                            {formatIntelligenceLabel(
                                                                item.severity,
                                                            )}
                                                        </Badge>
                                                    ) : null}
                                                </div>

                                                {item.title ? (
                                                    <p className="mt-3 font-medium">
                                                        {
                                                            item.title
                                                        }
                                                    </p>
                                                ) : null}

                                                {item.description ? (
                                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                                        {
                                                            item.description
                                                        }
                                                    </p>
                                                ) : null}

                                                {item.evidence ? (
                                                    <details className="mt-3 rounded-lg border border-border">
                                                        <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-muted-foreground">
                                                            View supporting
                                                            evidence
                                                        </summary>

                                                        <p className="break-words border-t border-border px-3 py-3 text-xs leading-5 text-muted-foreground">
                                                            {
                                                                item.evidence
                                                            }
                                                        </p>
                                                    </details>
                                                ) : null}
                                            </div>
                                        );
                                    }

                                    return null;
                                },
                            )}
                        </div>
                    )}
                </div>
            </details>
        </div>
    );
}

function ComparisonDimension({
    label,
    score,
    maximum,
}: {
    label: string;
    score: number;
    maximum: number;
}) {
    return (
        <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">
                {label}
            </p>

            <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-semibold">
                    {score}
                </span>

                <span className="text-sm text-muted-foreground">
                    / {maximum}
                </span>
            </div>
        </div>
    );
}

export function RepositoryComparisonWorkspace() {
    const {
        data: repositoriesData,
        isLoading:
        isRepositoriesLoading,
    } =
        useTrackedRepositories();

    const repositories =
        repositoriesData || [];

    const [
        leftRepoId,
        setLeftRepoId,
    ] = useState("");


    const [
        rightRepoId,
        setRightRepoId,
    ] = useState("");


    /**
 * Backend-owned structural comparison.
 *
 * Unlike the individual intelligence reports below, this endpoint
 * tells us how similar the two repositories are to each other.
 */
    const {
        data: canonicalComparison,
        isLoading: isComparisonLoading,
        isError: isComparisonError,
    } = useRepositoryComparison(
        leftRepoId,
        rightRepoId
    );

    const {
        data: leftData,
        isLoading: isLeftLoading,
    } =
        useRepositoryIntelligenceReport(
            leftRepoId,
        );

    const {
        data: rightData,
        isLoading: isRightLoading,
    } =
        useRepositoryIntelligenceReport(
            rightRepoId,
        );

    const left =
        useMemo(
            () =>
                toSummary(leftData),
            [leftData],
        );

    const right =
        useMemo(
            () =>
                toSummary(rightData),
            [rightData],
        );

    const comparisonSummary =
        useMemo(() => {
            if (!left || !right) {
                return null;
            }

            return getComparisonSummary(
                left,
                right,
            );
        }, [
            left,
            right,
        ]);

    return (
        <div className="w-full min-w-0 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <GitCompareArrows className="h-5 w-5 text-primary" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Repository Comparison
                        </h1>

                        <p className="mt-2 max-w-3xl text-muted-foreground">
                            Compare two repositories by engineering quality,
                            maturity, production readiness, repository identity,
                            capabilities, technologies, and advisor intelligence.
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
                {isRepositoriesLoading ? (
                    <Skeleton className="h-24 rounded-xl" />
                ) : (
                    <div className="grid gap-5 md:grid-cols-2">
                        <RepoSelect
                            label="Repository A"
                            value={leftRepoId}
                            onChange={
                                setLeftRepoId
                            }
                            repositories={repositories.filter(
                                (repo) =>
                                    repo.id !==
                                    rightRepoId,
                            )}
                        />

                        <RepoSelect
                            label="Repository B"
                            value={rightRepoId}
                            onChange={
                                setRightRepoId
                            }
                            repositories={repositories.filter(
                                (repo) =>
                                    repo.id !==
                                    leftRepoId,
                            )}
                        />
                    </div>
                )}
            </div>

            {(isLeftLoading ||
                isRightLoading ||
                isComparisonLoading) ? (
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-40 rounded-xl" />
                    <Skeleton className="h-40 rounded-xl" />
                </div>
            ) : null}

            {left &&
                right &&
                comparisonSummary ? (
                <>

                    {canonicalComparison ? (
                        <section className="rounded-xl border border-border bg-card p-6">
                            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="text-lg font-semibold">
                                            Engineering Similarity
                                        </h2>

                                        <Badge variant="secondary">
                                            {formatIntelligenceLabel(
                                                canonicalComparison.comparison.similarityLevel
                                            )}
                                        </Badge>
                                    </div>

                                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                        Canonical structural similarity calculated by ArcHive
                                        from repository identity, architecture domains,
                                        capabilities, and technologies.
                                    </p>
                                </div>

                                <div className="shrink-0 rounded-xl border border-border bg-background px-6 py-4 text-center">
                                    <p className="text-3xl font-bold tracking-tight">
                                        {canonicalComparison.comparison.similarityScore}%
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        similarity
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <ComparisonDimension
                                    label="Repository Identity"
                                    score={
                                        canonicalComparison.comparison.scoreBreakdown
                                            .repositoryTypeScore
                                    }
                                    maximum={25}
                                />

                                <ComparisonDimension
                                    label="Architecture Domains"
                                    score={
                                        canonicalComparison.comparison.scoreBreakdown
                                            .architectureDomainScore
                                    }
                                    maximum={25}
                                />

                                <ComparisonDimension
                                    label="Capabilities"
                                    score={
                                        canonicalComparison.comparison.scoreBreakdown
                                            .capabilityScore
                                    }
                                    maximum={30}
                                />

                                <ComparisonDimension
                                    label="Technologies"
                                    score={
                                        canonicalComparison.comparison.scoreBreakdown
                                            .technologyScore
                                    }
                                    maximum={20}
                                />
                            </div>
                        </section>
                    ) : null}

                    {isComparisonError ? (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5">
                            <p className="font-medium text-destructive">
                                Failed to load canonical repository comparison.
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Individual repository intelligence is still available below.
                            </p>
                        </div>
                    ) : null}
                    <section className="rounded-xl border border-border bg-card p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <Sparkles className="h-5 w-5 text-primary" />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-lg font-semibold">
                                    Comparison Summary
                                </h2>

                                <div className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                                    <p>
                                        {
                                            comparisonSummary.identityComparison
                                        }
                                    </p>

                                    <p>
                                        {
                                            comparisonSummary.scoreSummary
                                        }
                                    </p>

                                    <p>
                                        {
                                            comparisonSummary.capabilitySummary
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold">
                                Core Engineering Scores
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Scores are taken directly from each repository&apos;s
                                generated intelligence report.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                            <ComparisonScoreCard
                                label="Engineering Quality"
                                leftName={left.name}
                                rightName={
                                    right.name
                                }
                                leftScore={
                                    left.engineeringQualityScore
                                }
                                rightScore={
                                    right.engineeringQualityScore
                                }
                            //description="Represents ArcHive's existing engineering-quality assessment for each repository."
                            />

                            <ComparisonScoreCard
                                label="Repository Health"
                                leftName={left.name}
                                rightName={
                                    right.name
                                }
                                leftScore={
                                    left.healthScore
                                }
                                rightScore={
                                    right.healthScore
                                }
                                leftLevel={
                                    left.healthStatus
                                }
                                rightLevel={
                                    right.healthStatus
                                }
                            //description="Represents the existing repository-health assessment generated by ArcHive."
                            />

                            <ComparisonScoreCard
                                label="Maturity"
                                leftName={left.name}
                                rightName={
                                    right.name
                                }
                                leftScore={
                                    left.maturityScore
                                }
                                rightScore={
                                    right.maturityScore
                                }
                                leftLevel={
                                    left.maturityLevel
                                }
                                rightLevel={
                                    right.maturityLevel
                                }
                            //description="Represents ArcHive's existing assessment of repository engineering maturity."
                            />

                            <ComparisonScoreCard
                                label="Production Readiness"
                                leftName={left.name}
                                rightName={
                                    right.name
                                }
                                leftScore={
                                    left.productionReadinessScore
                                }
                                rightScore={
                                    right.productionReadinessScore
                                }
                                leftLevel={
                                    left.productionReadinessLevel
                                }
                                rightLevel={
                                    right.productionReadinessLevel
                                }
                            //description="Represents ArcHive's existing production-readiness assessment for each repository."
                            />
                        </div>
                    </section>

                    <details className="rounded-xl border border-border bg-card">
                        <summary className="cursor-pointer list-none p-6">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-semibold">
                                        Understand these scores
                                    </h3>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        See what each ArcHive engineering metric measures and how
                                        the score is determined.
                                    </p>
                                </div>

                                <Badge variant="outline">
                                    Scoring methodology
                                </Badge>
                            </div>
                        </summary>

                        <div className="border-t border-border p-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl border border-border bg-background p-5">
                                    <h4 className="font-semibold">
                                        Engineering Quality
                                    </h4>

                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        Measures detected engineering practices across architecture,
                                        scalability, security, testing, observability,
                                        maintainability, documentation, and DevOps.
                                    </p>

                                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                        ArcHive groups detected quality contributions by engineering
                                        area, calculates each area score, and averages the resulting
                                        area scores to produce the overall Engineering Quality score.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-border bg-background p-5">
                                    <h4 className="font-semibold">
                                        Production Readiness
                                    </h4>

                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        Production Readiness currently derives directly from the
                                        repository&apos;s Engineering Quality score.
                                    </p>

                                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                        ArcHive interprets that score as Not Ready, Partially Ready,
                                        Production Ready, or Enterprise Ready, while individual
                                        engineering areas are used to identify strengths and
                                        production blockers.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-border bg-background p-5">
                                    <h4 className="font-semibold">
                                        Maturity
                                    </h4>

                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        Measures engineering maturity across ArcHive&apos;s maturity
                                        assessments using repository quality, production readiness,
                                        technologies, architecture domains, repository types, and
                                        detected engineering signals.
                                    </p>

                                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                        The final Maturity score is the average of the individual
                                        maturity assessment scores.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-border bg-background p-5">
                                    <h4 className="font-semibold">
                                        Repository Health
                                    </h4>

                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        Combines Engineering Quality (35%), Production Readiness
                                        (25%), Maturity (25%), and inverse Technical Debt (15%).
                                    </p>

                                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                        ArcHive then applies additional penalties for detected
                                        weaknesses and technical debt before constraining the final
                                        score between 0 and 100.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 rounded-xl border border-border bg-muted/20 p-4">
                                <p className="text-sm font-medium">
                                    Why these scores can differ
                                </p>

                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    A repository can demonstrate good engineering practices while
                                    still having lower overall health. Repository Health also
                                    considers maturity, technical debt, and detected weaknesses,
                                    so it represents a broader assessment than Engineering Quality
                                    alone.
                                </p>
                            </div>
                        </div>
                    </details>

                    <section className="rounded-xl border border-border bg-card p-6">
                        <h2 className="text-lg font-semibold">
                            Repository Identity
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Canonical repository purpose and identity information
                            generated by ArcHive.
                        </p>

                        <div className="mt-6 grid gap-5 md:grid-cols-2">
                            {[left, right].map(
                                (repo) => (
                                    <div
                                        key={repo.id}
                                        className="min-w-0 rounded-xl border border-border bg-background p-5"
                                    >
                                        <h3 className="truncate font-semibold">
                                            {repo.fullName ||
                                                repo.name}
                                        </h3>

                                        {repo.primaryRepositoryType ? (
                                            <Badge className="mt-3">
                                                {formatIntelligenceLabel(
                                                    repo.primaryRepositoryType,
                                                )}
                                            </Badge>
                                        ) : null}

                                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                            {repo.persona ||
                                                "Repository persona not available yet."}
                                        </p>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {repo.repositoryTypes?.map(
                                                (type) => (
                                                    <Badge
                                                        key={type}
                                                        variant="secondary"
                                                    >
                                                        {formatIntelligenceLabel(
                                                            type,
                                                        )}
                                                    </Badge>
                                                ),
                                            )}
                                        </div>

                                        <Button
                                            asChild
                                            variant="ghost"
                                            className="mt-4 px-0"
                                        >
                                            <Link
                                                href={`/repositories/${repo.id}/intelligence`}
                                            >
                                                Open intelligence report

                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                ),
                            )}
                        </div>
                    </section>

                    <TechnologyOverlap
                        title="Capability Overlap"
                        leftName={left.name}
                        rightName={
                            right.name
                        }
                        leftItems={
                            canonicalComparison?.sourceIntelligence.capabilities ||
                            left.enabledCapabilities
                        }

                        rightItems={
                            canonicalComparison?.targetIntelligence.capabilities ||
                            right.enabledCapabilities
                        }
                        description="Enabled engineering capabilities shared by both repositories and capabilities unique to either side. These are factual set counts, not a similarity percentage."
                    />

                    <TechnologyOverlap
                        title="Architecture Domain Overlap"
                        leftName={left.name}
                        rightName={
                            right.name
                        }
                        leftItems={
                            canonicalComparison?.sourceIntelligence.domains ||
                            left.architectureDomains
                        }

                        rightItems={
                            canonicalComparison?.targetIntelligence.domains ||
                            right.architectureDomains
                        }
                        description="Architecture domains detected in both repositories and domains unique to each repository."
                    />

                    <TechnologyOverlap
                        title="Technology Overlap"
                        leftName={left.name}
                        rightName={
                            right.name
                        }
                        leftItems={
                            canonicalComparison?.sourceIntelligence.technologies ||
                            left.technologies
                        }
                        rightItems={
                            canonicalComparison?.targetIntelligence.technologies ||
                            right.technologies
                        }
                        description="Detected technologies shared between both repositories and technologies unique to each repository."
                    />

                    {canonicalComparison &&
                        (
                            canonicalComparison.comparison.keyDifferences.length > 0 ||
                            canonicalComparison.comparison.recommendations.length > 0
                        ) ? (
                        <section>
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold">
                                    Comparison Intelligence
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Differences and recommendations generated specifically
                                    from the relationship between these two repositories.
                                </p>
                            </div>

                            <div className="grid gap-5 lg:grid-cols-2">
                                <InsightColumn
                                    title="Key Differences"
                                    items={
                                        canonicalComparison.comparison.keyDifferences
                                    }
                                    emptyMessage="No significant structural differences detected."
                                />

                                <InsightColumn
                                    title="Comparison Recommendations"
                                    items={
                                        canonicalComparison.comparison.recommendations
                                    }
                                    emptyMessage="No comparison-specific recommendations available."
                                />
                            </div>
                        </section>
                    ) : null}

                    <section>
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold">
                                Engineering Insights
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Detailed strengths, weaknesses, recommendations, and
                                supporting evidence are collapsed by default so the
                                comparison conclusion remains easy to scan.
                            </p>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
                            <InsightColumn
                                title={`${left.name} Strengths`}
                                items={left.strengths}
                                emptyMessage="No strength insights are currently available."
                            />

                            <InsightColumn
                                title={`${right.name} Strengths`}
                                items={right.strengths}
                                emptyMessage="No strength insights are currently available."
                            />

                            <InsightColumn
                                title={`${left.name} Weaknesses`}
                                items={left.weaknesses}
                                emptyMessage="No weakness insights are currently available."
                            />

                            <InsightColumn
                                title={`${right.name} Weaknesses`}
                                items={right.weaknesses}
                                emptyMessage="No weakness insights are currently available."
                            />

                            <InsightColumn
                                title={`${left.name} Recommendations`}
                                items={
                                    left.recommendations
                                }
                                emptyMessage="No recommendations are currently available."
                            />

                            <InsightColumn
                                title={`${right.name} Recommendations`}
                                items={
                                    right.recommendations
                                }
                                emptyMessage="No recommendations are currently available."
                            />
                        </div>
                    </section>
                </>
            ) : null}
        </div>
    );
}
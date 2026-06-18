"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, GitCompareArrows, Sparkles } from "lucide-react";

import { ComparisonScoreCard } from "@/components/comparison/ComparisonScoreCard";
import { TechnologyOverlap } from "@/components/comparison/TechnologyOverlap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    useRepositoryIntelligenceReport,
    useTrackedRepositories,
} from "@/hooks/useRepositories";
import { formatFilterLabel } from "@/lib/filters";
import { RepositoryComparisonSummary } from "@/types/repository-comparison.types";

type IntelligenceShape = {
    repository?: {
        id?: string;
        name?: string;
        fullName?: string | null;
        language?: string | null;
    };

    summary?: {
        primaryRepositoryType?: string | null;
        persona?: string | null;
        healthScore?: number | null;
        healthStatus?: string | null;
        maturityScore?: number | null;
        maturityLevel?: string | null;
        productionReadinessScore?: number | null;
        productionReadinessLevel?: string | null;
        engineeringQualityScore?: number | null;
    };

    repositoryIntelligence?: {
        identity?: {
            repositoryTypes?: string[];
        };

        signals?: {
            technologies?: string[];
            architectureDomains?: string[];
            capabilities?: Record<string, boolean>;
        };

        advisor?: {
            strengthReport?: {
                strengths?: string[];
            };
            weaknessReport?: {
                weaknesses?: string[];
            };
            recommendationReport?: {
                recommendations?: Array<{
                    title?: string;
                    action?: string;
                    reason?: string;
                }>;
            };
        };
    };

    legacy?: {
        repositoryTypes?: string[];
        technologies?: string[];
        architectureDomains?: string[];
    };
};

function getEnabledCapabilities(capabilities?: Record<string, boolean>) {
    if (!capabilities) return [];

    return Object.entries(capabilities)
        .filter(([, enabled]) => enabled)
        .map(([name]) => name);
}

function toSummary(data?: unknown): RepositoryComparisonSummary | null {
    const report = data as IntelligenceShape | undefined;

    if (!report?.repository?.id) return null;

    const intelligence = report.repositoryIntelligence;

    return {
        id: report.repository.id,
        name: report.repository.name || "Repository",
        fullName: report.repository.fullName,
        primaryRepositoryType: report.summary?.primaryRepositoryType,
        persona: report.summary?.persona,
        healthScore: report.summary?.healthScore,
        healthStatus: report.summary?.healthStatus,
        maturityScore: report.summary?.maturityScore,
        maturityLevel: report.summary?.maturityLevel,
        productionReadinessScore: report.summary?.productionReadinessScore,
        productionReadinessLevel: report.summary?.productionReadinessLevel,
        engineeringQualityScore: report.summary?.engineeringQualityScore,
        technologies:
            intelligence?.signals?.technologies || report.legacy?.technologies || [],
        architectureDomains:
            intelligence?.signals?.architectureDomains ||
            report.legacy?.architectureDomains ||
            [],
        repositoryTypes:
            intelligence?.identity?.repositoryTypes ||
            report.legacy?.repositoryTypes ||
            [],
        enabledCapabilities: getEnabledCapabilities(
            intelligence?.signals?.capabilities
        ),
        strengths: intelligence?.advisor?.strengthReport?.strengths || [],
        weaknesses: intelligence?.advisor?.weaknessReport?.weaknesses || [],
        recommendations:
            intelligence?.advisor?.recommendationReport?.recommendations?.map(
                (item) => item.title || item.action || item.reason || "Recommendation"
            ) || [],
    };
}

function getOverallWinner(
    left: RepositoryComparisonSummary,
    right: RepositoryComparisonSummary
) {
    const leftTotal =
        (left.healthScore || 0) +
        (left.engineeringQualityScore || 0) +
        (left.maturityScore || 0) +
        (left.productionReadinessScore || 0);

    const rightTotal =
        (right.healthScore || 0) +
        (right.engineeringQualityScore || 0) +
        (right.maturityScore || 0) +
        (right.productionReadinessScore || 0);

    if (leftTotal === rightTotal) return null;

    return leftTotal > rightTotal ? left : right;
}

function RepoSelect({
    label,
    value,
    onChange,
    repositories,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    repositories: Array<{ id: string; name: string; fullName?: string | null }>;
}) {
    return (
        <div>
            <label className="text-sm font-medium">{label}</label>

            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
                <option value="">Select repository</option>

                {repositories.map((repo) => (
                    <option key={repo.id} value={repo.id}>
                        {repo.fullName || repo.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

function InsightColumn({
    title,
    items,
}: {
    title: string;
    items?: string[];
}) {
    return (
        <div className="rounded-xl border border-border bg-background p-4">
            <p className="mb-3 text-sm font-medium">{title}</p>

            <div className="space-y-2">
                {items && items.length > 0 ? (
                    items.slice(0, 5).map((item, index) => (
                        <div
                            key={`${item}-${index}`}
                            className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground"
                        >
                            {item}
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">No insights available.</p>
                )}
            </div>
        </div>
    );
}

export function RepositoryComparisonWorkspace() {
    const { data: repositoriesData, isLoading: isRepositoriesLoading } =
        useTrackedRepositories();

    const repositories = repositoriesData || [];

    const [leftRepoId, setLeftRepoId] = useState("");
    const [rightRepoId, setRightRepoId] = useState("");

    const {
        data: leftData,
        isLoading: isLeftLoading,
    } = useRepositoryIntelligenceReport(leftRepoId);

    const {
        data: rightData,
        isLoading: isRightLoading,
    } = useRepositoryIntelligenceReport(rightRepoId);

    const left = useMemo(() => toSummary(leftData), [leftData]);
    const right = useMemo(() => toSummary(rightData), [rightData]);

    const winner = left && right ? getOverallWinner(left, right) : null;

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                        <GitCompareArrows className="h-5 w-5 text-primary" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Repository Comparison
                        </h1>

                        <p className="mt-2 max-w-3xl text-muted-foreground">
                            Compare two repositories by engineering quality, maturity,
                            production readiness, repository identity, capabilities,
                            technologies, and advisor signals.
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
                            onChange={setLeftRepoId}
                            repositories={repositories.filter((repo) => repo.id !== rightRepoId)}
                        />

                        <RepoSelect
                            label="Repository B"
                            value={rightRepoId}
                            onChange={setRightRepoId}
                            repositories={repositories.filter((repo) => repo.id !== leftRepoId)}
                        />
                    </div>
                )}
            </div>

            {(isLeftLoading || isRightLoading) && (
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-40 rounded-xl" />
                    <Skeleton className="h-40 rounded-xl" />
                </div>
            )}

            {left && right && (
                <>
                    <div className="rounded-xl border border-border bg-card p-6">
                        <div className="flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-primary" />

                            <div>
                                <h2 className="text-lg font-semibold">Overall Read</h2>

                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {winner
                                        ? `${winner.fullName || winner.name} currently appears stronger overall based on combined health, engineering quality, maturity, and production readiness scores.`
                                        : "Both repositories appear balanced based on the available intelligence scores."}
                                </p>

                                {winner && (
                                    <Button asChild className="mt-4">
                                        <Link href={`/repositories/${winner.id}/intelligence`}>
                                            Open stronger repository
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        <ComparisonScoreCard
                            label="Engineering Quality"
                            leftName={left.name}
                            rightName={right.name}
                            leftScore={left.engineeringQualityScore}
                            rightScore={right.engineeringQualityScore}
                        />

                        <ComparisonScoreCard
                            label="Repository Health"
                            leftName={left.name}
                            rightName={right.name}
                            leftScore={left.healthScore}
                            rightScore={right.healthScore}
                            leftLevel={left.healthStatus}
                            rightLevel={right.healthStatus}
                        />

                        <ComparisonScoreCard
                            label="Maturity"
                            leftName={left.name}
                            rightName={right.name}
                            leftScore={left.maturityScore}
                            rightScore={right.maturityScore}
                            leftLevel={left.maturityLevel}
                            rightLevel={right.maturityLevel}
                        />

                        <ComparisonScoreCard
                            label="Production Readiness"
                            leftName={left.name}
                            rightName={right.name}
                            leftScore={left.productionReadinessScore}
                            rightScore={right.productionReadinessScore}
                            leftLevel={left.productionReadinessLevel}
                            rightLevel={right.productionReadinessLevel}
                        />
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6">
                        <h2 className="text-lg font-semibold">Repository DNA</h2>

                        <div className="mt-6 grid gap-5 md:grid-cols-2">
                            {[left, right].map((repo, index) => (
                                <div
                                    key={`${repo.id}-${index}`}
                                    className="rounded-xl border border-border bg-background p-5"
                                >
                                    <h3 className="font-semibold">
                                        {repo.fullName || repo.name}
                                    </h3>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {repo.persona || "Repository persona not available yet."}
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {repo.repositoryTypes?.slice(0, 4).map((type) => (
                                            <Badge key={type} variant="secondary">
                                                {formatFilterLabel(type)}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <TechnologyOverlap
                        title="Technology Overlap"
                        leftName={left.name}
                        rightName={right.name}
                        leftItems={left.technologies}
                        rightItems={right.technologies}
                    />

                    <TechnologyOverlap
                        title="Architecture Domain Overlap"
                        leftName={left.name}
                        rightName={right.name}
                        leftItems={left.architectureDomains}
                        rightItems={right.architectureDomains}
                    />

                    <TechnologyOverlap
                        title="Capability Overlap"
                        leftName={left.name}
                        rightName={right.name}
                        leftItems={left.enabledCapabilities}
                        rightItems={right.enabledCapabilities}
                    />

                    <div className="grid gap-6 lg:grid-cols-2">
                        <InsightColumn
                            title={`${left.name} Strengths`}
                            items={left.strengths}
                        />

                        <InsightColumn
                            title={`${right.name} Strengths`}
                            items={right.strengths}
                        />

                        <InsightColumn
                            title={`${left.name} Weaknesses`}
                            items={left.weaknesses}
                        />

                        <InsightColumn
                            title={`${right.name} Weaknesses`}
                            items={right.weaknesses}
                        />

                        <InsightColumn
                            title={`${left.name} Recommendations`}
                            items={left.recommendations}
                        />

                        <InsightColumn
                            title={`${right.name} Recommendations`}
                            items={right.recommendations}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
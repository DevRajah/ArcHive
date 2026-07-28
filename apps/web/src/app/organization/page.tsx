"use client";

import AnalysisCoverageCard from "@/components/organization/AnalysisCoverageCard";
import OverviewMetricCard from "@/components/organization/OverviewMetricCard";

import {
    Boxes,
    ShieldAlert,
    GitBranch,
    Activity,
    ShieldCheck,
    BrainCircuit,
    Layers3
} from "lucide-react";

import RepositoryRankings from "@/components/organization/RepositoryRankings";

import { RefreshCcw, Sparkles } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
    useOrganizationIntelligence,
    useReprocessRepositories,
} from "@/hooks/useOrganization";

export default function OrganizationPage() {
    const { user } = useCurrentUser();

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useOrganizationIntelligence({
        userId: user?.id ?? "",
        enabled: !!user,
    });

    const reprocessMutation = useReprocessRepositories(
        user?.id ?? ""
    );

    if (isLoading) {
        return (
            <AppShell>
                <div className="space-y-6 p-6">
                    <div className="h-8 w-72 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-[520px] animate-pulse rounded bg-muted" />

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-36 animate-pulse rounded-xl border bg-muted/30"
                            />
                        ))}
                    </div>
                </div>
            </AppShell>
        );
    }

    if (isError) {
        return (
            <AppShell>
                <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                    <h2 className="text-2xl font-bold">
                        Unable to load Organization Intelligence
                    </h2>

                    <p className="text-muted-foreground">
                        {error instanceof Error
                            ? error.message
                            : "Something went wrong."}
                    </p>

                    <Button onClick={() => refetch()}>
                        Try Again
                    </Button>
                </div>
            </AppShell>
        );
    }

    if (!data) return null;

    return (
        <AppShell>
            <div className="space-y-8 p-6">

                {/* =====================================================
            Page Header
        ====================================================== */}

                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" />

                            <h1 className="text-3xl font-bold tracking-tight">
                                Organization Intelligence
                            </h1>
                        </div>

                        <p className="max-w-3xl text-muted-foreground">
                            Portfolio-wide engineering health, architecture quality,
                            technology usage, repository rankings, engineering activity,
                            recommendations, and organization risk.
                        </p>
                    </div>

                    <div className="flex gap-3">

                        <Button
                            variant="outline"
                            onClick={() => refetch()}
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Refresh Dashboard
                        </Button>

                        <Button
                            disabled={reprocessMutation.isPending}
                            onClick={() => reprocessMutation.mutate()}
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />

                            {reprocessMutation.isPending
                                ? "Reprocessing..."
                                : "Reprocess All Repositories"}
                        </Button>

                    </div>
                </div>

                {/* =====================================================
            NEXT SECTION
        ====================================================== */}

                <AnalysisCoverageCard
                    analyzedRepositories={
                        data.overview.analyzedRepositories
                    }
                    unanalyzedRepositories={
                        data.overview.unanalyzedRepositories
                    }
                    coverage={
                        data.overview.analysisCoveragePercentage
                    }
                />

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

                    <OverviewMetricCard
                        title="Repositories"
                        value={data.overview.totalRepositories}
                        icon={<Boxes className="h-6 w-6 text-blue-500" />}
                    />

                    <OverviewMetricCard
                        title="Architecture"
                        value={data.overview.averageArchitectureScore}
                        icon={<GitBranch className="h-6 w-6 text-violet-500" />}
                    />

                    <OverviewMetricCard
                        title="Engineering Quality"
                        value={data.overview.averageEngineeringQualityScore}
                        icon={<BrainCircuit className="h-6 w-6 text-cyan-500" />}
                    />

                    <OverviewMetricCard
                        title="Production Readiness"
                        value={data.overview.averageProductionReadinessScore}
                        icon={<ShieldCheck className="h-6 w-6 text-green-500" />}
                    />

                    <OverviewMetricCard
                        title="Maturity"
                        value={data.overview.averageMaturityScore}
                        icon={<Layers3 className="h-6 w-6 text-orange-500" />}
                    />

                    <OverviewMetricCard
                        title="Average Risk"
                        value={data.overview.averageRiskScore}
                        icon={<ShieldAlert className="h-6 w-6 text-red-500" />}
                    />

                    <OverviewMetricCard
                        title="Overall Risk Level"
                        value={data.overview.overallRiskLevel}
                        icon={<Activity className="h-6 w-6 text-red-400" />}
                    />

                    <OverviewMetricCard
                        title="Healthy Repositories"
                        value={data.overview.healthyRepositories}
                        icon={<ShieldCheck className="h-6 w-6 text-emerald-500" />}
                    />

                </div>

                <RepositoryRankings
                    repositories={data.rankings}
                />

            </div>
        </AppShell>
    );
}
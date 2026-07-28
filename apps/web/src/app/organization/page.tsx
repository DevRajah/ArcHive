"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    Activity,
    Boxes,
    BrainCircuit,
    GitBranch,
    Layers3,
    RefreshCcw,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";

import AnalysisCoverageCard from "@/components/organization/AnalysisCoverageCard";
import OrganizationActivityTimeline from "@/components/organization/OrganizationActivityTimeline";
import OrganizationDashboardSkeleton from "@/components/organization/OrganizationDashboardSkeleton";
import OrganizationIntervalSelector, {
    type OrganizationInterval,
} from "@/components/organization/OrganizationIntervalSelector";
import OrganizationRecommendations from "@/components/organization/OrganizationRecommendations";
import OrganizationTrends from "@/components/organization/OrganizationTrends";
import OverviewMetricCard from "@/components/organization/OverviewMetricCard";
import RepositoryRankings from "@/components/organization/RepositoryRankings";
import RiskOverview from "@/components/organization/RiskOverview";
import TechnologyInventory from "@/components/organization/TechnologyInventory";

import { Button } from "@/components/ui/button";

import {
    useOrganizationIntelligence,
    useReprocessRepositories,
} from "@/hooks/useOrganization";
import ExecutiveSummaryHero from "@/components/organization/ExecutiveSummaryHero";
import EngineeringScoreCard from "@/components/organization/EngineeringScoreCard";
import OrganizationHighlights from "@/components/organization/OrganizationHighlights";
import SmartInsights from "@/components/organization/SmartInsights";

export default function OrganizationPage() {
    const [interval, setInterval] =
        useState<OrganizationInterval>("MONTH");

    const [userId, setUserId] =
        useState("");

    const [
        hasLoadedStoredUser,
        setHasLoadedStoredUser,
    ] = useState(false);

    const [
        reprocessMessage,
        setReprocessMessage,
    ] = useState<string | null>(null);

    const [
        reprocessMessageType,
        setReprocessMessageType,
    ] = useState<"success" | "error">(
        "success",
    );

    /*
     * Read the logged-in user's ID after the browser loads.
     *
     * We do this inside useEffect because localStorage does not
     * exist while Next.js is rendering on the server.
     */
    useEffect(() => {
        const storedUserId =
            window.localStorage.getItem(
                "userId",
            );

        if (storedUserId) {
            setUserId(storedUserId);
        }

        setHasLoadedStoredUser(true);
    }, []);

    /*
     * Success and error messages should disappear after
     * five seconds so they do not remain stuck on the page.
     */
    useEffect(() => {
        if (!reprocessMessage) {
            return;
        }

        const timeoutId =
            window.setTimeout(() => {
                setReprocessMessage(null);
            }, 5000);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [reprocessMessage]);

    /*
     * The hook accepts:
     *
     * {
     *   userId,
     *   query: {
     *     interval
     *   },
     *   enabled
     * }
     *
     * Interval must therefore be placed inside query.
     */
    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useOrganizationIntelligence({
        userId,

        query: {
            interval,
        },

        enabled: hasLoadedStoredUser && !!userId,
    });

    /*
     * Pass the same query into the reprocess hook.
     *
     * This ensures the correct Organization Intelligence
     * query is invalidated after reprocessing succeeds.
     */
    const reprocessMutation =
        useReprocessRepositories(userId, {
            interval,
        });

    const handleReprocessRepositories =
        () => {
            setReprocessMessage(null);

            reprocessMutation.mutate(
                undefined,
                {
                    onSuccess: async (
                        response,
                    ) => {
                        const processedCount =
                            "processedRepositories" in
                                response &&
                                typeof response.processedRepositories ===
                                "number"
                                ? response.processedRepositories
                                : null;

                        setReprocessMessageType(
                            "success",
                        );

                        setReprocessMessage(
                            processedCount !== null
                                ? `${processedCount} repositories were queued for reprocessing successfully.`
                                : "Repository reprocessing started successfully.",
                        );

                        /*
                         * The mutation hook already invalidates the query.
                         * Refetching here gives the page an immediate refresh.
                         */
                        await refetch();
                    },

                    onError: (
                        mutationError,
                    ) => {
                        setReprocessMessageType(
                            "error",
                        );

                        setReprocessMessage(
                            mutationError instanceof
                                Error
                                ? mutationError.message
                                : "Failed to reprocess repositories.",
                        );
                    },
                },
            );
        };

    /*
     * Wait until localStorage has been checked before deciding
     * whether the page can request organization data.
     */
    if (
        !hasLoadedStoredUser ||
        (userId && isLoading)
    ) {
        return (
            <AppShell>
                <div className="p-6">
                    <OrganizationDashboardSkeleton />
                </div>
            </AppShell>
        );
    }

    /*
     * This normally means the user reached the page without
     * completing the GitHub connection or login flow.
     */
    if (!userId) {
        return (
            <AppShell>
                <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                        <ShieldAlert className="h-7 w-7 text-muted-foreground" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">
                            User session not found
                        </h2>

                        <p className="max-w-md text-muted-foreground">
                            Connect your GitHub account
                            again so ArcHive can load
                            your Organization
                            Intelligence dashboard.
                        </p>
                    </div>
                </div>
            </AppShell>
        );
    }

    if (isError) {
        return (
            <AppShell>
                <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                        <ShieldAlert className="h-7 w-7 text-destructive" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">
                            Unable to load
                            Organization Intelligence
                        </h2>

                        <p className="max-w-lg text-muted-foreground">
                            {error instanceof Error
                                ? error.message
                                : "Something went wrong while loading the organization dashboard."}
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => refetch()}
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                </div>
            </AppShell>
        );
    }

    if (!data) {
        return (
            <AppShell>
                <div className="flex min-h-[60vh] items-center justify-center p-6">
                    <p className="text-muted-foreground">
                        No organization intelligence
                        data is currently available.
                    </p>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="space-y-8 p-6">
                {/* =====================================================
            Page header
        ====================================================== */}

                <header className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" />

                            <h1 className="text-3xl font-bold tracking-tight">
                                Organization
                                Intelligence
                            </h1>
                        </div>

                        <p className="max-w-3xl text-muted-foreground">
                            Portfolio-wide engineering
                            health, architecture quality,
                            technology usage, repository
                            rankings, engineering activity,
                            recommendations, and
                            organization risk.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <OrganizationIntervalSelector
                            value={interval}
                            onChange={setInterval}
                            disabled={
                                isFetching ||
                                reprocessMutation.isPending
                            }
                        />

                        <Button
                            type="button"
                            variant="outline"
                            disabled={
                                isFetching ||
                                reprocessMutation.isPending
                            }
                            onClick={() => refetch()}
                        >
                            <RefreshCcw
                                className={`mr-2 h-4 w-4 ${isFetching
                                    ? "animate-spin"
                                    : ""
                                    }`}
                            />

                            {isFetching
                                ? "Refreshing..."
                                : "Refresh Dashboard"}
                        </Button>

                        <Button
                            type="button"
                            disabled={
                                reprocessMutation.isPending ||
                                isFetching
                            }
                            onClick={
                                handleReprocessRepositories
                            }
                        >
                            <RefreshCcw
                                className={`mr-2 h-4 w-4 ${reprocessMutation.isPending
                                    ? "animate-spin"
                                    : ""
                                    }`}
                            />

                            {reprocessMutation.isPending
                                ? "Reprocessing..."
                                : "Reprocess All Repositories"}
                        </Button>
                    </div>
                </header>

                {/* =====================================================
            Reprocess status message
        ====================================================== */}

                {reprocessMessage ? (
                    <div
                        role="status"
                        className={`rounded-lg border px-4 py-3 text-sm ${reprocessMessageType ===
                            "success"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-destructive/30 bg-destructive/10 text-destructive"
                            }`}
                    >
                        {reprocessMessage}
                    </div>
                ) : null}


                <ExecutiveSummaryHero
                    overview={data.overview}
                />

                <EngineeringScoreCard
                    architecture={data.overview.averageArchitectureScore}
                    engineering={data.overview.averageEngineeringQualityScore}
                    production={data.overview.averageProductionReadinessScore}
                    maturity={data.overview.averageMaturityScore}
                    risk={data.overview.averageRiskScore}
                />

                <OrganizationHighlights
                    repositories={data.rankings}
                />

                <SmartInsights
                    overview={data.overview}
                />

                {/* =====================================================
            Analysis coverage
        ====================================================== */}

                <AnalysisCoverageCard
                    analyzedRepositories={
                        data.overview
                            .analyzedRepositories
                    }
                    unanalyzedRepositories={
                        data.overview
                            .unanalyzedRepositories
                    }
                    coverage={
                        data.overview
                            .analysisCoveragePercentage
                    }
                />

                {/* =====================================================
            Organization summary metrics
        ====================================================== */}

                <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <OverviewMetricCard
                        title="Repositories"
                        value={
                            data.overview
                                .totalRepositories
                        }
                        description="Tracked repositories across the connected portfolio."
                        icon={
                            <Boxes className="h-6 w-6 text-blue-500" />
                        }
                    />

                    <OverviewMetricCard
                        title="Architecture"
                        value={
                            data.overview
                                .averageArchitectureScore
                        }
                        description="Average architecture quality across analysed repositories."
                        icon={
                            <GitBranch className="h-6 w-6 text-violet-500" />
                        }
                    />

                    <OverviewMetricCard
                        title="Engineering Quality"
                        value={
                            data.overview
                                .averageEngineeringQualityScore
                        }
                        description="Average maintainability and engineering practice score."
                        icon={
                            <BrainCircuit className="h-6 w-6 text-cyan-500" />
                        }
                    />

                    <OverviewMetricCard
                        title="Production Readiness"
                        value={
                            data.overview
                                .averageProductionReadinessScore
                        }
                        description="Operational and deployment readiness across repositories."
                        icon={
                            <ShieldCheck className="h-6 w-6 text-green-500" />
                        }
                    />

                    <OverviewMetricCard
                        title="Maturity"
                        value={
                            data.overview
                                .averageMaturityScore
                        }
                        description="Average repository maturity across the engineering portfolio."
                        icon={
                            <Layers3 className="h-6 w-6 text-orange-500" />
                        }
                    />

                    <OverviewMetricCard
                        title="Average Risk"
                        value={
                            data.overview
                                .averageRiskScore
                        }
                        description="Average engineering risk across analysed repositories."
                        icon={
                            <ShieldAlert className="h-6 w-6 text-red-500" />
                        }
                    />

                    <OverviewMetricCard
                        title="Overall Risk Level"
                        value={
                            data.overview
                                .overallRiskLevel
                        }
                        description="Portfolio-wide risk classification based on repository analysis."
                        icon={
                            <Activity className="h-6 w-6 text-red-400" />
                        }
                    />

                    <OverviewMetricCard
                        title="Healthy Repositories"
                        value={
                            data.overview
                                .healthyRepositories
                        }
                        description="Repositories currently meeting ArcHive health thresholds."
                        icon={
                            <ShieldCheck className="h-6 w-6 text-emerald-500" />
                        }
                    />
                </section>

                {/* =====================================================
            Repository rankings
        ====================================================== */}

                <RepositoryRankings
                    repositories={
                        data.rankings
                    }
                />

                {/* =====================================================
            Organization trends
        ====================================================== */}

                <OrganizationTrends
                    points={
                        data.trends.points
                    }
                />

                {/* =====================================================
            Technology and risk
        ====================================================== */}

                <section className="grid gap-6 2xl:grid-cols-2">
                    <TechnologyInventory
                        technology={
                            data.technology
                        }
                    />

                    <RiskOverview
                        risks={data.risks}
                    />
                </section>

                {/* =====================================================
            Recommendations
        ====================================================== */}

                <OrganizationRecommendations
                    recommendations={
                        data.recommendations
                    }
                />

                {/* =====================================================
            Recent engineering activity
        ====================================================== */}

                <OrganizationActivityTimeline
                    activity={
                        data.activity
                    }
                />
            </div>
        </AppShell>
    );
}
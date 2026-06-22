"use client";

import { AppShell } from "@/components/layout/AppShell";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { RepositoryHealthChart } from "@/components/dashboard/RepositoryHealthChart";
import { QueueHealthPanel } from "@/components/dashboard/QueueHealthPanel";
import { RecentQueueJobs } from "@/components/dashboard/RecentQueueJobs";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { LiveActivityIndicator } from "@/components/dashboard/LiveActivityIndicator";
import { IntelligenceOverview } from "@/components/dashboard/IntelligenceOverview";
import { IntelligenceSearch } from "@/components/dashboard/IntelligenceSearch";
import { useIntelligenceOverview } from "@/hooks/useRepositories";
import { DashboardIntelligenceActions } from "@/components/dashboard/DashboardIntelligenceActions";
import { PortfolioHealthOverview } from "@/components/dashboard/PortfolioHealthOverview";
import { RepositoryRanking } from "@/components/dashboard/RepositoryRanking";
import { TechnologyAdoption } from "@/components/dashboard/TechnologyAdoption";
import { EngineeringTrendCard } from "@/components/dashboard/EngineeringTrendCard";

type PortfolioRepository = {
  repositoryId?: string;
  id?: string;
  name?: string;
  healthScore?: number;
  detectedTechnologies?: string[];
};

export default function DashboardPage() {
  const { data: summary, isLoading, isError, error } = useDashboardSummary();

  const {
    data: intelligenceOverview,
    isLoading: isIntelligenceOverviewLoading,
  } = useIntelligenceOverview();

  const portfolioRepositories =
    (summary?.repositoryIntelligence || []) as PortfolioRepository[];

  const averageHealthScore = Math.round(
    portfolioRepositories.reduce(
      (total, repo) => total + (repo.healthScore || 0),
      0
    ) / (portfolioRepositories.length || 1)
  );

  const portfolioSummary = {
    repositoriesAnalyzed: portfolioRepositories.length,
    overallEngineeringScore: averageHealthScore,
    averageHealthScore,
    averageMaturityScore: 0,
    averageQualityScore: 0,
  };

  const portfolioTechnologies = Array.from(
    new Set(
      portfolioRepositories.flatMap((repo) => repo.detectedTechnologies || [])
    )
  );

  const portfolioRankingRepositories = portfolioRepositories.map((repo) => ({
    id: repo.repositoryId || repo.id || repo.name || "unknown-repository",
    name: repo.name || "Unknown repository",
    engineeringScore: repo.healthScore || 0,
  }));

  const portfolioTopRepository =
    portfolioRepositories
      .slice()
      .sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0))[0]?.name ||
    "N/A";

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Engineering Dashboard
          </h1>

          <p className="mt-2 text-muted-foreground">
            Monitor repository intelligence, architecture evolution, queue
            processing, and engineering activity across your tracked systems.
          </p>

          <div className="mt-4">
            <LiveActivityIndicator />
          </div>
        </div>

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-36 rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
            <p className="font-medium text-destructive">
              Failed to load dashboard summary
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Please check backend connection."}
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <PortfolioHealthOverview summary={portfolioSummary} />

            <div className="grid gap-6 xl:grid-cols-2">
              <RepositoryRanking repositories={portfolioRankingRepositories} />

              <TechnologyAdoption technologies={portfolioTechnologies} />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <EngineeringTrendCard
                title="Top Repository"
                value={portfolioTopRepository}
              />

              <EngineeringTrendCard title="Most Mature" value="Pending" />

              <EngineeringTrendCard
                title="Fastest Improving"
                value="Pending"
              />
            </div>

            <DashboardStats summary={summary} />
          </>
        )}

        <DashboardIntelligenceActions />

        <IntelligenceOverview
          data={intelligenceOverview}
          isLoading={isIntelligenceOverviewLoading}
        />

        <IntelligenceSearch />

        <div className="grid min-w-0 gap-6 xl:grid-cols-[1.4fr_1fr]">
          <RepositoryHealthChart
            repositories={summary?.repositoryIntelligence}
          />

          <RecentActivity events={summary?.recentEngineeringEvents} />
        </div>

        <div className="grid min-w-0 gap-6 xl:grid-cols-[1fr_1fr]">
          <QueueHealthPanel />
          <RecentQueueJobs />
        </div>
      </div>
    </AppShell>
  );
}
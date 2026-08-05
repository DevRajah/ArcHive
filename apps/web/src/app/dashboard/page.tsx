"use client";

import { AppShell } from "@/components/layout/AppShell";

import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QueueHealthPanel } from "@/components/dashboard/QueueHealthPanel";
import { RecentQueueJobs } from "@/components/dashboard/RecentQueueJobs";
import { LiveActivityIndicator } from "@/components/dashboard/LiveActivityIndicator";
import { IntelligenceOverview } from "@/components/dashboard/IntelligenceOverview";
import { IntelligenceSearch } from "@/components/dashboard/IntelligenceSearch";
import { DashboardIntelligenceActions } from "@/components/dashboard/DashboardIntelligenceActions";
import { RepositoryActivity } from "@/components/dashboard/RepositoryActivity";

import { Skeleton } from "@/components/ui/skeleton";

import { useDashboardSummary } from "@/hooks/useDashboard";
import { useIntelligenceOverview } from "@/hooks/useRepositories";

export default function DashboardPage() {
  const {
    data: summary,
    isLoading,
    isError,
    error,
  } = useDashboardSummary();

  const {
    data: intelligenceOverview,
    isLoading: isIntelligenceOverviewLoading,
  } = useIntelligenceOverview();

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">
            Engineering Dashboard
          </h1>

          <p className="mt-2 text-muted-foreground">
            Monitor repository activity, architecture evolution, queue
            processing, and engineering intelligence across your tracked
            systems.
          </p>

          <div className="mt-4">
            <LiveActivityIndicator />
          </div>
        </header>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-36 rounded-xl"
              />
            ))}
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
            <p className="font-medium text-destructive">
              Failed to load dashboard summary
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Please check the backend connection."}
            </p>
          </div>
        ) : null}

        {!isLoading && !isError && summary ? (
          <>
            <DashboardStats summary={summary} />

            <RepositoryActivity
              repositories={
                summary.repositoryIntelligence ?? []
              }
            />
          </>
        ) : null}

        <DashboardIntelligenceActions />

        <IntelligenceOverview
          data={intelligenceOverview}
          isLoading={isIntelligenceOverviewLoading}
        />

        <IntelligenceSearch />

        <RecentActivity
          events={
            summary?.recentEngineeringEvents ?? []
          }
        />

        <div className="grid min-w-0 gap-6 xl:grid-cols-2">
          <QueueHealthPanel />

          <RecentQueueJobs />
        </div>
      </div>
    </AppShell>
  );
}
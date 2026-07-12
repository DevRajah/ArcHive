"use client";

import {
  Activity,
  BarChart3,
  Database,
  FileText,
  GitBranch,
  History,
  Layers3,
  ListTodo,
  RefreshCcw,
  Server,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { AdminEventProcessingPanel } from "@/components/admin/AdminEventProcessingPanel";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminQueryError } from "@/components/admin/AdminQueryError";
import { AdminQuickLink } from "@/components/admin/AdminQuickLink";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStateCard } from "@/components/admin/AdminStateCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useAdminDashboard } from "@/hooks/useAdmin";

function formatUpdatedAt(value: number) {
  if (!value) return "Not updated yet";

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AdminDashboardPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    dataUpdatedAt,
  } = useAdminDashboard();

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminPageHeader
          title="Admin Operations Dashboard"
          description="Operational overview of ArcHive users, repositories, engineering intelligence, event processing, and system activity."
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCcw
                className={`mr-2 h-4 w-4 ${
                  isRefetching ? "animate-spin" : ""
                }`}
              />

              {isRefetching ? "Refreshing..." : "Refresh Dashboard"}
            </Button>
          }
        />

        {!isLoading && (
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Last updated:{" "}
              <span className="font-medium text-foreground">
                {formatUpdatedAt(dataUpdatedAt)}
              </span>
              . The dashboard automatically refreshes every 30 seconds.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 11 }).map((_, index) => (
              <Skeleton key={index} className="h-36 rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <AdminQueryError
            error={error}
            title="Failed to load admin dashboard"
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && !data && (
          <AdminStateCard
            title="Dashboard information unavailable"
            description="ArcHive did not return any administration dashboard information."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && data && (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <AdminStatCard
                label="Total Users"
                value={data.totalUsers}
                description="Registered ArcHive accounts."
                icon={Users}
              />

              <AdminStatCard
                label="Total Repositories"
                value={data.totalRepositories}
                description="Repositories currently stored by ArcHive."
                icon={Database}
              />

              <AdminStatCard
                label="Tracked Repositories"
                value={data.trackedRepositories}
                description="Repositories actively monitored by ArcHive."
                icon={GitBranch}
              />

              <AdminStatCard
                label="Engineering Reports"
                value={data.engineeringReports}
                description="Generated repository intelligence reports."
                icon={FileText}
              />

              <AdminStatCard
                label="Architecture Changes"
                value={data.architectureChanges}
                description="Detected architecture-level changes."
                icon={Layers3}
              />

              <AdminStatCard
                label="Timeline Entries"
                value={data.timelineEntries}
                description="Recorded repository evolution entries."
                icon={History}
              />

              <AdminStatCard
                label="Recommendations"
                value={data.engineeringRecommendations}
                description="Generated engineering recommendations."
                icon={Activity}
              />

              <AdminStatCard
                label="Imported Today"
                value={data.repositoriesImportedToday}
                description="Repositories imported during the current day."
                icon={Database}
              />

              <AdminStatCard
                label="Reprocessed Today"
                value={data.repositoriesReprocessedToday}
                description="Repositories reanalysed during the current day."
                icon={RefreshCcw}
              />
            </div>

            <AdminEventProcessingPanel
              completed={data.eventProcessing?.completed}
              failed={data.eventProcessing?.failed}
            />

            <div className="rounded-xl border border-border bg-card p-6">
              <div>
                <h2 className="text-lg font-semibold">
                  Administration Areas
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Open a platform operations area directly.
                </p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <AdminQuickLink
                  title="Users"
                  description="Inspect registered accounts and repository ownership."
                  href="/admin/users"
                  icon={Users}
                />

                <AdminQuickLink
                  title="Repositories"
                  description="Manage imported repositories and regenerate intelligence."
                  href="/admin/repositories"
                  icon={Database}
                />

                <AdminQuickLink
                  title="Activity"
                  description="Review administrative actions and platform events."
                  href="/admin/activity"
                  icon={Activity}
                />

                <AdminQuickLink
                  title="Analytics"
                  description="Explore platform-wide engineering distributions."
                  href="/admin/analytics"
                  icon={BarChart3}
                />

                <AdminQuickLink
                  title="Queue"
                  description="Monitor workers, failures, waiting jobs, and processing."
                  href="/admin/queue"
                  icon={ListTodo}
                />

                <AdminQuickLink
                  title="System"
                  description="Inspect API, database, runtime, uptime, and memory."
                  href="/admin/system"
                  icon={Server}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
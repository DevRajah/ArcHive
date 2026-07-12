"use client";

import {
  Cpu,
  Database,
  HardDrive,
  RefreshCcw,
  Server,
  Timer,
  Workflow,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminQueryError } from "@/components/admin/AdminQueryError";
import { AdminStateCard } from "@/components/admin/AdminStateCard";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSystem } from "@/hooks/useAdmin";

function bytesToMB(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0 MB";
  }

  return `${Math.round(value / 1024 / 1024).toLocaleString()} MB`;
}

function formatUptime(seconds?: number) {
  if (typeof seconds !== "number" || seconds <= 0) {
    return "0s";
  }

  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export default function AdminSystemPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useAdminSystem();

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminPageHeader
          title="System Health"
          description="Operational status for the ArcHive API, database, runtime environment, uptime, and memory usage."
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

              {isRefetching ? "Refreshing..." : "Refresh System"}
            </Button>
          }
        />

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <AdminQueryError
            error={error}
            title="Failed to load system health"
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && !data && (
          <AdminStateCard
            title="System information unavailable"
            description="ArcHive did not return any runtime health information."
          />
        )}

        {!isLoading && !isError && data && (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <AdminStatCard
                label="API Status"
                value={data.apiStatus}
                description="Current ArcHive API availability."
                icon={Server}
              />

              <AdminStatCard
                label="Database"
                value={data.database}
                description="Current database connectivity status."
                icon={Database}
              />

              <AdminStatCard
                label="Environment"
                value={data.environment}
                description="Current backend runtime environment."
                icon={Workflow}
              />

              <AdminStatCard
                label="Node Version"
                value={data.nodeVersion}
                description="Node.js runtime used by the API."
                icon={Cpu}
              />

              <AdminStatCard
                label="Uptime"
                value={formatUptime(data.uptime)}
                description="Time since the API process started."
                icon={Timer}
              />

              <AdminStatCard
                label="Memory RSS"
                value={bytesToMB(data.memoryUsage?.rss)}
                description="Total resident memory used by the process."
                icon={HardDrive}
              />

              <AdminStatCard
                label="Heap Used"
                value={bytesToMB(data.memoryUsage?.heapUsed)}
                description="JavaScript heap currently in use."
                icon={HardDrive}
              />

              <AdminStatCard
                label="Heap Total"
                value={bytesToMB(data.memoryUsage?.heapTotal)}
                description="Total allocated JavaScript heap."
                icon={HardDrive}
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Queue information refreshes every 10 seconds. System health
                refreshes every 30 seconds while this page is open.
              </p>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
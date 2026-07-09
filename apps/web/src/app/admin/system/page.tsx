"use client";

import { Cpu, Database, HardDrive, Server, Timer, Workflow } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStateCard } from "@/components/admin/AdminStateCard";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSystem } from "@/hooks/useAdmin";

function bytesToMB(value?: number) {
  if (!value) return "0 MB";
  return `${Math.round(value / 1024 / 1024)} MB`;
}

function formatUptime(seconds?: number) {
  if (!seconds) return "0s";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function AdminSystemPage() {
  const { data, isLoading, isError, error, refetch } = useAdminSystem();

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminPageHeader
          title="System Health"
          description="Operational status for the ArcHive API, database, runtime environment, uptime, and memory usage."
        />

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <AdminStateCard
            title="Failed to load system health"
            description={
              error instanceof Error
                ? error.message
                : "Please check backend connection."
            }
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && data && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <AdminStatCard label="API Status" value={data.apiStatus} icon={Server} />
            <AdminStatCard label="Database" value={data.database} icon={Database} />
            <AdminStatCard label="Environment" value={data.environment} icon={Workflow} />
            <AdminStatCard label="Node Version" value={data.nodeVersion} icon={Cpu} />
            <AdminStatCard label="Uptime" value={formatUptime(data.uptime)} icon={Timer} />
            <AdminStatCard label="Memory RSS" value={bytesToMB(data.memoryUsage?.rss)} icon={HardDrive} />
            <AdminStatCard label="Heap Used" value={bytesToMB(data.memoryUsage?.heapUsed)} icon={HardDrive} />
            <AdminStatCard label="Heap Total" value={bytesToMB(data.memoryUsage?.heapTotal)} icon={HardDrive} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
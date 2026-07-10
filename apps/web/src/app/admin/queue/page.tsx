"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  PauseCircle,
  TimerReset,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminQueueCard } from "@/components/admin/AdminQueueCard";
import { AdminStateCard } from "@/components/admin/AdminStateCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminQueue } from "@/hooks/useAdmin";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { isAdminForbidden } from "@/lib/admin-errors";

function formatDate(value?: string | null) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleString();
}

export default function AdminQueuePage() {
  const { data, isLoading, isError, error, refetch } = useAdminQueue();

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminPageHeader
          title="Queue Operations"
          description="Monitor background jobs, failed processing, delayed work, and repository intelligence queue health."
        />

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))}
          </div>
        )}

        {isError && isAdminForbidden(error) && <AdminAccessRequired />}

        {isError && !isAdminForbidden(error) && (
          <AdminStateCard
            title="Failed to load queue health"
            description={
              error instanceof Error
                ? error.message
                : "Please check backend connection."
            }
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && data && (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <AdminQueueCard label="Waiting" value={data.waiting} icon={Clock} />
              <AdminQueueCard label="Active" value={data.active} icon={Loader2} />
              <AdminQueueCard label="Completed" value={data.completed} icon={CheckCircle2} />
              <AdminQueueCard label="Failed" value={data.failed} icon={AlertTriangle} />
              <AdminQueueCard label="Delayed" value={data.delayed} icon={TimerReset} />
              <AdminQueueCard label="Paused" value={data.paused} icon={PauseCircle} />
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Recent Failed Jobs</h2>

              {!data.recentFailedJobs || data.recentFailedJobs.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  No recent failed jobs.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {data.recentFailedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-xl border border-border bg-background p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="destructive">Failed</Badge>
                        {job.name && (
                          <Badge variant="outline">{job.name}</Badge>
                        )}
                      </div>

                      <p className="mt-3 text-sm text-muted-foreground">
                        {job.failedReason || "No failure reason available."}
                      </p>

                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDate(job.timestamp || job.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
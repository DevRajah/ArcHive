"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  PauseCircle,
  RefreshCcw,
  TimerReset,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminQueryError } from "@/components/admin/AdminQueryError";
import { AdminQueueCard } from "@/components/admin/AdminQueueCard";
import { AdminStateCard } from "@/components/admin/AdminStateCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminQueue } from "@/hooks/useAdmin";

function formatDate(value?: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString();
}

export default function AdminQueuePage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useAdminQueue();

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminPageHeader
          title="Queue Operations"
          description="Monitor background jobs, failed processing, delayed work, and repository intelligence queue health."
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

              {isRefetching ? "Refreshing..." : "Refresh Queue"}
            </Button>
          }
        />

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <AdminQueryError
            error={error}
            title="Failed to load queue health"
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && !data && (
          <AdminStateCard
            title="Queue data unavailable"
            description="ArcHive did not return any queue health information."
          />
        )}

        {!isLoading && !isError && data && (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <AdminQueueCard
                label="Waiting"
                value={data.waiting}
                icon={Clock}
              />

              <AdminQueueCard
                label="Active"
                value={data.active}
                icon={Loader2}
              />

              <AdminQueueCard
                label="Completed"
                value={data.completed}
                icon={CheckCircle2}
              />

              <AdminQueueCard
                label="Failed"
                value={data.failed}
                icon={AlertTriangle}
              />

              <AdminQueueCard
                label="Delayed"
                value={data.delayed}
                icon={TimerReset}
              />

              <AdminQueueCard
                label="Paused"
                value={data.paused}
                icon={PauseCircle}
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-semibold">Recent Failed Jobs</h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Most recent background jobs that could not be processed.
                  </p>
                </div>

                <Badge variant="destructive">
                  {data.recentFailedJobs?.length ?? 0} recent failures
                </Badge>
              </div>

              {!data.recentFailedJobs ||
              data.recentFailedJobs.length === 0 ? (
                <div className="mt-5 rounded-xl border border-border bg-background p-8 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />

                  <p className="mt-3 font-medium">No recent failed jobs</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Background processing is currently healthy.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {data.recentFailedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-xl border border-border bg-background p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="destructive">Failed</Badge>

                        {job.status && (
                          <Badge variant="secondary">{job.status}</Badge>
                        )}

                        {job.name && (
                          <Badge variant="outline">{job.name}</Badge>
                        )}
                      </div>

                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
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
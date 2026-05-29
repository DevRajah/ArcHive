"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentQueueJobs } from "@/hooks/useQueue";

function formatJobTime(jobTime?: number | string) {
  if (!jobTime) return "Unknown time";

  const date =
    typeof jobTime === "number" ? new Date(jobTime) : new Date(jobTime);

  if (Number.isNaN(date.getTime())) return "Unknown time";

  return date.toLocaleString();
}

function getJobStatus(job: { status?: string; failedReason?: string | null }) {
  if (job.status) return job.status;
  if (job.failedReason) return "failed";
  return "processed";
}

export function RecentQueueJobs() {
  const { data: jobs, isLoading, isError, error } = useRecentQueueJobs();

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Recent Queue Jobs</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Latest background jobs processed by ArcHive workers.
        </p>
      </div>

      {isLoading && (
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-16 rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">
            Failed to load recent jobs
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Please check backend queue jobs endpoint."}
          </p>
        </div>
      )}

      {!isLoading && !isError && jobs?.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          No recent jobs found.
        </p>
      )}

      {!isLoading && !isError && jobs && jobs.length > 0 && (
        <div className="mt-6 space-y-4">
          {jobs.slice(0, 5).map((job) => {
            const status = getJobStatus(job);

            return (
              <div
                key={job.id}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{job.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Queue: {job.queueName || "repository-intelligence"}
                    </p>
                  </div>

                  <Badge variant={status === "failed" ? "destructive" : "secondary"}>
                    {status}
                  </Badge>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  {formatJobTime(job.finishedOn || job.processedOn || job.createdAt)}
                </p>

                {job.failedReason && (
                  <p className="mt-2 text-xs text-destructive">
                    {job.failedReason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
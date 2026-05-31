"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentQueueJobs } from "@/hooks/useQueue";
import { QueueRecentJob } from "@/types/queue.types";

function formatJobTime(job: QueueRecentJob) {
  const jobTime = job.finishedOn || job.processedOn || job.timestamp;

  if (!jobTime) return "Unknown time";

  const date = new Date(jobTime);

  if (Number.isNaN(date.getTime())) return "Unknown time";

  return date.toLocaleString();
}

function formatStatus(status?: string) {
  if (!status) return "Unknown";

  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getQueueName(job: QueueRecentJob) {
  return (
    job.queueName ||
    job.data?.queueName ||
    job.name ||
    "Unknown queue job"
  );
}

function getBadgeVariant(status?: string) {
  const normalized = status?.toLowerCase();

  if (normalized === "failed") return "destructive";
  if (normalized === "active") return "default";
  if (normalized === "waiting" || normalized === "delayed") return "secondary";

  return "secondary";
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
          {jobs.slice(0, 5).map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-border bg-background p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div>
                    <p className="text-sm font-medium">
                      {job.data?.eventTitle || "Engineering Event Processed"}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {job.data?.repositoryFullName || "Unknown Repository"}
                    </p>
                  </div>
                </div>

                <Badge variant={getBadgeVariant(job.status)}>
                  {formatStatus(job.status)}
                </Badge>
              </div>

              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p>
                  Processed: {formatJobTime(job)}
                </p>

                {job.attemptsMade !== undefined && (
                  <p>
                    Attempts: {job.attemptsMade}
                  </p>
                )}

                <p>
                  Queue: {getQueueName(job)}
                </p>
              </div>

              {job.failedReason && (
                <p className="mt-2 text-xs text-destructive">
                  {job.failedReason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
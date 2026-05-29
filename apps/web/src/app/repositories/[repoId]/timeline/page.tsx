"use client";

import { useParams } from "next/navigation";
import { GitBranch } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepositoryTimeline } from "@/hooks/useTimeline";

export default function TimelinePage() {
  const params = useParams<{ repoId: string }>();

  const repoId = params.repoId;

  const {
    data: timelineEntries,
    isLoading,
    isError,
    error,
  } = useRepositoryTimeline(repoId);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Engineering Timeline
          </h1>

          <p className="mt-2 text-muted-foreground">
            Historical engineering memory and repository evolution.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-32 rounded-xl" />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
            <p className="font-medium text-destructive">
              Failed to load engineering timeline
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Please check backend connection."}
            </p>
          </div>
        )}

        {/* Empty */}
        {!isLoading &&
          !isError &&
          timelineEntries &&
          timelineEntries.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <h2 className="text-xl font-semibold">
                No timeline entries found
              </h2>

              <p className="mt-2 text-muted-foreground">
                ArcHive has not generated engineering timeline memory for this
                repository yet.
              </p>
            </div>
          )}

        {/* Timeline */}
        {!isLoading &&
          !isError &&
          timelineEntries &&
          timelineEntries.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="space-y-6">
                {timelineEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex gap-4 border-b border-border pb-6 last:border-0"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <GitBranch className="h-4 w-4 text-primary" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 className="font-semibold">
                          {entry.title}
                        </h2>

                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {entry.summary ||
                          "No engineering summary available."}
                      </p>

                      {entry.eventType && (
                        <div className="mt-3 inline-flex rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                          {entry.eventType}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </AppShell>
  );
}
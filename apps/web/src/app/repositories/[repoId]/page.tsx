"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepositoryOverview } from "@/hooks/useRepositoryOverview";

export default function RepositoryDetailPage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params.repoId;

  const { data, isLoading, isError, error } = useRepositoryOverview(repoId);

  return (
    <AppShell>
      <div className="space-y-6">
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-24 rounded-xl" />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
            <p className="font-medium text-destructive">
              Failed to load repository overview
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Please check backend."}
            </p>
          </div>
        )}

        {!isLoading && !isError && data && (
          <>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {data.repository?.fullName || data.repository?.name || repoId}
                  </h1>
                  <Badge>TRACKED</Badge>
                </div>

                <p className="text-muted-foreground">
                  {data.repository?.description ||
                    "Repository intelligence overview and engineering activity."}
                </p>
              </div>

              <div className="flex gap-3">
                <Button asChild variant="outline">
                  <Link href={`/repositories/${repoId}/timeline`}>Timeline</Link>
                </Button>

                <Button asChild>
                  <Link href={`/repositories/${repoId}/architecture`}>
                    Architecture
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">Events Processed</p>
                <h2 className="mt-3 text-3xl font-bold">
                  {data.metrics?.totalEvents ?? 0}
                </h2>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">Timeline Entries</p>
                <h2 className="mt-3 text-3xl font-bold">
                  {data.metrics?.totalTimelineEntries ?? 0}
                </h2>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">
                  Architecture Changes
                </p>
                <h2 className="mt-3 text-3xl font-bold">
                  {data.metrics?.totalArchitectureChanges ?? 0}
                </h2>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Recent Timeline Entries</h2>

              <div className="mt-5 space-y-4">
                {data.recentTimelineEntries?.length ? (
                  data.recentTimelineEntries.map((entry) => (
                    <div key={entry.id} className="border-b border-border pb-4 last:border-0">
                      <p className="font-medium">{entry.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {entry.summary || "No summary available."}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No timeline entries yet.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Activity,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Network,
  Webhook,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ActivityFilters } from "@/components/filters/ActivityFilters";
import { RepositoryLiveStatus } from "@/components/repositories/RepositoryLiveStatus";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepositoryTimeline } from "@/hooks/useTimeline";
import { useRepositoryLiveStatus } from "@/hooks/useRepositoryLiveStatus";
import { matchesSearch, formatFilterLabel } from "@/lib/filters";

function formatEventType(eventType?: string) {
  if (!eventType || eventType === "UNKNOWN") return "Engineering Event";

  return formatFilterLabel(eventType);
}

function getTimelineEntryType(entry: {
  eventType?: string;
  type?: string;
  category?: string;
}) {
  return entry.eventType || entry.type || entry.category || "ENGINEERING_EVENT";
}

function getEventIcon(eventType?: string) {
  if (!eventType || eventType === "UNKNOWN") return Activity;
  if (eventType.includes("WEBHOOK")) return Webhook;
  if (eventType.includes("PULL") || eventType.includes("PR")) {
    return GitPullRequest;
  }
  if (eventType.includes("COMMIT")) return GitCommit;

  if (
    eventType.includes("ARCHITECTURE") ||
    eventType.includes("QUEUE") ||
    eventType.includes("REDIS") ||
    eventType.includes("API")
  ) {
    return Network;
  }

  return GitBranch;
}

export default function TimelinePage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params.repoId;

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");

  const liveStatus = useRepositoryLiveStatus(repoId);

  const {
    data: timelineEntries,
    isLoading,
    isError,
    error,
  } = useRepositoryTimeline(repoId);

  const timelineTypes = useMemo(() => {
    if (!timelineEntries) return [];

    return Array.from(
      new Set(
        timelineEntries
          .map((entry) => getTimelineEntryType(entry))
          .filter(Boolean)
      )
    );
  }, [timelineEntries]);

  const filteredEntries = useMemo(() => {
    if (!timelineEntries) return [];

    const query = search.trim();

    return timelineEntries.filter((entry) => {
      const matchesType =
        selectedType === "ALL" || getTimelineEntryType(entry) === selectedType;

      const matchesQuery =
        !query ||
        matchesSearch(entry.title, query) ||
        matchesSearch(entry.summary, query) ||
        matchesSearch(entry.eventType, query) ||
        matchesSearch(entry.source, query);

      return matchesType && matchesQuery;
    });
  }, [timelineEntries, search, selectedType]);

  return (
    <AppShell>
      <div className="space-y-6">
        <Button asChild variant="ghost" className="px-0">
          <Link href={`/repositories/${repoId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to repository overview
          </Link>
        </Button>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Engineering Timeline
              </h1>

              <p className="mt-2 max-w-3xl text-muted-foreground">
                Chronological engineering memory showing how this repository
                has evolved through commits, webhooks, architecture changes, and
                background processing.
              </p>

              <div className="mt-4">
                <RepositoryLiveStatus
                  isConnected={liveStatus.isConnected}
                  lastUpdatedAt={liveStatus.lastUpdatedAt}
                />
              </div>
            </div>

            <Badge variant="secondary">
              {timelineEntries?.length || 0} entries
            </Badge>
          </div>
        </div>

        {!isLoading && !isError && timelineEntries && timelineEntries.length > 0 && (
          <ActivityFilters
            search={search}
            onSearchChange={setSearch}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            types={timelineTypes}
          />
        )}

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-32 rounded-xl" />
            ))}
          </div>
        )}

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

        {!isLoading &&
          !isError &&
          timelineEntries &&
          timelineEntries.length > 0 &&
          filteredEntries.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <h2 className="text-xl font-semibold">
                No matching engineering activity
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your filters or search query.
              </p>
            </div>
          )}

        {!isLoading &&
          !isError &&
          timelineEntries &&
          timelineEntries.length > 0 &&
          filteredEntries.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="relative space-y-8">
                <div className="absolute left-5 top-2 h-[calc(100%-1rem)] w-px bg-border" />

                {filteredEntries.map((entry) => {
                  const Icon = getEventIcon(getTimelineEntryType(entry));

                  return (
                    <div key={entry.id} className="relative flex gap-5">
                      <div className="z-10 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>

                      <div className="flex-1 rounded-xl border border-border bg-background p-5">
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                          <div>
                            <h2 className="font-semibold">
                              {entry.title || formatEventType(getTimelineEntryType(entry))}
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {entry.summary ||
                                "No engineering summary available."}
                            </p>
                          </div>

                          <Badge variant="secondary">
                            {formatEventType(getTimelineEntryType(entry))}
                          </Badge>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {entry.source && <span>Source: {entry.source}</span>}

                          <span>
                            {new Date(entry.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </div>
    </AppShell>
  );
}
"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  RotateCcw,
  Search,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { RepositoryIntelligenceNav } from "@/components/repositories/RepositoryIntelligenceNav";
import { RepositoryLiveStatus } from "@/components/repositories/RepositoryLiveStatus";
import { TimelineEventCard } from "@/components/timeline/TimelineEventCard";
import { TimelineSummaryCards } from "@/components/timeline/TimelineSummaryCards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useRefreshRepositoryTimeline,
  useRepositoryTimeline,
} from "@/hooks/useTimeline";
import { useRepositoryLiveStatus } from "@/hooks/useRepositoryLiveStatus";
import {
  TimelineEventType,
  TimelineSeverity,
  TimelineSortOrder,
} from "@/types/timeline.types";

const EVENT_TYPES: Array<{
  label: string;
  value: "ALL" | TimelineEventType;
}> = [
  {
    label: "All event types",
    value: "ALL",
  },
  {
    label: "Engineering Events",
    value: "ENGINEERING_EVENT",
  },
  {
    label: "Architecture Changes",
    value: "ARCHITECTURE_CHANGE",
  },
  {
    label: "Intelligence Snapshots",
    value: "INTELLIGENCE_SNAPSHOT",
  },
  {
    label: "Architecture Advisor",
    value: "ARCHITECTURE_ADVISOR",
  },
  {
    label: "Health Trends",
    value: "HEALTH_TREND",
  },
];

const SEVERITIES: Array<{
  label: string;
  value: "ALL" | TimelineSeverity;
}> = [
  {
    label: "All severities",
    value: "ALL",
  },
  {
    label: "Low",
    value: "LOW",
  },
  {
    label: "Medium",
    value: "MEDIUM",
  },
  {
    label: "High",
    value: "HIGH",
  },
  {
    label: "Critical",
    value: "CRITICAL",
  },
];

/**
 * Timeline requests use 25 items per page because that is also the
 * backend's recommended default.
 */
const PAGE_LIMIT = 25;

export default function TimelinePage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params.repoId;

  /**
   * inputSearch is what the user is currently typing.
   *
   * search is the value actually sent to the backend.
   *
   * Separating them lets us debounce the search so we do not send a new
   * API request after every single keystroke.
   */
  const [inputSearch, setInputSearch] = useState("");
  const [search, setSearch] = useState("");

  const [selectedType, setSelectedType] = useState<
    "ALL" | TimelineEventType
  >("ALL");

  const [selectedSeverity, setSelectedSeverity] = useState<
    "ALL" | TimelineSeverity
  >("ALL");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [sortOrder, setSortOrder] =
    useState<TimelineSortOrder>("desc");

  const [page, setPage] = useState(1);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const liveStatus = useRepositoryLiveStatus(repoId);

  /**
   * Wait for the user to stop typing before searching.
   *
   * This reduces unnecessary backend requests.
   */
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(inputSearch.trim());
      setPage(1);
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [inputSearch]);

  /**
   * Success and error feedback automatically disappears after 5 seconds.
   */
  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setFeedback(null);
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [feedback]);

  const timelineQuery = useMemo(
    () => ({
      page,
      limit: PAGE_LIMIT,

      type:
        selectedType === "ALL"
          ? undefined
          : selectedType,

      severity:
        selectedSeverity === "ALL"
          ? undefined
          : selectedSeverity,

      from: fromDate || undefined,
      to: toDate || undefined,

      search: search || undefined,

      sort: "timestamp" as const,
      order: sortOrder,
    }),
    [
      page,
      selectedType,
      selectedSeverity,
      fromDate,
      toDate,
      search,
      sortOrder,
    ],
  );

  const {
    data: timelineData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useRepositoryTimeline(repoId, timelineQuery);

  const refreshTimeline =
    useRefreshRepositoryTimeline(repoId);

  const timelineEvents = timelineData?.timeline ?? [];
  const summary = timelineData?.summary;
  const repository = timelineData?.repository;
  const pagination = timelineData?.pagination;

  const hasActiveFilters =
    inputSearch.trim() !== "" ||
    selectedType !== "ALL" ||
    selectedSeverity !== "ALL" ||
    fromDate !== "" ||
    toDate !== "" ||
    sortOrder !== "desc";

  function updateType(value: string) {
    setSelectedType(value as "ALL" | TimelineEventType);
    setPage(1);
  }

  function updateSeverity(value: string) {
    setSelectedSeverity(
      value as "ALL" | TimelineSeverity,
    );
    setPage(1);
  }

  function updateFromDate(value: string) {
    setFromDate(value);
    setPage(1);
  }

  function updateToDate(value: string) {
    setToDate(value);
    setPage(1);
  }

  function updateSortOrder(value: string) {
    setSortOrder(value as TimelineSortOrder);
    setPage(1);
  }

  function clearFilters() {
    setInputSearch("");
    setSearch("");
    setSelectedType("ALL");
    setSelectedSeverity("ALL");
    setFromDate("");
    setToDate("");
    setSortOrder("desc");
    setPage(1);
  }

  async function handleRefreshTimeline() {
    setFeedback(null);

    try {
      const result = await refreshTimeline.mutateAsync();

      setFeedback({
        type: "success",
        message:
          result?.message ||
          "Repository timeline rebuilt successfully.",
      });
    } catch (refreshError) {
      setFeedback({
        type: "error",
        message:
          refreshError instanceof Error
            ? refreshError.message
            : "Failed to rebuild repository timeline.",
      });
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <Button asChild variant="ghost" className="px-0">
          <Link href={`/repositories/${repoId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to repository overview
          </Link>
        </Button>

        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  Repository Timeline
                </h1>

                {repository?.fullName && (
                  <Badge variant="secondary">
                    {repository.fullName}
                  </Badge>
                )}
              </div>

              <p className="mt-2 max-w-3xl text-muted-foreground">
                A chronological engineering memory showing repository
                activity, architecture changes, intelligence snapshots,
                advisor findings, and health movements.
              </p>

              <div className="mt-4">
                <RepositoryLiveStatus
                  isConnected={liveStatus.isConnected}
                  lastUpdatedAt={
                    timelineData?.generatedAt ||
                    liveStatus.lastUpdatedAt
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">
                {pagination?.totalItems ??
                  summary?.totalEvents ??
                  0}{" "}
                events
              </Badge>

              <Button
                type="button"
                variant="outline"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    isFetching ? "animate-spin" : ""
                  }`}
                />
                Reload
              </Button>

              <Button
                type="button"
                onClick={handleRefreshTimeline}
                disabled={refreshTimeline.isPending}
              >
                <RotateCcw
                  className={`mr-2 h-4 w-4 ${
                    refreshTimeline.isPending
                      ? "animate-spin"
                      : ""
                  }`}
                />
                {refreshTimeline.isPending
                  ? "Rebuilding..."
                  : "Refresh Timeline"}
              </Button>
            </div>
          </div>
        </section>

        <RepositoryIntelligenceNav repositoryId={repoId} />

        {feedback && (
          <div
            className={
              feedback.type === "success"
                ? "rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400"
                : "rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
            }
          >
            {feedback.message}
          </div>
        )}

        {isLoading && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <Skeleton
                  key={item}
                  className="h-32 rounded-xl"
                />
              ))}
            </div>

            <Skeleton className="h-40 rounded-xl" />

            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <Skeleton
                  key={item}
                  className="h-40 rounded-xl"
                />
              ))}
            </div>
          </>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
            <p className="font-medium text-destructive">
              Failed to load repository timeline
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Please check the backend connection and try again."}
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => refetch()}
            >
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !isError && summary && (
          <TimelineSummaryCards summary={summary} />
        )}

        {!isLoading && !isError && (
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={inputSearch}
                    onChange={(event) =>
                      setInputSearch(event.target.value)
                    }
                    placeholder="Search timeline titles and descriptions..."
                    className="pl-9"
                  />
                </div>

                <select
                  value={selectedType}
                  onChange={(event) =>
                    updateType(event.target.value)
                  }
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {EVENT_TYPES.map((eventType) => (
                    <option
                      key={eventType.value}
                      value={eventType.value}
                    >
                      {eventType.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSeverity}
                  onChange={(event) =>
                    updateSeverity(event.target.value)
                  }
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {SEVERITIES.map((severity) => (
                    <option
                      key={severity.value}
                      value={severity.value}
                    >
                      {severity.label}
                    </option>
                  ))}
                </select>

                <select
                  value={sortOrder}
                  onChange={(event) =>
                    updateSortOrder(event.target.value)
                  }
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="desc">
                    Newest first
                  </option>

                  <option value="asc">
                    Oldest first
                  </option>
                </select>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <label className="flex-1">
                  <span className="mb-2 block text-xs font-medium text-muted-foreground">
                    From date
                  </span>

                  <Input
                    type="date"
                    value={fromDate}
                    max={toDate || undefined}
                    onChange={(event) =>
                      updateFromDate(event.target.value)
                    }
                  />
                </label>

                <label className="flex-1">
                  <span className="mb-2 block text-xs font-medium text-muted-foreground">
                    To date
                  </span>

                  <Input
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    onChange={(event) =>
                      updateToDate(event.target.value)
                    }
                  />
                </label>

                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          </section>
        )}

        {!isLoading &&
          !isError &&
          timelineEvents.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <h2 className="text-xl font-semibold">
                {hasActiveFilters
                  ? "No matching timeline events"
                  : "No timeline events found"}
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {hasActiveFilters
                  ? "Try changing or clearing the current timeline filters."
                  : "ArcHive has not recorded timeline evidence for this repository yet."}
              </p>

              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-5"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}

        {!isLoading &&
          !isError &&
          timelineEvents.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    Engineering activity
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Showing {timelineEvents.length} event
                    {timelineEvents.length === 1 ? "" : "s"} on
                    this page.
                  </p>
                </div>

                {isFetching && !isLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Updating timeline
                  </div>
                )}
              </div>

              <div className="relative space-y-7">
                <div className="absolute bottom-2 left-5 top-2 w-px bg-border" />

                {timelineEvents.map((event) => (
                  <TimelineEventCard
                    key={event.id}
                    event={event}
                    repositoryId={repoId}
                  />
                ))}
              </div>
            </section>
          )}

        {!isLoading &&
          !isError &&
          pagination &&
          pagination.totalPages > 1 && (
            <section className="flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of{" "}
                {pagination.totalPages}
                {" · "}
                {pagination.totalItems.toLocaleString()} total
                events
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    !pagination.hasPreviousPage ||
                    isFetching
                  }
                  onClick={() => {
                    setPage((currentPage) =>
                      Math.max(1, currentPage - 1),
                    );

                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    !pagination.hasNextPage ||
                    isFetching
                  }
                  onClick={() => {
                    setPage((currentPage) =>
                      currentPage + 1,
                    );

                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </section>
          )}
      </div>
    </AppShell>
  );
}
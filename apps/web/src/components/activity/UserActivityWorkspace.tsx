"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  GitBranch,
  History,
  Layers3,
  Lightbulb,
  RefreshCcw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { usePortfolioTimeline } from "@/hooks/usePortfolioTimeline";
import { getUserId } from "@/lib/auth";
import { formatIntelligenceLabel } from "@/lib/intelligence-labels";

import type {
  PortfolioTimelineActivity,
  PortfolioTimelineRepository,
} from "@/types/portfolio.types";

const PAGE_SIZE = 20;

interface UserActivityWorkspaceProps {
  title?: string;
  description?: string;
}

function formatMetadataValue(value: unknown) {
  if (typeof value !== "string") {
    return String(value);
  }

  // Backend enum-style values use uppercase snake case.
  // Humanize those without touching filenames, sentences, URLs,
  // timestamps, or other ordinary metadata.
  if (/^[A-Z0-9]+(?:_[A-Z0-9]+)+$/.test(value)) {
    return formatIntelligenceLabel(value);
  }

  return value;
}

function formatDate(value?: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString();
}

function getActivityIcon(type: string): LucideIcon {
  switch (type) {
    case "ENGINEERING_EVENT":
      return GitBranch;

    case "ARCHITECTURE_CHANGE":
      return Layers3;

    case "RECOMMENDATION":
      return Lightbulb;

    case "TIMELINE":
      return History;

    default:
      return Activity;
  }
}

function getMetadataEntries(
  metadata?: Record<string, unknown> | null
) {
  if (!metadata) return [];

  return Object.entries(metadata)
    .filter(([, value]) => {
      return (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      );
    })
    .slice(0, 6);
}

export function UserActivityWorkspace({
  title = "Engineering Activity",
  description = "A chronological view of engineering events, timeline entries, architecture changes, and recommendations across your repositories.",
}: UserActivityWorkspaceProps) {
  const userId = getUserId();

  const [page, setPage] = useState(1);
  const [repositoryId, setRepositoryId] = useState("");
  const [activityType, setActivityType] = useState("");

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = usePortfolioTimeline(userId, {
    page,
    limit: PAGE_SIZE,
    repositoryId,
    activityType,
  });

  const activity = useMemo(() => {
    return [...(data?.activity ?? [])].sort((first, second) => {
      return (
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime()
      );
    });
  }, [data?.activity]);

  const repositories: PortfolioTimelineRepository[] =
    data?.filters?.repositories ?? [];

  const activityTypes =
    data?.filters?.activityTypes?.length
      ? data.filters.activityTypes
      : [
        "TIMELINE",
        "ENGINEERING_EVENT",
        "ARCHITECTURE_CHANGE",
        "RECOMMENDATION",
      ];

  function handleRepositoryChange(value: string) {
    setRepositoryId(value);
    setPage(1);
  }

  function handleActivityTypeChange(value: string) {
    setActivityType(value);
    setPage(1);
  }

  function clearFilters() {
    setRepositoryId("");
    setActivityType("");
    setPage(1);
  }

  const hasActiveFilters = Boolean(repositoryId || activityType);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {title}
            </h1>

            <p className="mt-2 max-w-3xl text-muted-foreground">
              {description}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCcw
              className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""
                }`}
            />

            {isFetching ? "Refreshing..." : "Refresh Activity"}
          </Button>
        </div>
      </div>

      {!isLoading && data && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            label="Total Activity"
            value={data.totals?.all}
            icon={Activity}
          />

          <SummaryCard
            label="Timeline Entries"
            value={data.totals?.TIMELINE}
            icon={History}
          />

          <SummaryCard
            label="Engineering Events"
            value={data.totals?.ENGINEERING_EVENT}
            icon={GitBranch}
          />

          <SummaryCard
            label="Architecture Changes"
            value={data.totals?.ARCHITECTURE_CHANGE}
            icon={Layers3}
          />

          <SummaryCard
            label="Recommendations"
            value={data.totals?.RECOMMENDATION}
            icon={Lightbulb}
          />
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <select
            value={repositoryId}
            onChange={(event) =>
              handleRepositoryChange(event.target.value)
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All repositories</option>

            {repositories.map((repository) => (
              <option
                key={repository.id}
                value={repository.id}
              >
                {repository.fullName ||
                  repository.name ||
                  repository.id}
              </option>
            ))}
          </select>

          <select
            value={activityType}
            onChange={(event) =>
              handleActivityTypeChange(event.target.value)
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All activity types</option>

            {activityTypes.map((type) => (
              <option key={type} value={type}>
                {formatIntelligenceLabel(type)}
              </option>
            ))}
          </select>

          <Button
            type="button"
            variant="outline"
            disabled={!hasActiveFilters}
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </div>

        {isFetching && !isLoading && (
          <p className="mt-3 text-xs text-muted-foreground">
            Updating engineering activity...
          </p>
        )}
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-40 rounded-xl"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
          <p className="font-medium text-destructive">
            Failed to load engineering activity
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Please check the backend connection."}
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-5"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && activity.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <Activity className="mx-auto h-9 w-9 text-muted-foreground" />

          <h2 className="mt-4 text-xl font-semibold">
            No engineering activity found
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {hasActiveFilters
              ? "No activity matches the selected repository and activity type."
              : "ArcHive has not recorded portfolio activity yet."}
          </p>
        </div>
      )}

      {!isLoading && !isError && activity.length > 0 && (
        <div className="space-y-4">
          {activity.map((item, index) => (
            <TimelineItem
              key={`${item.id}-${item.type}-${index}`}
              item={item}
            />
          ))}
        </div>
      )}

      {!isLoading &&
        !isError &&
        data &&
        (data.pagination?.totalPages ?? 0) > 1 && (
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
            <p className="text-sm text-muted-foreground">
              Page {data.pagination?.page ?? page} of{" "}
              {data.pagination?.totalPages ?? 1}
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={page <= 1 || isFetching}
                onClick={() =>
                  setPage((currentPage) =>
                    Math.max(1, currentPage - 1)
                  )
                }
              >
                Previous
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={
                  page >=
                  (data.pagination?.totalPages ?? 1) ||
                  isFetching
                }
                onClick={() =>
                  setPage((currentPage) => currentPage + 1)
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: number | null;
  icon: LucideIcon;
}) {
  const safeValue =
    typeof value === "number" && Number.isFinite(value)
      ? value
      : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold">
            {safeValue.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  item,
}: {
  item: PortfolioTimelineActivity;
}) {
  const Icon = getActivityIcon(item.type);
  const metadataEntries = getMetadataEntries(item.metadata);

  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {formatIntelligenceLabel(item.type)}
            </Badge>

            {item.action && (
              <Badge variant="outline">
                {formatIntelligenceLabel(item.action)}
              </Badge>
            )}
          </div>

          <h2 className="mt-3 text-lg font-semibold">
            {item.title ||
              (item.action
                ? formatIntelligenceLabel(item.action)
                : "Engineering Activity")}
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {item.description || "No description available."}
          </p>

          {item.repository && (
            <p className="mt-3 text-sm text-muted-foreground">
              Repository:{" "}
              <Link
                href={`/repositories/${item.repository.id}/intelligence`}
                className="font-medium text-primary hover:underline"
              >
                {item.repository.fullName ||
                  item.repository.name ||
                  item.repository.id}
              </Link>
            </p>
          )}

          {metadataEntries.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {metadataEntries.map(([key, value]) => (
                <Badge
                  key={`${item.id}-${key}`}
                  variant="outline"
                >
                  {formatIntelligenceLabel(key)}:{" "}
                  {formatMetadataValue(value)}
                </Badge>
              ))}
            </div>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            {formatDate(item.createdAt)}
          </p>
        </div>
      </div>
    </article>
  );
}
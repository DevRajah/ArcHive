"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  Activity,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  History,
  RotateCcw,
  Search,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import OrganizationEmptyState from "@/components/organization/OrganizationEmptyState";

import type {
  OrganizationActivityResponse,
} from "@/types/organization.types";

interface OrganizationActivityTimelineProps {
  activity: OrganizationActivityResponse;
}

type ActivitySort =
  | "NEWEST"
  | "OLDEST"
  | "REPOSITORY_ASC"
  | "REPOSITORY_DESC";

const PAGE_SIZE = 5;

function getActivityIcon(type: string) {
  switch (type) {
    case "ARCHITECTURE_CHANGE":
      return GitBranch;

    case "ENGINEERING_EVENT":
      return Activity;

    default:
      return History;
  }
}

function getActivityBadgeVariant(
  type: string,
):
  | "default"
  | "secondary"
  | "outline"
  | "destructive" {
  switch (type) {
    case "ARCHITECTURE_CHANGE":
      return "default";

    case "ENGINEERING_EVENT":
      return "secondary";

    default:
      return "outline";
  }
}

function formatActivityType(type: string) {
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function parseTimestamp(
  value: string | Date,
) {
  const parsedDate = new Date(value);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return null;
  }

  return parsedDate;
}

function formatTimestamp(
  value: string | Date,
) {
  const parsedDate =
    parseTimestamp(value);

  if (!parsedDate) {
    return "Unknown date";
  }

  return parsedDate.toLocaleString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

function formatRelativeTimestamp(
  value: string | Date,
) {
  const parsedDate =
    parseTimestamp(value);

  if (!parsedDate) {
    return "Unknown time";
  }

  const difference =
    Date.now() -
    parsedDate.getTime();

  const seconds = Math.floor(
    difference / 1000,
  );

  if (seconds < 0) {
    return formatTimestamp(value);
  }

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(
    seconds / 60,
  );

  if (minutes < 60) {
    return `${minutes} minute${
      minutes === 1 ? "" : "s"
    } ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours} hour${
      hours === 1 ? "" : "s"
    } ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days < 7) {
    return `${days} day${
      days === 1 ? "" : "s"
    } ago`;
  }

  return formatTimestamp(value);
}

function getDateGroupLabel(
  value: string | Date,
) {
  const parsedDate =
    parseTimestamp(value);

  if (!parsedDate) {
    return "Unknown date";
  }

  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const activityDate = new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate(),
  );

  const differenceInDays =
    Math.round(
      (today.getTime() -
        activityDate.getTime()) /
        86_400_000,
    );

  if (differenceInDays === 0) {
    return "Today";
  }

  if (differenceInDays === 1) {
    return "Yesterday";
  }

  if (
    differenceInDays > 1 &&
    differenceInDays < 7
  ) {
    return parsedDate.toLocaleDateString(
      "en-GB",
      {
        weekday: "long",
      },
    );
  }

  return parsedDate.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );
}

export default function OrganizationActivityTimeline({
  activity,
}: OrganizationActivityTimelineProps) {
  const [page, setPage] =
    useState(1);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    activeRepository,
    setActiveRepository,
  ] = useState("ALL");

  const [activeType, setActiveType] =
    useState("ALL");

  const [sortBy, setSortBy] =
    useState<ActivitySort>("NEWEST");

  const repositories = useMemo(() => {
    return Array.from(
      new Set(
        activity.items
          .map(
            (item) =>
              item.repositoryName,
          )
          .filter(
            (repositoryName) =>
              repositoryName
                .trim()
                .length > 0,
          ),
      ),
    ).sort((first, second) =>
      first.localeCompare(second),
    );
  }, [activity.items]);

  const activityTypes = useMemo(() => {
    return Array.from(
      new Set(
        activity.items
          .map((item) => item.type)
          .filter(
            (type) =>
              type.trim().length > 0,
          ),
      ),
    ).sort((first, second) =>
      formatActivityType(
        first,
      ).localeCompare(
        formatActivityType(second),
      ),
    );
  }, [activity.items]);

  const typeCounts = useMemo(() => {
    return activity.items.reduce(
      (result, item) => {
        result[item.type] =
          (result[item.type] ?? 0) +
          1;

        return result;
      },
      {} as Record<string, number>,
    );
  }, [activity.items]);

  const repositoryCount =
    repositories.length;

  const architectureChangeCount =
    typeCounts.ARCHITECTURE_CHANGE ??
    0;

  const engineeringEventCount =
    typeCounts.ENGINEERING_EVENT ??
    0;

  const filteredItems = useMemo(() => {
    const normalizedSearch =
      searchTerm
        .trim()
        .toLowerCase();

    const filtered =
      activity.items.filter(
        (item) => {
          const matchesRepository =
            activeRepository ===
              "ALL" ||
            item.repositoryName ===
              activeRepository;

          const matchesType =
            activeType === "ALL" ||
            item.type === activeType;

          const searchableContent = [
            item.title,
            item.description,
            item.repositoryName,
            item.type,
          ]
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            normalizedSearch.length ===
              0 ||
            searchableContent.includes(
              normalizedSearch,
            );

          return (
            matchesRepository &&
            matchesType &&
            matchesSearch
          );
        },
      );

    return [...filtered].sort(
      (first, second) => {
        const firstTimestamp =
          parseTimestamp(
            first.timestamp,
          )?.getTime() ?? 0;

        const secondTimestamp =
          parseTimestamp(
            second.timestamp,
          )?.getTime() ?? 0;

        switch (sortBy) {
          case "OLDEST":
            return (
              firstTimestamp -
              secondTimestamp
            );

          case "REPOSITORY_ASC":
            return first.repositoryName.localeCompare(
              second.repositoryName,
            );

          case "REPOSITORY_DESC":
            return second.repositoryName.localeCompare(
              first.repositoryName,
            );

          case "NEWEST":
          default:
            return (
              secondTimestamp -
              firstTimestamp
            );
        }
      },
    );
  }, [
    activeRepository,
    activeType,
    activity.items,
    searchTerm,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredItems.length /
        PAGE_SIZE,
    ),
  );

  useEffect(() => {
    setPage(1);
  }, [
    activeRepository,
    activeType,
    searchTerm,
    sortBy,
  ]);

  useEffect(() => {
    setPage((currentPage) =>
      Math.min(
        currentPage,
        totalPages,
      ),
    );
  }, [totalPages]);

  const visibleItems =
    useMemo(() => {
      const startIndex =
        (page - 1) * PAGE_SIZE;

      return filteredItems.slice(
        startIndex,
        startIndex + PAGE_SIZE,
      );
    }, [filteredItems, page]);

  const groupedVisibleItems =
    useMemo(() => {
      return visibleItems.reduce(
        (result, item) => {
          const group =
            getDateGroupLabel(
              item.timestamp,
            );

          if (!result[group]) {
            result[group] = [];
          }

          result[group].push(item);

          return result;
        },
        {} as Record<
          string,
          typeof visibleItems
        >,
      );
    }, [visibleItems]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    activeRepository !== "ALL" ||
    activeType !== "ALL";

  function clearFilters() {
    setSearchTerm("");
    setActiveRepository("ALL");
    setActiveType("ALL");
  }

  if (!activity.items.length) {
    return (
      <OrganizationEmptyState
        icon={History}
        title="No recent engineering activity"
        description="Repository events and architecture changes will appear here after ArcHive processes new engineering activity."
      />
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />

              Recent Engineering Activity
            </CardTitle>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Track engineering events and
              architecture changes across
              connected repositories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {filteredItems.length} shown
            </Badge>

            <Badge variant="outline">
              {activity.items.length} total
            </Badge>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>

              <span className="text-2xl font-bold">
                {engineeringEventCount}
              </span>
            </div>

            <p className="mt-3 text-sm font-medium">
              Engineering events
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Repository activity detected
              across connected projects.
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <GitBranch className="h-5 w-5 text-primary" />
              </div>

              <span className="text-2xl font-bold">
                {
                  architectureChangeCount
                }
              </span>
            </div>

            <p className="mt-3 text-sm font-medium">
              Architecture changes
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Structural changes detected
              across repository histories.
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>

              <span className="text-2xl font-bold">
                {repositoryCount}
              </span>
            </div>

            <p className="mt-3 text-sm font-medium">
              Active repositories
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Repositories represented in
              the current activity feed.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
              placeholder="Search activity, repositories, or event types..."
              className="pl-9"
            />
          </div>

          <select
            value={activeRepository}
            onChange={(event) =>
              setActiveRepository(
                event.target.value,
              )
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">
              All repositories
            </option>

            {repositories.map(
              (repositoryName) => (
                <option
                  key={repositoryName}
                  value={repositoryName}
                >
                  {repositoryName}
                </option>
              ),
            )}
          </select>

          <select
            value={activeType}
            onChange={(event) =>
              setActiveType(
                event.target.value,
              )
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">
              All event types
            </option>

            {activityTypes.map(
              (type) => (
                <option
                  key={type}
                  value={type}
                >
                  {formatActivityType(
                    type,
                  )}
                </option>
              ),
            )}
          </select>

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                event.target
                  .value as ActivitySort,
              )
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          >
            <option value="NEWEST">
              Newest first
            </option>

            <option value="OLDEST">
              Oldest first
            </option>

            <option value="REPOSITORY_ASC">
              Repository A to Z
            </option>

            <option value="REPOSITORY_DESC">
              Repository Z to A
            </option>
          </select>

          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Clear
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!filteredItems.length ? (
          <OrganizationEmptyState
            icon={Search}
            title="No matching engineering activity"
            description="Try changing the search term, repository filter, or event type."
          />
        ) : (
          <div className="space-y-8">
            {Object.entries(
              groupedVisibleItems,
            ).map(
              ([group, items]) => (
                <section
                  key={group}
                  className="space-y-4"
                >
                  <div className="sticky top-0 z-10 flex items-center gap-3 bg-background py-2">
                    <Badge variant="secondary">
                      {group}
                    </Badge>

                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="relative">
                    <div className="absolute bottom-6 left-5 top-6 w-px bg-border" />

                    <div className="space-y-0">
                      {items.map(
                        (item) => {
                          const Icon =
                            getActivityIcon(
                              item.type,
                            );

                          return (
                            <div
                              key={item.id}
                              className="relative flex gap-4 pb-7 last:pb-0"
                            >
                              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm">
                                <Icon className="h-4 w-4 text-primary" />
                              </div>

                              <Card className="min-w-0 flex-1 overflow-hidden transition hover:border-primary/40 hover:shadow-sm">
                                <CardContent className="p-5">
                                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-semibold leading-6">
                                          {
                                            item.title
                                          }
                                        </h3>

                                        <Badge
                                          variant={getActivityBadgeVariant(
                                            item.type,
                                          )}
                                        >
                                          {formatActivityType(
                                            item.type,
                                          )}
                                        </Badge>
                                      </div>

                                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                        {
                                          item.description
                                        }
                                      </p>

                                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                                        <div>
                                          <div className="text-xs text-muted-foreground">
                                            Repository
                                          </div>

                                          <div className="mt-1 font-medium">
                                            {
                                              item.repositoryName
                                            }
                                          </div>
                                        </div>

                                        <div>
                                          <div className="text-xs text-muted-foreground">
                                            Activity time
                                          </div>

                                          <div
                                            className="mt-1 text-sm font-medium"
                                            title={formatTimestamp(
                                              item.timestamp,
                                            )}
                                          >
                                            {formatRelativeTimestamp(
                                              item.timestamp,
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <Button
                                      asChild
                                      size="sm"
                                      variant="outline"
                                      className="shrink-0"
                                    >
                                      <Link
                                        href={`/repositories/${item.repositoryId}`}
                                      >
                                        View Repository
                                      </Link>
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                </section>
              ),
            )}
          </div>
        )}

        {filteredItems.length > 0 ? (
          <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {(page - 1) *
                  PAGE_SIZE +
                  1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {Math.min(
                  page * PAGE_SIZE,
                  filteredItems.length,
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {filteredItems.length}
              </span>{" "}
              events
            </p>

            {totalPages > 1 ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() =>
                    setPage(
                      (currentPage) =>
                        Math.max(
                          1,
                          currentPage -
                            1,
                        ),
                    )
                  }
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>

                <Badge variant="outline">
                  Page {page} of{" "}
                  {totalPages}
                </Badge>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    page === totalPages
                  }
                  onClick={() =>
                    setPage(
                      (currentPage) =>
                        Math.min(
                          totalPages,
                          currentPage +
                            1,
                        ),
                    )
                  }
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
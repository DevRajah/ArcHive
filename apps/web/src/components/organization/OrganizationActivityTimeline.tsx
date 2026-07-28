"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  Activity,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  History,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import OrganizationEmptyState from "@/components/organization/OrganizationEmptyState";

import type {
  OrganizationActivityResponse,
} from "@/types/organization.types";

interface OrganizationActivityTimelineProps {
  activity: OrganizationActivityResponse;
}

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

function formatActivityType(type: string) {
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatTimestamp(
  value: string | Date,
) {
  const parsedDate = new Date(value);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
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

export default function OrganizationActivityTimeline({
  activity,
}: OrganizationActivityTimelineProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(
      activity.items.length /
        PAGE_SIZE,
    ),
  );

  const visibleItems = useMemo(() => {
    const startIndex =
      (page - 1) * PAGE_SIZE;

    return activity.items.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    );
  }, [activity.items, page]);

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
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Engineering Activity
            </CardTitle>

            <p className="mt-2 text-sm text-muted-foreground">
              Recent repository activity across the
              connected organization.
            </p>
          </div>

          <Badge variant="secondary">
            {activity.items.length} events
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="relative space-y-0">
          <div className="absolute bottom-6 left-5 top-6 w-px bg-border" />

          {visibleItems.map((item) => {
            const Icon =
              getActivityIcon(
                item.type,
              );

            return (
              <div
                key={item.id}
                className="relative flex gap-4 pb-7 last:pb-0"
              >
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background">
                  <Icon className="h-4 w-4 text-primary" />
                </div>

                <div className="min-w-0 flex-1 rounded-xl border p-5 transition hover:border-primary/40">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">
                          {item.title}
                        </h3>

                        <Badge variant="outline">
                          {formatActivityType(
                            item.type,
                          )}
                        </Badge>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>

                      <div className="mt-4">
                        <div className="font-medium">
                          {
                            item.repositoryName
                          }
                        </div>

                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatTimestamp(
                            item.timestamp,
                          )}
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
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 ? (
          <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() =>
                  setPage((currentPage) =>
                    Math.max(
                      1,
                      currentPage - 1,
                    ),
                  )
                }
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  page === totalPages
                }
                onClick={() =>
                  setPage((currentPage) =>
                    Math.min(
                      totalPages,
                      currentPage + 1,
                    ),
                  )
                }
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
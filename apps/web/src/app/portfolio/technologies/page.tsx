"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowRight,
  Braces,
  CalendarClock,
  GitBranch,
  Layers3,
  Lightbulb,
  Network,
  RefreshCcw,
  Search,
  SearchX,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { PortfolioNavigation } from "@/components/portfolio/PortfolioNavigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { useTechnologyOverview } from "@/hooks/usePortfolioTechnologies";

import { getUserId } from "@/lib/auth";

import type {
  TechnologyIntelligenceOverviewItem,
  TechnologyNameMetric,
  TechnologyOverviewSort,
} from "@/types/portfolio-technology.types";

function getHttpStatus(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return null;
  }

  return error.response?.status ?? null;
}

function formatDate(
  value?: string | null
) {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

function getTechnologyMetricName(
  value:
    | TechnologyNameMetric
    | string
    | null
    | undefined
) {
  if (!value) {
    return "Not available";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.technology;
}

function getTechnologyMetricDescription(
  value:
    | TechnologyNameMetric
    | string
    | null
    | undefined,
  fallback: string
) {
  if (!value || typeof value === "string") {
    return fallback;
  }

  if (
    typeof value.count === "number"
  ) {
    return `${value.count.toLocaleString()} repositories`;
  }

  if (value.detectedAt) {
    return formatDate(value.detectedAt);
  }

  return fallback;
}

function getTimestamp(
  value?: string | null
) {
  if (!value) return 0;

  const timestamp = new Date(
    value
  ).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}

export default function TechnologyIntelligencePage() {
  const router = useRouter();
  const userId = getUserId();

  const [search, setSearch] =
    useState("");

  const [sort, setSort] =
    useState<TechnologyOverviewSort>(
      "MOST_USED"
    );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useTechnologyOverview(userId);

  const status = getHttpStatus(error);

  useEffect(() => {
    if (status === 401) {
      router.replace("/connect-github");
    }
  }, [router, status]);

  const technologies = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    const filtered = (
      data?.technologies ?? []
    ).filter((technology) =>
      technology.technology
        .toLowerCase()
        .includes(query)
    );

    return [...filtered].sort(
      (first, second) => {
        switch (sort) {
          case "LEAST_USED":
            return (
              first.repositoryCount -
              second.repositoryCount
            );

          case "NEWEST":
            return (
              getTimestamp(
                second.firstDetectedAt
              ) -
              getTimestamp(
                first.firstDetectedAt
              )
            );

          case "OLDEST":
            return (
              getTimestamp(
                first.firstDetectedAt
              ) -
              getTimestamp(
                second.firstDetectedAt
              )
            );

          case "MOST_RECOMMENDATIONS":
            return (
              second.recommendationCount -
              first.recommendationCount
            );

          case "ALPHABETICAL":
            return first.technology.localeCompare(
              second.technology
            );

          case "MOST_USED":
          default:
            return (
              second.repositoryCount -
              first.repositoryCount
            );
        }
      }
    );
  }, [
    data?.technologies,
    search,
    sort,
  ]);

  return (
    <AppShell>
      <PageContent>
        <PortfolioNavigation />

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Braces className="h-5 w-5 text-primary" />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Technology Intelligence
                </h1>

                <p className="mt-2 max-w-3xl text-muted-foreground">
                  Explore the technologies detected
                  across your engineering portfolio
                  and understand where they appear,
                  what they support, and how adoption
                  is evolving.
                </p>

                <div className="mt-4 rounded-lg border border-border bg-background px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    ArcHive builds this view from
                    repository intelligence snapshots
                    and architecture history.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCcw
                className={`mr-2 h-4 w-4 ${
                  isFetching
                    ? "animate-spin"
                    : ""
                }`}
              />

              {isFetching
                ? "Refreshing..."
                : "Refresh Technologies"}
            </Button>
          </div>
        </div>

        {isLoading && (
          <TechnologyOverviewSkeleton />
        )}

        {isError &&
          status === 403 && (
            <OverviewErrorState
              icon={ShieldAlert}
              title="Portfolio access denied"
              description="The current ArcHive account does not have permission to view this portfolio's technology intelligence."
            />
          )}

        {isError &&
          status === 404 && (
            <OverviewErrorState
              icon={SearchX}
              title="Portfolio not found"
              description="ArcHive could not find the technology portfolio for the current user."
            />
          )}

        {isError &&
          status !== 401 &&
          status !== 403 &&
          status !== 404 && (
            <OverviewErrorState
              icon={TriangleAlert}
              title="Failed to load Technology Intelligence"
              description={
                error instanceof Error
                  ? error.message
                  : "ArcHive could not load portfolio technologies."
              }
              onRetry={() => refetch()}
              isRetrying={isFetching}
            />
          )}

        {!isLoading &&
          !isError &&
          data && (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <TechnologySummaryCard
                  label="Total Technologies"
                  value={
                    data.summary
                      .totalTechnologies
                  }
                  description="Unique technologies detected across the portfolio."
                  icon={Braces}
                />

                <TechnologySummaryCard
                  label="Repository Technology Links"
                  value={
                    data.summary
                      .totalRepositoryTechnologyLinks
                  }
                  description="Connections between repositories and technologies."
                  icon={GitBranch}
                />

                <TechnologySummaryCard
                  label="Most Adopted Technology"
                  value={getTechnologyMetricName(
                    data.summary
                      .mostAdoptedTechnology
                  )}
                  description={getTechnologyMetricDescription(
                    data.summary
                      .mostAdoptedTechnology,
                    "No adoption data available."
                  )}
                  icon={Network}
                />

                <TechnologySummaryCard
                  label="Newest Technology"
                  value={getTechnologyMetricName(
                    data.summary
                      .newestTechnology
                  )}
                  description={getTechnologyMetricDescription(
                    data.summary
                      .newestTechnology,
                    "No detection date available."
                  )}
                  icon={CalendarClock}
                />

                <TechnologySummaryCard
                  label="With Recommendations"
                  value={
                    data.summary
                      .technologiesWithRecommendations
                  }
                  description="Technologies connected to engineering recommendations."
                  icon={Lightbulb}
                />
              </div>

              {(data.technologies?.length ??
                0) === 0 ? (
                <EmptyTechnologyState />
              ) : (
                <>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_240px]">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                          value={search}
                          onChange={(event) =>
                            setSearch(
                              event.target.value
                            )
                          }
                          placeholder="Search technologies..."
                          className="pl-9"
                        />
                      </div>

                      <select
                        value={sort}
                        onChange={(event) =>
                          setSort(
                            event.target
                              .value as TechnologyOverviewSort
                          )
                        }
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="MOST_USED">
                          Most Used
                        </option>

                        <option value="LEAST_USED">
                          Least Used
                        </option>

                        <option value="NEWEST">
                          Newest Detected
                        </option>

                        <option value="OLDEST">
                          Oldest Detected
                        </option>

                        <option value="MOST_RECOMMENDATIONS">
                          Most Recommendations
                        </option>

                        <option value="ALPHABETICAL">
                          Alphabetical
                        </option>
                      </select>
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground">
                      Showing{" "}
                      {technologies.length.toLocaleString()}{" "}
                      of{" "}
                      {data.technologies.length.toLocaleString()}{" "}
                      technologies.
                    </p>
                  </div>

                  {technologies.length ===
                  0 ? (
                    <div className="rounded-xl border border-border bg-card p-10 text-center">
                      <Search className="mx-auto h-9 w-9 text-muted-foreground" />

                      <h2 className="mt-4 text-xl font-semibold">
                        No matching technologies
                      </h2>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Try another technology
                        name.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {technologies.map(
                        (technology) => (
                          <TechnologyCard
                            key={
                              technology.technology
                            }
                            technology={
                              technology
                            }
                          />
                        )
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
      </PageContent>
    </AppShell>
  );
}

function TechnologyCard({
  technology,
}: {
  technology: TechnologyIntelligenceOverviewItem;
}) {
  const href = `/portfolio/technologies/${encodeURIComponent(
    technology.technology
  )}`;

  return (
    <Link
      href={href}
      className="group rounded-xl border border-border bg-card p-5 transition hover:border-primary/50 hover:bg-accent"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="break-words text-lg font-semibold">
            {technology.technology}
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Last detected{" "}
            {formatDate(
              technology.lastDetectedAt
            )}
          </p>
        </div>

        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MetricBox
          label="Repositories"
          value={
            technology.repositoryCount
          }
        />

        <MetricBox
          label="Tracked"
          value={
            technology.trackedRepositoryCount
          }
        />

        <MetricBox
          label="Domains"
          value={
            technology.architectureDomainCount
          }
        />

        <MetricBox
          label="Capabilities"
          value={
            technology.capabilityCount
          }
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="secondary">
          {
            technology.recommendationCount
          }{" "}
          recommendations
        </Badge>

        <Badge variant="outline">
          First detected{" "}
          {formatDate(
            technology.firstDetectedAt
          )}
        </Badge>
      </div>
    </Link>
  );
}

function MetricBox({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold">
        {(value ?? 0).toLocaleString()}
      </p>
    </div>
  );
}

function TechnologySummaryCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  description: string;
  icon: typeof Braces;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <p className="mt-3 break-words text-2xl font-bold">
            {typeof value === "number"
              ? value.toLocaleString()
              : value}
          </p>
        </div>

        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function EmptyTechnologyState() {
  return (
    <div className="rounded-xl border border-border bg-card p-10 text-center">
      <Sparkles className="mx-auto h-10 w-10 text-muted-foreground" />

      <h2 className="mt-4 text-xl font-semibold">
        No technologies detected yet
      </h2>

      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Generate repository intelligence first.
        ArcHive will then identify the
        technologies used across your
        engineering portfolio.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/repositories">
            Open Repositories
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
        >
          <Link href="/portfolio">
            Open Portfolio
          </Link>
        </Button>
      </div>
    </div>
  );
}

function TechnologyOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map(
          (_, index) => (
            <Skeleton
              key={index}
              className="h-36 rounded-xl"
            />
          )
        )}
      </div>

      <Skeleton className="h-24 rounded-xl" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map(
          (_, index) => (
            <Skeleton
              key={index}
              className="h-72 rounded-xl"
            />
          )
        )}
      </div>
    </div>
  );
}

function OverviewErrorState({
  icon: Icon,
  title,
  description,
  onRetry,
  isRetrying,
}: {
  icon: typeof TriangleAlert;
  title: string;
  description: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-10 text-center">
      <Icon className="mx-auto h-9 w-9 text-muted-foreground" />

      <h2 className="mt-4 text-xl font-semibold">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {onRetry && (
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={onRetry}
          disabled={isRetrying}
        >
          <RefreshCcw
            className={`mr-2 h-4 w-4 ${
              isRetrying
                ? "animate-spin"
                : ""
            }`}
          />

          Retry
        </Button>
      )}
    </div>
  );
}
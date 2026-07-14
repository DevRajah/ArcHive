"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Database,
  GitBranch,
  GitFork,
  History,
  Languages,
  Layers3,
  RefreshCcw,
  Star,
  User,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminQueryError } from "@/components/admin/AdminQueryError";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStateCard } from "@/components/admin/AdminStateCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useAdminUser } from "@/hooks/useAdmin";

interface AdminUserRepositoryCounts {
  events?: number;
  timelineEntries?: number;
  architectureChanges?: number;
  engineeringRecommendations?: number;
}

interface AdminUserRepository {
  id: string;
  name: string;
  owner?: string | null;
  fullName?: string | null;
  language?: string | null;
  stars?: number;
  forks?: number;
  isTracked?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  _count?: AdminUserRepositoryCounts;
}

interface AdminUserDetailsPayload {
  id: string;
  githubId?: string | null;
  username?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  repositories?: AdminUserRepository[];
}

function formatDate(value?: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRepositoryCount(
  repository: AdminUserRepository,
  key: keyof AdminUserRepositoryCounts
) {
  return repository._count?.[key] ?? 0;
}

export default function AdminUserDetailsPage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useAdminUser(userId);

  const user = data as AdminUserDetailsPayload | undefined;
  const repositories = user?.repositories ?? [];

  const statistics = useMemo(() => {
    return repositories.reduce(
      (totals, repository) => {
        totals.trackedRepositories += repository.isTracked ? 1 : 0;
        totals.stars += repository.stars ?? 0;
        totals.forks += repository.forks ?? 0;

        totals.events += getRepositoryCount(repository, "events");
        totals.timelineEntries += getRepositoryCount(
          repository,
          "timelineEntries"
        );
        totals.architectureChanges += getRepositoryCount(
          repository,
          "architectureChanges"
        );
        totals.recommendations += getRepositoryCount(
          repository,
          "engineeringRecommendations"
        );

        return totals;
      },
      {
        trackedRepositories: 0,
        stars: 0,
        forks: 0,
        events: 0,
        timelineEntries: 0,
        architectureChanges: 0,
        recommendations: 0,
      }
    );
  }, [repositories]);

  const languageDistribution = useMemo(() => {
    return repositories.reduce<Record<string, number>>(
      (languages, repository) => {
        const language = repository.language || "Unknown";

        languages[language] = (languages[language] || 0) + 1;

        return languages;
      },
      {}
    );
  }, [repositories]);

  const sortedRepositories = useMemo(() => {
    return [...repositories].sort((first, second) => {
      const firstTime = first.updatedAt
        ? new Date(first.updatedAt).getTime()
        : 0;

      const secondTime = second.updatedAt
        ? new Date(second.updatedAt).getTime()
        : 0;

      return secondTime - firstTime;
    });
  }, [repositories]);

  return (
    <AppShell>
      <div className="space-y-6">
        <Button asChild variant="ghost" className="px-0">
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to users
          </Link>
        </Button>

        <AdminPageHeader
          title="User Details"
          description="Inspect the user profile, repository ownership, engineering activity, and portfolio-level statistics."
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCcw
                className={`mr-2 h-4 w-4 ${
                  isRefetching ? "animate-spin" : ""
                }`}
              />

              {isRefetching ? "Refreshing..." : "Refresh User"}
            </Button>
          }
        />

        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-xl" />
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-56 rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {isError && (
          <AdminQueryError
            error={error}
            title="Failed to load user details"
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && !user && (
          <AdminStateCard
            title="User details unavailable"
            description="ArcHive did not return details for this user."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && user && (
          <>
            <section className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.username || "User avatar"}
                      width={88}
                      height={88}
                      className="h-22 w-22 rounded-2xl border border-border object-cover"
                    />
                  ) : (
                    <div className="flex h-22 w-22 items-center justify-center rounded-2xl border border-border bg-muted">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="break-words text-3xl font-bold">
                      {user.username || "Unknown user"}
                    </h2>

                    <p className="mt-2 break-all text-sm text-muted-foreground">
                      {user.email || "No email available"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {user.githubId && (
                        <Badge variant="secondary">
                          GitHub ID {user.githubId}
                        </Badge>
                      )}

                      <Badge variant="outline">
                        Joined {formatDate(user.createdAt)}
                      </Badge>

                      <Badge variant="outline">
                        Updated {formatDate(user.updatedAt)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge>
                    {repositories.length.toLocaleString()} repositories
                  </Badge>

                  <Badge variant="secondary">
                    {statistics.trackedRepositories.toLocaleString()} tracked
                  </Badge>
                </div>
              </div>
            </section>

            <section>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <AdminStatCard
                  label="Total Repositories"
                  value={repositories.length}
                  description="Repositories owned by this ArcHive user."
                  icon={Database}
                />

                <AdminStatCard
                  label="Tracked Repositories"
                  value={statistics.trackedRepositories}
                  description="Repositories currently monitored by ArcHive."
                  icon={GitBranch}
                />

                <AdminStatCard
                  label="Engineering Events"
                  value={statistics.events}
                  description="Engineering events recorded across the portfolio."
                  icon={Activity}
                />

                <AdminStatCard
                  label="Timeline Entries"
                  value={statistics.timelineEntries}
                  description="Repository evolution entries generated by ArcHive."
                  icon={History}
                />

                <AdminStatCard
                  label="Architecture Changes"
                  value={statistics.architectureChanges}
                  description="Detected architecture-level changes."
                  icon={Layers3}
                />

                <AdminStatCard
                  label="Recommendations"
                  value={statistics.recommendations}
                  description="Engineering recommendations across repositories."
                  icon={Database}
                />

                <AdminStatCard
                  label="Total Stars"
                  value={statistics.stars}
                  description="Combined GitHub stars across the portfolio."
                  icon={Star}
                />

                <AdminStatCard
                  label="Total Forks"
                  value={statistics.forks}
                  description="Combined GitHub forks across the portfolio."
                  icon={GitFork}
                />
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-primary" />

                  <h2 className="text-lg font-semibold">
                    Language Distribution
                  </h2>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Primary repository languages across this user’s portfolio.
                </p>

                {Object.keys(languageDistribution).length === 0 ? (
                  <p className="mt-5 text-sm text-muted-foreground">
                    No language information is available.
                  </p>
                ) : (
                  <div className="mt-5 space-y-3">
                    {Object.entries(languageDistribution)
                      .sort(([, first], [, second]) => second - first)
                      .map(([language, count]) => (
                        <div
                          key={language}
                          className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3"
                        >
                          <span className="truncate text-sm font-medium">
                            {language}
                          </span>

                          <Badge variant="secondary">
                            {count.toLocaleString()}
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">
                  Engineering Portfolio Summary
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Aggregated repository activity and operational footprint.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <PortfolioMetric
                    label="Tracking Coverage"
                    value={
                      repositories.length > 0
                        ? `${Math.round(
                            (statistics.trackedRepositories /
                              repositories.length) *
                              100
                          )}%`
                        : "0%"
                    }
                    description="Percentage of repositories currently tracked."
                  />

                  <PortfolioMetric
                    label="Average Timeline Entries"
                    value={
                      repositories.length > 0
                        ? Math.round(
                            statistics.timelineEntries / repositories.length
                          ).toLocaleString()
                        : "0"
                    }
                    description="Average evolution entries per repository."
                  />

                  <PortfolioMetric
                    label="Average Architecture Changes"
                    value={
                      repositories.length > 0
                        ? Math.round(
                            statistics.architectureChanges /
                              repositories.length
                          ).toLocaleString()
                        : "0"
                    }
                    description="Average architecture changes per repository."
                  />

                  <PortfolioMetric
                    label="Average Recommendations"
                    value={
                      repositories.length > 0
                        ? Math.round(
                            statistics.recommendations / repositories.length
                          ).toLocaleString()
                        : "0"
                    }
                    description="Average recommendations per repository."
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-6">
              <div>
                <h2 className="text-lg font-semibold">
                  User Repositories
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Repository ownership, engineering activity, and tracking
                  status.
                </p>
              </div>

              {sortedRepositories.length === 0 ? (
                <div className="mt-6 rounded-xl border border-border bg-background p-10 text-center">
                  <Database className="mx-auto h-8 w-8 text-muted-foreground" />

                  <h3 className="mt-3 font-semibold">
                    No repositories found
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    This user has not imported any repositories yet.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {sortedRepositories.map((repository) => (
                    <RepositoryPortfolioCard
                      key={repository.id}
                      repository={repository}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

function PortfolioMetric({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>

      <p className="mt-2 text-2xl font-bold">{value}</p>

      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function RepositoryPortfolioCard({
  repository,
}: {
  repository: AdminUserRepository;
}) {
  const totalEvents = getRepositoryCount(repository, "events");
  const totalTimelineEntries = getRepositoryCount(
    repository,
    "timelineEntries"
  );
  const totalArchitectureChanges = getRepositoryCount(
    repository,
    "architectureChanges"
  );
  const totalRecommendations = getRepositoryCount(
    repository,
    "engineeringRecommendations"
  );

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">
            {repository.fullName || repository.name}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Updated {formatDate(repository.updatedAt)}
          </p>
        </div>

        {repository.isTracked ? (
          <Badge>Tracked</Badge>
        ) : (
          <Badge variant="outline">Not tracked</Badge>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {repository.language && (
          <Badge variant="secondary">
            {repository.language}
          </Badge>
        )}

        <Badge variant="outline">
          <Star className="mr-1 h-3 w-3" />
          {repository.stars ?? 0}
        </Badge>

        <Badge variant="outline">
          <GitFork className="mr-1 h-3 w-3" />
          {repository.forks ?? 0}
        </Badge>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <RepositoryMetric
          label="Events"
          value={totalEvents}
        />

        <RepositoryMetric
          label="Timeline"
          value={totalTimelineEntries}
        />

        <RepositoryMetric
          label="Architecture"
          value={totalArchitectureChanges}
        />

        <RepositoryMetric
          label="Recommendations"
          value={totalRecommendations}
        />
      </div>

      <Button asChild variant="outline" className="mt-5 w-full">
        <Link href={`/admin/repositories/${repository.id}`}>
          View Repository
          <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
        </Link>
      </Button>
    </div>
  );
}

function RepositoryMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="mt-1 text-lg font-bold">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
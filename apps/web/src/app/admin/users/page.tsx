"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Database,
  GitBranch,
  Search,
  UserCheck,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminQueryError } from "@/components/admin/AdminQueryError";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStateCard } from "@/components/admin/AdminStateCard";
import { AdminUserAvatar } from "@/components/admin/AdminUserAvatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { useAdminUsers } from "@/hooks/useAdmin";
import { AdminUser } from "@/types/admin.types";

function getJoinedDate(user: AdminUser) {
  return (
    user.createdAt ||
    user.joinedAt ||
    user.accountCreatedAt ||
    null
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [sort, pageSize]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminUsers({
    search: debouncedSearch,
    page,
    limit: pageSize,
    sort,
  });

  const users = useMemo(() => data?.users ?? [], [data?.users]);

  /*
   * The backend may already apply sorting. We also sort the currently
   * returned page so the UI remains predictable if the backend ignores
   * the optional sort parameter.
   */
  const sortedUsers = useMemo(() => {
    return [...users].sort((first, second) => {
      if (sort === "oldest") {
        const firstTime = getJoinedDate(first)
          ? new Date(getJoinedDate(first) as string).getTime()
          : 0;

        const secondTime = getJoinedDate(second)
          ? new Date(getJoinedDate(second) as string).getTime()
          : 0;

        return firstTime - secondTime;
      }

      if (sort === "repositories") {
        return (
          (second.repositoryCount ?? 0) -
          (first.repositoryCount ?? 0)
        );
      }

      if (sort === "tracked") {
        return (
          (second.trackedRepositories ?? 0) -
          (first.trackedRepositories ?? 0)
        );
      }

      const firstTime = getJoinedDate(first)
        ? new Date(getJoinedDate(first) as string).getTime()
        : 0;

      const secondTime = getJoinedDate(second)
        ? new Date(getJoinedDate(second) as string).getTime()
        : 0;

      return secondTime - firstTime;
    });
  }, [users, sort]);

  const totalUsers = data?.total ?? users.length;

  const repositoriesOnPage = users.reduce(
    (total, user) => total + (user.repositoryCount ?? 0),
    0
  );

  const trackedRepositoriesOnPage = users.reduce(
    (total, user) => total + (user.trackedRepositories ?? 0),
    0
  );

  const recentlyActiveUsers = users.filter(
    (user) => Boolean(user.lastActivityAt)
  ).length;

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminPageHeader
          title="Users"
          description="Inspect ArcHive accounts, repository ownership, tracking activity, and user-level engineering portfolios."
        />

        {!isLoading && !isError && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              label="Total Users"
              value={totalUsers}
              description="Registered accounts matching the current query."
              icon={Users}
            />

            <AdminStatCard
              label="Repositories on Page"
              value={repositoriesOnPage}
              description="Repositories owned by the currently visible users."
              icon={Database}
            />

            <AdminStatCard
              label="Tracked on Page"
              value={trackedRepositoriesOnPage}
              description="Actively monitored repositories for visible users."
              icon={GitBranch}
            />

            <AdminStatCard
              label="Users With Activity"
              value={recentlyActiveUsers}
              description="Visible users with recorded platform activity."
              icon={UserCheck}
            />
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_160px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users by username or email..."
                className="pl-9"
              />
            </div>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="newest">Newest users</option>
              <option value="oldest">Oldest users</option>
              <option value="repositories">
                Most repositories
              </option>
              <option value="tracked">
                Most tracked repositories
              </option>
            </select>

            <select
              value={pageSize}
              onChange={(event) =>
                setPageSize(Number(event.target.value))
              }
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          {isFetching && !isLoading && (
            <p className="mt-3 text-xs text-muted-foreground">
              Updating user results...
            </p>
          )}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <AdminQueryError
            error={error}
            title="Failed to load users"
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && sortedUsers.length === 0 && (
          <AdminStateCard
            title="No users found"
            description={
              debouncedSearch
                ? "No ArcHive users match the current search."
                : "No ArcHive users are currently available."
            }
          />
        )}

        {!isLoading && !isError && sortedUsers.length > 0 && (
          <>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="hidden grid-cols-[1.5fr_0.7fr_0.7fr_0.9fr_0.9fr_auto] gap-4 border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
                <span>User</span>
                <span>Repositories</span>
                <span>Tracked</span>
                <span>Joined</span>
                <span>Last Activity</span>
                <span />
              </div>

              {sortedUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/admin/users/${user.id}`}
                  className="block border-b border-border px-5 py-4 transition hover:bg-accent last:border-b-0"
                >
                  <div className="grid gap-4 md:grid-cols-[1.5fr_0.7fr_0.7fr_0.9fr_0.9fr_auto] md:items-center">
                    <div className="flex min-w-0 items-center gap-3">
                      <AdminUserAvatar
                        src={user.avatarUrl}
                        name={user.username || user.email}
                      />

                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {user.username || "Unknown user"}
                        </p>

                        <p className="truncate text-sm text-muted-foreground">
                          {user.email || "No email available"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-1 text-xs uppercase text-muted-foreground md:hidden">
                        Repositories
                      </p>

                      <Badge variant="secondary">
                        {user.repositoryCount ?? 0}
                      </Badge>
                    </div>

                    <div>
                      <p className="mb-1 text-xs uppercase text-muted-foreground md:hidden">
                        Tracked
                      </p>

                      <Badge variant="outline">
                        {user.trackedRepositories ?? 0}
                      </Badge>
                    </div>

                    <div>
                      <p className="mb-1 text-xs uppercase text-muted-foreground md:hidden">
                        Joined
                      </p>

                      <span className="text-sm text-muted-foreground">
                        {formatDate(getJoinedDate(user))}
                      </span>
                    </div>

                    <div>
                      <p className="mb-1 text-xs uppercase text-muted-foreground md:hidden">
                        Last activity
                      </p>

                      <span className="text-sm text-muted-foreground">
                        {formatDate(user.lastActivityAt)}
                      </span>
                    </div>

                    <ArrowRight className="hidden h-4 w-4 text-muted-foreground md:block" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-sm text-muted-foreground">
                Showing {sortedUsers.length} of {totalUsers} users.
              </p>

              <AdminPagination
                page={page}
                total={totalUsers}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
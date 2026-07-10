"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Search } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminStateCard } from "@/components/admin/AdminStateCard";
import { AdminUserAvatar } from "@/components/admin/AdminUserAvatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { useAdminUsers } from "@/hooks/useAdmin";
import { isAdminForbidden } from "@/lib/admin-errors";
import { AdminUser } from "@/types/admin.types";

const PAGE_SIZE = 10;

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

  return date.toLocaleDateString();
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, error, refetch } = useAdminUsers({
    search: debouncedSearch,
    page,
  });

  const users = data?.users || [];
  const total = data?.total ?? users.length;

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminPageHeader
          title="Users"
          description="Manage ArcHive users, repository ownership, activity, and account-level intelligence."
        />

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users by username or email..."
              className="pl-9"
            />
          </div>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-xl" />
            ))}
          </div>
        )}

        {isError && isAdminForbidden(error) && <AdminAccessRequired />}

        {isError && !isAdminForbidden(error) && (
          <AdminStateCard
            title="Failed to load users"
            description={
              error instanceof Error
                ? error.message
                : "Please check backend connection."
            }
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && users.length === 0 && (
          <AdminStateCard
            title="No users found"
            description="No ArcHive users match the current search."
          />
        )}

        {!isLoading && !isError && users.length > 0 && (
          <>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="hidden grid-cols-[1.5fr_0.7fr_0.7fr_0.9fr_0.9fr_auto] gap-4 border-b border-border px-5 py-3 text-xs font-medium uppercase text-muted-foreground md:grid">
                <span>User</span>
                <span>Repositories</span>
                <span>Tracked</span>
                <span>Joined</span>
                <span>Last Activity</span>
                <span />
              </div>

              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/admin/users/${user.id}`}
                  className="block border-b border-border px-5 py-4 transition hover:bg-accent last:border-b-0"
                >
                  <div className="grid gap-4 md:grid-cols-[1.5fr_0.7fr_0.7fr_0.9fr_0.9fr_auto] md:items-center">
                    <div className="flex items-center gap-3">
                      <AdminUserAvatar
                        src={user.avatarUrl}
                        name={user.username || user.email}
                      />

                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {user.username || "Unknown user"}
                        </p>

                        <p className="truncate text-sm text-muted-foreground">
                          {user.email || "No email"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-muted-foreground md:hidden">
                        Repositories
                      </p>

                      <Badge variant="secondary">
                        {user.repositoryCount ?? 0}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-muted-foreground md:hidden">
                        Tracked
                      </p>

                      <Badge variant="outline">
                        {user.trackedRepositories ?? 0}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-muted-foreground md:hidden">
                        Joined
                      </p>

                      <span className="text-sm text-muted-foreground">
                        {formatDate(getJoinedDate(user))}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-muted-foreground md:hidden">
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

            <p className="text-sm text-muted-foreground">
              Showing {users.length} of {total} users.
            </p>

            <AdminPagination
              page={page}
              total={total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
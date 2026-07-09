"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Search, Users } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStateCard } from "@/components/admin/AdminStateCard";
import { AdminUserAvatar } from "@/components/admin/AdminUserAvatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminUsers } from "@/hooks/useAdmin";

function formatDate(value?: string | null) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleDateString();
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page] = useState(1);

  const { data, isLoading, isError, error, refetch } = useAdminUsers({
    search,
    page,
  });

  const users = data?.users || [];

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

        {isError && (
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
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-4 border-b border-border px-5 py-3 text-xs font-medium uppercase text-muted-foreground">
              <span>User</span>
              <span>Repositories</span>
              <span>Tracked</span>
              <span>Joined</span>
              <span />
            </div>

            {users.map((user) => (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="grid grid-cols-[1.4fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-border px-5 py-4 transition hover:bg-accent last:border-b-0"
              >
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

                <Badge variant="secondary">
                  {user.repositoryCount ?? 0}
                </Badge>

                <Badge variant="outline">
                  {user.trackedRepositories ?? 0}
                </Badge>

                <span className="text-sm text-muted-foreground">
                  {formatDate(user.createdAt)}
                </span>

                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}

        {!isLoading && !isError && data?.total !== undefined && (
          <p className="text-sm text-muted-foreground">
            Showing {users.length} of {data.total} users.
          </p>
        )}
      </div>
    </AppShell>
  );
}
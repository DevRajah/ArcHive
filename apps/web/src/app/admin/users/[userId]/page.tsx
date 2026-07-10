"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Database,
  GitBranch,
  History,
  Layers3,
  User,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStateCard } from "@/components/admin/AdminStateCard";
import { AdminUserAvatar } from "@/components/admin/AdminUserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminUser } from "@/hooks/useAdmin";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { isAdminForbidden } from "@/lib/admin-errors";

function formatDate(value?: string | null) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleString();
}

export default function AdminUserDetailsPage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;

  const { data, isLoading, isError, error, refetch } = useAdminUser(userId);

  const user = data?.user;
  const repositories = data?.repositories || [];
  const stats = data?.stats;

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
          description="Inspect user profile, repository ownership, repository statistics, and timeline summary."
        />

        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-40 rounded-xl" />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {isError && isAdminForbidden(error) && <AdminAccessRequired />}

        {isError && !isAdminForbidden(error) && (
          <AdminStateCard
            title="Failed to load user details"
            description={
              error instanceof Error
                ? error.message
                : "Please check backend connection."
            }
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && user && (
          <>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <AdminUserAvatar
                  src={user.avatarUrl}
                  name={user.username || user.email}
                />

                <div>
                  <h2 className="text-2xl font-bold">
                    {user.username || "Unknown user"}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {user.email || "No email available"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      Joined {formatDate(user.createdAt)}
                    </Badge>

                    <Badge variant="outline">
                      Last activity {formatDate(user.lastActivityAt)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <AdminStatCard
                label="Total Repositories"
                value={stats?.totalRepositories ?? repositories.length}
                icon={Database}
              />

              <AdminStatCard
                label="Tracked Repositories"
                value={stats?.trackedRepositories ?? 0}
                icon={GitBranch}
              />

              <AdminStatCard
                label="Timeline Entries"
                value={stats?.totalTimelineEntries ?? 0}
                icon={History}
              />

              <AdminStatCard
                label="Architecture Changes"
                value={stats?.totalArchitectureChanges ?? 0}
                icon={Layers3}
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">User Repositories</h2>
              </div>

              {repositories.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  This user has not imported any repositories yet.
                </p>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {repositories.map((repo) => (
                    <Link
                      key={repo.id}
                      href={`/admin/repositories/${repo.id}`}
                      className="rounded-xl border border-border bg-background p-5 transition hover:border-primary/50 hover:bg-accent"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">
                            {repo.fullName || repo.name}
                          </h3>

                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {repo.description ||
                              "No repository description available."}
                          </p>
                        </div>

                        {repo.isTracked && <Badge>Tracked</Badge>}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {repo.language && (
                          <Badge variant="secondary">{repo.language}</Badge>
                        )}

                        <Badge variant="outline">
                          ⭐ {repo.stars ?? 0}
                        </Badge>

                        <Badge variant="outline">
                          Forks {repo.forks ?? 0}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
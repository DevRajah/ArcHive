"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminRepositoryCard } from "@/components/admin/AdminRepositoryCard";
import { AdminStateCard } from "@/components/admin/AdminStateCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminRepositories } from "@/hooks/useAdmin";

export default function AdminRepositoriesPage() {
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("");
  const [tracked, setTracked] = useState("");
  const [page] = useState(1);

  const { data, isLoading, isError, error, refetch } = useAdminRepositories({
    search,
    language,
    tracked,
    page,
  });

  const repositories = data?.repositories || [];

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminPageHeader
          title="Repositories"
          description="Manage imported repositories, intelligence refresh state, architecture signals, and repository ownership."
        />

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_0.5fr_0.4fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search repositories..."
                className="pl-9"
              />
            </div>

            <Input
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              placeholder="Filter by language"
            />

            <select
              value={tracked}
              onChange={(event) => setTracked(event.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">All repositories</option>
              <option value="true">Tracked only</option>
              <option value="false">Untracked only</option>
            </select>
          </div>
        </div>

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-44 rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <AdminStateCard
            title="Failed to load repositories"
            description={
              error instanceof Error
                ? error.message
                : "Please check backend connection."
            }
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && repositories.length === 0 && (
          <AdminStateCard
            title="No repositories found"
            description="No repositories match the current filters."
          />
        )}

        {!isLoading && !isError && repositories.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {repositories.map((repository) => (
                <AdminRepositoryCard
                  key={repository.id}
                  repository={repository}
                />
              ))}
            </div>

            {data?.total !== undefined && (
              <p className="text-sm text-muted-foreground">
                Showing {repositories.length} of {data.total} repositories.
              </p>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
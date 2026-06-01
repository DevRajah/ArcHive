"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { RepositoryCard } from "@/components/repositories/RepositoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrackedRepositories } from "@/hooks/useRepositories";

export default function RepositoriesPage() {
  const [search, setSearch] = useState("");

  const {
    data: repositories,
    isLoading,
    isError,
    error,
  } = useTrackedRepositories();

  const filteredRepositories = useMemo(() => {
    if (!repositories) return [];

    const query = search.toLowerCase().trim();

    if (!query) return repositories;

    return repositories.filter((repo) => {
      return (
        repo.name.toLowerCase().includes(query) ||
        repo.fullName?.toLowerCase().includes(query) ||
        repo.description?.toLowerCase().includes(query) ||
        repo.language?.toLowerCase().includes(query)
      );
    });
  }, [repositories, search]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>

            <p className="mt-2 text-muted-foreground">
              Manage tracked repositories and inspect engineering intelligence.
            </p>
          </div>

          <Button asChild>
            <Link href="/repositories/import">Import Repository</Link>
          </Button>
        </div>

        {!isLoading && !isError && repositories && repositories.length > 0 && (
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tracked repositories..."
            className="max-w-md"
          />
        )}

        {isLoading && (
          <div className="grid gap-6 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-44 rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
            <p className="font-medium text-destructive">
              Failed to load repositories
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Please check that your backend is running."}
            </p>
          </div>
        )}

        {!isLoading && !isError && repositories?.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <h2 className="text-xl font-semibold">
              No repositories tracked yet
            </h2>

            <p className="mt-2 text-muted-foreground">
              Import GitHub repositories to start building engineering memory.
            </p>

            <Button asChild className="mt-6">
              <Link href="/repositories/import">
                Import your first repository
              </Link>
            </Button>
          </div>
        )}

        {!isLoading &&
          !isError &&
          repositories &&
          repositories.length > 0 &&
          filteredRepositories.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <h2 className="text-xl font-semibold">
                No matching repositories
              </h2>

              <p className="mt-2 text-muted-foreground">
                Try searching by repository name, language, or description.
              </p>
            </div>
          )}

        {!isLoading &&
          !isError &&
          repositories &&
          repositories.length > 0 &&
          filteredRepositories.length > 0 && (
            <div className="grid gap-6 xl:grid-cols-3">
              {filteredRepositories.map((repo) => (
                <RepositoryCard
                  key={repo.id}
                  id={repo.id}
                  name={repo.name}
                  description={repo.description || "No description provided."}
                  language={repo.language || "Unknown"}
                  stars={repo.stars || 0}
                  forks={repo.forks || 0}
                  status={repo.isTracked === false ? "UNTRACKED" : "TRACKED"}
                />
              ))}
            </div>
          )}
      </div>
    </AppShell>
  );
}
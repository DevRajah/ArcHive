"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  GitCompareArrows,
  Search,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { useTrackedRepositories } from "@/hooks/useRepositories";
import { matchesSearch } from "@/lib/filters";

export default function IntelligenceDiffPage() {
  const [search, setSearch] = useState("");

  const {
    data: repositories,
    isLoading,
    isError,
    error,
    refetch,
  } = useTrackedRepositories();

  const filteredRepositories = useMemo(() => {
    const items = repositories ?? [];
    const query = search.trim();

    if (!query) {
      return items;
    }

    return items.filter((repository) => {
      return (
        matchesSearch(repository.name, query) ||
        matchesSearch(repository.fullName, query) ||
        matchesSearch(repository.owner, query) ||
        matchesSearch(repository.language, query)
      );
    });
  }, [repositories, search]);

  return (
    <AppShell>
      <PageContent>
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <GitCompareArrows className="h-5 w-5 text-primary" />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Intelligence Diff
                </h1>

                <p className="mt-2 max-w-3xl text-muted-foreground">
                  Select a repository to inspect how ArcHive&apos;s
                  understanding changed between intelligence
                  refreshes.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search tracked repositories..."
                className="pl-9"
              />
            </div>
          </div>

          {isLoading && (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-44 rounded-xl"
                />
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
                  : "Please check the backend connection."}
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-5"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          )}

          {!isLoading &&
            !isError &&
            (repositories?.length ?? 0) === 0 && (
              <div className="rounded-xl border border-border bg-card p-10 text-center">
                <Sparkles className="mx-auto h-9 w-9 text-muted-foreground" />

                <h2 className="mt-4 text-xl font-semibold">
                  No tracked repositories
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Track a repository before opening its intelligence
                  diff.
                </p>

                <Button asChild className="mt-6">
                  <Link href="/repositories">
                    Open Repositories
                  </Link>
                </Button>
              </div>
            )}

          {!isLoading &&
            !isError &&
            (repositories?.length ?? 0) > 0 &&
            filteredRepositories.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-10 text-center">
                <h2 className="text-xl font-semibold">
                  No matching repositories
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Try a different repository name, owner, or
                  language.
                </p>
              </div>
            )}

          {!isLoading &&
            !isError &&
            filteredRepositories.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredRepositories.map((repository) => (
                  <div
                    key={repository.id}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold">
                          {repository.fullName ||
                            repository.name}
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {repository.owner || "Unknown owner"}
                        </p>
                      </div>

                      <Badge variant="secondary">
                        Tracked
                      </Badge>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {repository.language && (
                        <Badge variant="outline">
                          {repository.language}
                        </Badge>
                      )}

                      {typeof repository.stars === "number" && (
                        <Badge variant="outline">
                          {repository.stars} stars
                        </Badge>
                      )}

                      {typeof repository.forks === "number" && (
                        <Badge variant="outline">
                          {repository.forks} forks
                        </Badge>
                      )}
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      className="mt-5 w-full"
                    >
                      <Link
                        href={`/repositories/${repository.id}/diff`}
                      >
                        Open Intelligence Diff
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
        </div>
      </PageContent>
    </AppShell>
  );
}
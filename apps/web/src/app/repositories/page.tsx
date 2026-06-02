"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FolderGit2, SearchX } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { RepositoryCard } from "@/components/repositories/RepositoryCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
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
      const searchableText = [
        repo.name,
        repo.fullName,
        repo.description,
        repo.language,
        repo.owner,
        repo.defaultBranch,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [repositories, search]);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Repositories"
          description="Manage tracked repositories and inspect engineering intelligence."
          action={
            <Button asChild>
              <Link href="/repositories/import">Import Repository</Link>
            </Button>
          }
        />

        {!isLoading && !isError && repositories && repositories.length > 0 && (
          <div className="space-y-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tracked repositories..."
              className="max-w-md"
            />

            <p className="text-sm text-muted-foreground">
              Showing {filteredRepositories.length} of {repositories.length}{" "}
              repositories
            </p>
          </div>
        )}

        {isLoading && (
          <div className="grid gap-6 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-44 rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <ErrorState
            title="Failed to load repositories"
            message={
              error instanceof Error
                ? error.message
                : "Please check that your backend is running."
            }
          />
        )}

        {!isLoading && !isError && repositories?.length === 0 && (
          <EmptyState
            icon={FolderGit2}
            title="No repositories tracked yet"
            description="Import GitHub repositories to start building engineering memory."
            actionLabel="Import your first repository"
            onAction={() => {
              window.location.href = "/repositories/import";
            }}
          />
        )}

        {!isLoading &&
          !isError &&
          repositories &&
          repositories.length > 0 &&
          filteredRepositories.length === 0 && (
            <EmptyState
              icon={SearchX}
              title="No matching repositories"
              description="Try searching by repository name, language, owner, branch, or description."
            />
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
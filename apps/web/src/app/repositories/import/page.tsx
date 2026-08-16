"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useGithubRepositories,
  useImportSelectedRepositories,
  useTrackedRepositories,
} from "@/hooks/useRepositories";

import type { GithubRepository } from "@/types/repository.types";

export default function ImportRepositoryPage() {
  const [importingRepoId, setImportingRepoId] =
    useState<string | null>(null);

  /*
   * GitHub repositories represent everything ArcHive can currently
   * access from the connected GitHub account.
   */
  const {
    data: repositories,
    isLoading,
    isError,
    error,
  } = useGithubRepositories();

  /*
   * Tracked repositories are ArcHive's canonical record of repositories
   * that have already been imported.
   *
   * We use this collection to prevent already-tracked repositories from
   * continuing to appear as importable choices.
   */
  const {
    data: trackedRepositories,
    isLoading: trackedRepositoriesLoading,
    isError: trackedRepositoriesError,
    error: trackedRepositoriesQueryError,
  } = useTrackedRepositories();

  const importMutation =
    useImportSelectedRepositories();

  /*
   * Build the list that should actually be shown on the Import page.
   *
   * GitHub repository IDs are the strongest identity match because they
   * remain stable even if a repository is renamed.
   *
   * fullName is retained as a defensive fallback for older ArcHive
   * repository records where githubRepoId may not have been persisted.
   */
  const availableRepositories = useMemo(() => {
    if (!repositories || !trackedRepositories) {
      return [];
    }

    const trackedGithubRepoIds = new Set(
      trackedRepositories
        .map(
          (repository) =>
            repository.githubRepoId
        )
        .filter(
          (
            githubRepoId
          ): githubRepoId is string =>
            Boolean(githubRepoId)
        )
    );

    const trackedRepositoryNames = new Set(
      trackedRepositories.map(
        (repository) => repository.fullName
      )
    );

    return repositories.filter((repository) => {
      const alreadyTrackedByGithubId =
        trackedGithubRepoIds.has(
          repository.githubRepoId
        );

      const alreadyTrackedByFullName =
        trackedRepositoryNames.has(
          repository.fullName
        );

      return (
        !alreadyTrackedByGithubId &&
        !alreadyTrackedByFullName
      );
    });
  }, [repositories, trackedRepositories]);

  function handleImportRepository(
    repository: GithubRepository
  ) {
    setImportingRepoId(repository.githubRepoId);

    importMutation.mutate([repository], {
      onSuccess: () => {
        /*
         * Use a viewport-level toast rather than a banner at the top
         * of the repository list.
         *
         * This matters because users may be importing repositories
         * far down a long GitHub list and should see confirmation
         * immediately without scrolling back to the top.
         */
        toast.success(
          `${repository.fullName} imported successfully.`,
          {
            duration: 5000,
          }
        );

        setImportingRepoId(null);
      },

      onError: (error) => {
        toast.error(
          "Failed to import repository.",
          {
            description:
              error instanceof Error
                ? error.message
                : "ArcHive could not import this repository.",
            duration: 5000,
          }
        );

        setImportingRepoId(null);
      },
    });
  }

  const pageLoading =
    isLoading || trackedRepositoriesLoading;

  const pageHasError =
    isError || trackedRepositoriesError;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Import Repository
          </h1>

          <p className="mt-2 text-muted-foreground">
            Select GitHub repositories to track
            and analyze with ArcHive.
          </p>
        </div>

        {pageLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <Skeleton
                key={item}
                className="h-32 rounded-xl"
              />
            ))}
          </div>
        )}

        {!pageLoading && isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
            <p className="font-medium text-destructive">
              Failed to load GitHub repositories
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Please check backend, GitHub OAuth session, and user ID."}
            </p>
          </div>
        )}

        {!pageLoading &&
          trackedRepositoriesError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
              <p className="font-medium text-destructive">
                Failed to load tracked repositories
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {trackedRepositoriesQueryError instanceof
                Error
                  ? trackedRepositoriesQueryError.message
                  : "ArcHive could not determine which repositories are already tracked."}
              </p>
            </div>
          )}

        {!pageLoading &&
          !pageHasError &&
          availableRepositories.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <h2 className="text-xl font-semibold">
                No repositories available to import
              </h2>

              <p className="mt-2 text-muted-foreground">
                All accessible GitHub repositories
                are already being tracked by
                ArcHive, or there are currently no
                repositories available from your
                connected GitHub account.
              </p>
            </div>
          )}

        {!pageLoading &&
          !pageHasError &&
          availableRepositories.length > 0 && (
            <div className="space-y-4">
              {availableRepositories.map(
                (repo) => {
                  const isThisRepoImporting =
                    importingRepoId ===
                      repo.githubRepoId &&
                    importMutation.isPending;

                  return (
                    <div
                      key={repo.githubRepoId}
                      className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-6 md:flex-row md:items-center"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="font-semibold">
                            {repo.fullName}
                          </h2>

                          <Badge variant="secondary">
                            {repo.isPrivate
                              ? "Private"
                              : "Public"}
                          </Badge>
                        </div>

                        <p className="mt-2 text-sm text-muted-foreground">
                          {repo.description ||
                            "No description provided."}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>
                            {repo.language ||
                              "Unknown language"}
                          </span>

                          <span>
                            Default branch:{" "}
                            {repo.defaultBranch ||
                              "main"}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() =>
                          handleImportRepository(
                            repo
                          )
                        }
                        disabled={
                          isThisRepoImporting ||
                          importMutation.isPending
                        }
                      >
                        {isThisRepoImporting
                          ? "Importing..."
                          : "Import"}
                      </Button>
                    </div>
                  );
                }
              )}
            </div>
          )}
      </div>
    </AppShell>
  );
}
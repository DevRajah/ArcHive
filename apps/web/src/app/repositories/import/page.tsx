"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGithubRepositories,
  useImportSelectedRepositories,
} from "@/hooks/useRepositories";
import { GithubRepository } from "@/types/repository.types";

export default function ImportRepositoryPage() {
  const [importingRepoId, setImportingRepoId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    data: repositories,
    isLoading,
    isError,
    error,
  } = useGithubRepositories();

  const importMutation = useImportSelectedRepositories();

  function handleImportRepository(repository: GithubRepository) {
    setImportingRepoId(repository.githubRepoId);
    setFeedback(null);

    importMutation.mutate([repository], {
      onSuccess: () => {
        setFeedback({
          type: "success",
          message: "Repository imported successfully.",
        });
        setImportingRepoId(null);
      },
      onError: (error) => {
        setFeedback({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to import repository.",
        });
        setImportingRepoId(null);
      },
    });
  }

  useEffect(() => {
    if (!feedback) return;

    const timer = setTimeout(() => {
      setFeedback(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [feedback]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Import Repository
          </h1>

          <p className="mt-2 text-muted-foreground">
            Select GitHub repositories to track and analyze with ArcHive.
          </p>
        </div>

        {feedback?.type === "success" && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-sm font-medium text-emerald-500">
              {feedback.message}
            </p>
          </div>
        )}

        {feedback?.type === "error" && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm font-medium text-destructive">
              Failed to import repository.
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {feedback.message}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-32 rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
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

        {!isLoading && !isError && repositories?.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <h2 className="text-xl font-semibold">
              No GitHub repositories available
            </h2>

            <p className="mt-2 text-muted-foreground">
              Connect your GitHub account or check that your backend can access
              your repositories.
            </p>
          </div>
        )}

        {!isLoading && !isError && repositories && repositories.length > 0 && (
          <div className="space-y-4">
            {repositories.map((repo) => {
              const isThisRepoImporting =
                importingRepoId === repo.githubRepoId &&
                importMutation.isPending;

              return (
                <div
                  key={repo.githubRepoId}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-6 md:flex-row md:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-semibold">{repo.fullName}</h2>

                      <Badge variant="secondary">
                        {repo.isPrivate ? "Private" : "Public"}
                      </Badge>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {repo.description || "No description provided."}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>{repo.language || "Unknown language"}</span>
                      <span>
                        Default branch: {repo.defaultBranch || "main"}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleImportRepository(repo)}
                    disabled={isThisRepoImporting}
                  >
                    {isThisRepoImporting ? "Importing..." : "Import"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
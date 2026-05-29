"use client";

import { useParams } from "next/navigation";
import { Network } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepositoryArchitecture } from "@/hooks/useArchitecture";

function formatArchitectureLabel(value?: string) {
  if (!value) return "Architecture Change";

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ArchitecturePage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params.repoId;

  const {
    data: architectureChanges,
    isLoading,
    isError,
    error,
  } = useRepositoryArchitecture(repoId);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Architecture Intelligence
          </h1>

          <p className="mt-2 text-muted-foreground">
            Detected system design changes and architecture evolution history.
          </p>
        </div>

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-40 rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
            <p className="font-medium text-destructive">
              Failed to load architecture intelligence
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Please check backend connection."}
            </p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          architectureChanges &&
          architectureChanges.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <h2 className="text-xl font-semibold">
                No architecture changes detected
              </h2>

              <p className="mt-2 text-muted-foreground">
                ArcHive has not detected architecture evolution for this
                repository yet.
              </p>
            </div>
          )}

        {!isLoading &&
          !isError &&
          architectureChanges &&
          architectureChanges.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {architectureChanges.map((change) => (
                <div
                  key={change.id}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Network className="h-4 w-4 text-primary" />
                      </div>

                      <div>
                        <h2 className="font-semibold">
                          {formatArchitectureLabel(change.title)}
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(change.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <Badge variant="secondary">
                      {formatArchitectureLabel(
                        change.severity || change.changeType || "Change"
                      )}                    </Badge>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">
                    {change.description ||
                      "No architecture description available."}
                  </p>
                </div>
              ))}
            </div>
          )}
      </div>
    </AppShell>
  );
}
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ArchitectureEvolutionLanes } from "@/components/architecture/ArchitectureEvolutionLanes";
import { ArchitectureEvolutionSummary } from "@/components/architecture/ArchitectureEvolutionSummary";
import { RepositoryLiveStatus } from "@/components/repositories/RepositoryLiveStatus";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepositoryArchitectureEvolution } from "@/hooks/useArchitecture";
import { useRepositoryLiveStatus } from "@/hooks/useRepositoryLiveStatus";

export default function ArchitectureEvolutionPage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params.repoId;

  const liveStatus = useRepositoryLiveStatus(repoId);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useRepositoryArchitectureEvolution(repoId);

  return (
    <AppShell>
      <div className="space-y-6">
        <Button asChild variant="ghost" className="px-0">
          <Link href={`/repositories/${repoId}/architecture`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to architecture intelligence
          </Link>
        </Button>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  Architecture Evolution
                </h1>

                {data?.repository?.fullName && (
                  <Badge variant="secondary">{data.repository.fullName}</Badge>
                )}
              </div>

              <p className="mt-2 max-w-3xl text-muted-foreground">
                Explore architecture evolution grouped by system domains,
                technologies, files, and engineering intelligence changes.
              </p>

              <div className="mt-4">
                <RepositoryLiveStatus
                  isConnected={liveStatus.isConnected}
                  lastUpdatedAt={liveStatus.lastUpdatedAt}
                />
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-36 rounded-xl" />
              ))}
            </div>

            {[1, 2].map((item) => (
              <Skeleton key={item} className="h-72 rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
            <p className="font-medium text-destructive">
              Failed to load architecture evolution
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Please check backend connection."}
            </p>
          </div>
        )}

        {!isLoading && !isError && data && (
          <>
            <ArchitectureEvolutionSummary summary={data.summary} />

            {data.domains.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-10 text-center">
                <h2 className="text-xl font-semibold">
                  No architecture evolution yet
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  ArcHive has not grouped architecture changes into evolution
                  domains for this repository yet.
                </p>
              </div>
            ) : (
              <ArchitectureEvolutionLanes domains={data.domains} />
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
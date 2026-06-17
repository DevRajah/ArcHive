"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { RepositoryCapabilityMatrix } from "@/components/repositories/RepositoryCapabilityMatrix";
import { RepositoryLiveStatus } from "@/components/repositories/RepositoryLiveStatus";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepositoryCapabilities } from "@/hooks/useRepositories";
import { useRepositoryOverview } from "@/hooks/useRepositoryOverview";
import { useRepositoryLiveStatus } from "@/hooks/useRepositoryLiveStatus";
import { RepositoryCrossLinks } from "@/components/repositories/RepositoryCrossLinks";
import { RepositoryIntelligenceNav } from "@/components/repositories/RepositoryIntelligenceNav";

export default function RepositoryCapabilitiesPage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params.repoId;

  const liveStatus = useRepositoryLiveStatus(repoId);

  const { data: overview } = useRepositoryOverview(repoId);

  const {
    data: capabilities,
    isLoading,
    isError,
    error,
  } = useRepositoryCapabilities(repoId);

  return (
    <AppShell>
      <div className="space-y-6">
        <Button asChild variant="ghost" className="px-0">
          <Link href={`/repositories/${repoId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to repository overview
          </Link>
        </Button>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  Capability Intelligence
                </h1>

                {overview?.repository?.fullName && (
                  <Badge variant="secondary">
                    {overview.repository.fullName}
                  </Badge>
                )}
              </div>

              <p className="mt-2 max-w-3xl text-muted-foreground">
                Engineering maturity analysis, repository capabilities,
                infrastructure depth, repository types, detected domains, and
                technology signals.
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

        <RepositoryIntelligenceNav repositoryId={repoId} />

        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-52 rounded-xl" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
            <p className="font-medium text-destructive">
              Failed to load capability intelligence
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Please check backend connection."}
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <RepositoryCapabilityMatrix
            data={capabilities}
            isLoading={isLoading}
          />
        )}

        <RepositoryCrossLinks
          title="Related Intelligence"
          links={[
            {
              label: "Architecture Evolution",
              description: "Connect capabilities to architecture changes and evolution lanes.",
              href: `/repositories/${repoId}/architecture/evolution`,
            },
            {
              label: "Knowledge Graph",
              description: "View capability relationships as repository knowledge edges.",
              href: `/repositories/${repoId}/knowledge-graph`,
            },
            {
              label: "Recommendations",
              description: "Review suggested engineering improvements.",
              href: `/repositories/${repoId}/recommendations`,
            },
          ]}
        />
      </div>
    </AppShell>
  );
}
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { RepositoryNarrative } from "@/components/repositories/RepositoryNarrative";
import { RepositoryPurposeCard } from "@/components/repositories/RepositoryPurposeCard";
import { RepositoryLiveStatus } from "@/components/repositories/RepositoryLiveStatus";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useRepositoryIntelligenceReport,
  useRepositoryNarrative,
} from "@/hooks/useRepositories";
import { useRepositoryOverview } from "@/hooks/useRepositoryOverview";
import { useRepositoryLiveStatus } from "@/hooks/useRepositoryLiveStatus";
import { RepositoryCrossLinks } from "@/components/repositories/RepositoryCrossLinks";
import { RepositoryIntelligenceNav } from "@/components/repositories/RepositoryIntelligenceNav";

export default function RepositoryNarrativePage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params.repoId;

  const liveStatus = useRepositoryLiveStatus(repoId);

  const { data: overview } = useRepositoryOverview(repoId);

  const {
    data: narrative,
    isLoading: isNarrativeLoading,
    isError: isNarrativeError,
    error: narrativeError,
  } = useRepositoryNarrative(repoId);

  const {
    data: intelligenceReport,
    isLoading: isPurposeLoading,
  } = useRepositoryIntelligenceReport(repoId);

  return (
    <AppShell>
      <PageContent>
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
                  Narrative Intelligence
                </h1>

                {overview?.repository?.fullName && (
                  <Badge variant="secondary">
                    {overview.repository.fullName}
                  </Badge>
                )}
              </div>

              <p className="mt-2 max-w-3xl text-muted-foreground">
                Semantic engineering understanding, repository purpose,
                confidence signals, reasoning evidence, and detected
                specializations.
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

        {(isNarrativeLoading || isPurposeLoading) && (
          <div className="space-y-6">
            <Skeleton className="h-52 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        )}

        {isNarrativeError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
            <p className="font-medium text-destructive">
              Failed to load narrative intelligence
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {narrativeError instanceof Error
                ? narrativeError.message
                : "Please check backend connection."}
            </p>
          </div>
        )}

        {!isNarrativeLoading && !isNarrativeError && !isPurposeLoading && (
          <>
            <RepositoryPurposeCard
              data={intelligenceReport}
              isLoading={isPurposeLoading}
            />

            <RepositoryNarrative
              data={narrative}
              intelligenceReport={intelligenceReport}
              isLoading={isNarrativeLoading}
            />

            <RepositoryCrossLinks
              links={[
                {
                  label: "Capability Intelligence",
                  description:
                    "Inspect maturity, complexity, technologies, and detected repository types.",
                  href: `/repositories/${repoId}/capabilities`,
                },
                {
                  label: "Architecture Evolution",
                  description: "See how architecture domains evolved over time.",
                  href: `/repositories/${repoId}/architecture/evolution`,
                },
                {
                  label: "Knowledge Graph",
                  description:
                    "Explore relationships between technologies and architecture domains.",
                  href: `/repositories/${repoId}/knowledge-graph`,
                },
              ]}
            />
          </>
        )}
      </PageContent>
    </AppShell>
  );
}
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  GitCompareArrows,
  Minus,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { RepositoryIntelligenceNav } from "@/components/repositories/RepositoryIntelligenceNav";

import { BadgeGroup } from "@/components/intelligence-v2/BadgeGroup";
import { IntelligenceSection } from "@/components/intelligence-v2/IntelligenceSection";
import { ScoreCard } from "@/components/intelligence-v2/ScoreCard";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useRepositoryIntelligenceDiff } from "@/hooks/useRepositories";
import { formatFilterLabel } from "@/lib/filters";

function getDirectionIcon(direction?: string) {
  const value = direction?.toUpperCase();

  if (value === "UP") {
    return <ArrowUp className="h-4 w-4 text-emerald-500" />;
  }

  if (value === "DOWN") {
    return <ArrowDown className="h-4 w-4 text-yellow-500" />;
  }

  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function formatValue(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "—";

  if (typeof value === "number") return `${value}`;

  return value;
}

function SignalDiffCard({
  title,
  added,
  removed,
  unchanged,
}: {
  title: string;
  added?: string[];
  removed?: string[];
  unchanged?: string[];
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <h3 className="font-semibold">{title}</h3>

      <div className="mt-5 space-y-5">
        <div>
          <p className="mb-2 text-sm font-medium text-emerald-500">Added</p>
          <BadgeGroup items={added} variant="secondary" />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-yellow-500">Removed</p>
          <BadgeGroup items={removed} variant="outline" />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Unchanged
          </p>
          <BadgeGroup items={unchanged} variant="outline" limit={6} />
        </div>
      </div>
    </div>
  );
}

export default function RepositoryIntelligenceDiffPage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params.repoId;

  const { data, isLoading, isError, error } =
    useRepositoryIntelligenceDiff(repoId);

  const hasRealDiff =
    data?.hasDiff ||
    Boolean(data?.scoreChanges?.length) ||
    Boolean(data?.signalChanges) ||
    Boolean(data?.recommendationChanges);

  return (
    <AppShell>
      <PageContent>
        <Button asChild variant="ghost" className="px-0">
          <Link href={`/repositories/${repoId}/intelligence`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to intelligence report
          </Link>
        </Button>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <GitCompareArrows className="h-5 w-5 text-primary" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  Intelligence Diff
                </h1>

                {data?.repository?.fullName && (
                  <Badge variant="secondary">{data.repository.fullName}</Badge>
                )}
              </div>

              <p className="mt-2 max-w-3xl text-muted-foreground">
                Compare how ArcHive's understanding of this repository changed
                between intelligence refreshes.
              </p>
            </div>
          </div>
        </div>

        <RepositoryIntelligenceNav repositoryId={repoId} />

        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
            <p className="font-medium text-destructive">
              Failed to load intelligence diff
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "The intelligence diff endpoint may not be available yet."}
            </p>
          </div>
        )}

        {!isLoading && !isError && !hasRealDiff && (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No intelligence diff available yet
            </h2>

            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              ArcHive needs at least two intelligence snapshots to compare what
              changed. Refresh this repository's intelligence, then return here
              after processing completes.
            </p>

            <Button asChild className="mt-6">
              <Link href={`/repositories/${repoId}/intelligence`}>
                Open intelligence report
              </Link>
            </Button>
          </div>
        )}

        {!isLoading && !isError && hasRealDiff && data && (
          <>
            <IntelligenceSection
              title="Diff Summary"
              description="High-level explanation of what changed between intelligence snapshots."
            >
              <div className="rounded-xl border border-border bg-background p-5">
                <h2 className="text-2xl font-bold">
                  {data.summary?.headline || "Repository intelligence changed"}
                </h2>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {data.summary?.description ||
                    "ArcHive detected changes in repository intelligence signals."}
                </p>

                {data.generatedAt && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    Generated: {new Date(data.generatedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </IntelligenceSection>

            <IntelligenceSection
              title="Score Changes"
              description="Previous vs current score changes detected by ArcHive."
            >
              {!data.scoreChanges || data.scoreChanges.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No score changes detected.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {data.scoreChanges.map((change, index) => (
                    <div
                      key={`${change.label}-${index}`}
                      className="rounded-xl border border-border bg-background p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold">
                          {formatFilterLabel(change.label)}
                        </h3>

                        {getDirectionIcon(change.direction)}
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <ScoreCard
                          label="Previous"
                          score={
                            typeof change.previous === "number"
                              ? change.previous
                              : null
                          }
                          description={formatValue(change.previous)}
                        />

                        <ScoreCard
                          label="Current"
                          score={
                            typeof change.current === "number"
                              ? change.current
                              : null
                          }
                          description={formatValue(change.current)}
                        />
                      </div>

                      {change.summary && (
                        <p className="mt-4 text-sm leading-6 text-muted-foreground">
                          {change.summary}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </IntelligenceSection>

            <IntelligenceSection
              title="Signal Changes"
              description="Technologies, architecture domains, repository types, and capabilities added or removed."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <SignalDiffCard
                  title="Technologies"
                  added={data.signalChanges?.technologies?.added}
                  removed={data.signalChanges?.technologies?.removed}
                  unchanged={data.signalChanges?.technologies?.unchanged}
                />

                <SignalDiffCard
                  title="Architecture Domains"
                  added={data.signalChanges?.architectureDomains?.added}
                  removed={data.signalChanges?.architectureDomains?.removed}
                  unchanged={data.signalChanges?.architectureDomains?.unchanged}
                />

                <SignalDiffCard
                  title="Repository Types"
                  added={data.signalChanges?.repositoryTypes?.added}
                  removed={data.signalChanges?.repositoryTypes?.removed}
                  unchanged={data.signalChanges?.repositoryTypes?.unchanged}
                />

                <SignalDiffCard
                  title="Capabilities"
                  added={data.signalChanges?.capabilities?.added}
                  removed={data.signalChanges?.capabilities?.removed}
                  unchanged={data.signalChanges?.capabilities?.unchanged}
                />
              </div>
            </IntelligenceSection>

            <IntelligenceSection
              title="Recommendation Lifecycle Changes"
              description="New, resolved, or removed recommendations between intelligence snapshots."
            >
              <div className="grid gap-6 md:grid-cols-3">
                <SignalDiffCard
                  title="Added"
                  added={data.recommendationChanges?.added}
                />

                <SignalDiffCard
                  title="Resolved"
                  added={data.recommendationChanges?.resolved}
                />

                <SignalDiffCard
                  title="Removed"
                  removed={data.recommendationChanges?.removed}
                />
              </div>
            </IntelligenceSection>
          </>
        )}
      </PageContent>
    </AppShell>
  );
}
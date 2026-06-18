"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Boxes,
  GitBranch,
  Network,
  Search,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { RepositoryIntelligenceNav } from "@/components/repositories/RepositoryIntelligenceNav";
import { RepositoryLiveStatus } from "@/components/repositories/RepositoryLiveStatus";

import { BadgeGroup } from "@/components/intelligence-v2/BadgeGroup";
import { InsightList } from "@/components/intelligence-v2/InsightList";
import { IntelligenceSection } from "@/components/intelligence-v2/IntelligenceSection";
import { ScoreCard } from "@/components/intelligence-v2/ScoreCard";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { useRepositoryArchitectureEvolution } from "@/hooks/useArchitecture";
import { useRepositoryLiveStatus } from "@/hooks/useRepositoryLiveStatus";
import { formatFilterLabel } from "@/lib/filters";

function matchesSearch(value: string | undefined | null, search: string) {
  if (!search.trim()) return true;

  return value?.toLowerCase().includes(search.toLowerCase()) ?? false;
}

function getLatestDate(values: Array<string | null | undefined>) {
  const validDates = values
    .map((value) => (value ? new Date(value) : null))
    .filter((value): value is Date => Boolean(value && !Number.isNaN(value.getTime())))
    .sort((a, b) => b.getTime() - a.getTime());

  return validDates[0]?.toLocaleString() || "Unknown";
}

export default function ArchitectureEvolutionPage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params.repoId;

  const liveStatus = useRepositoryLiveStatus(repoId);

  const { data, isLoading, isError, error } =
    useRepositoryArchitectureEvolution(repoId);

  const [search, setSearch] = useState("");

  const domains = data?.domains || [];
  const architectureStyles = data?.insights?.architectureStyles || [];

  const totalChanges = data?.summary?.totalArchitectureChanges || 0;
  const totalDomains = data?.summary?.totalDomains || domains.length;
  const mostActiveDomain = data?.summary?.mostActiveDomain;

  const filteredDomains = useMemo(() => {
    return domains
      .map((domain) => {
        const changes = domain.changes.filter((change) => {
          return (
            matchesSearch(change.changeType, search) ||
            matchesSearch(change.summary, search) ||
            matchesSearch(change.evolutionSummary, search) ||
            matchesSearch(change.detectedTechnology, search) ||
            matchesSearch(change.fileAffected, search) ||
            matchesSearch(domain.label, search) ||
            matchesSearch(domain.domain, search)
          );
        });

        return {
          ...domain,
          changes,
        };
      })
      .filter((domain) => {
        if (!search.trim()) return true;

        return (
          matchesSearch(domain.label, search) ||
          matchesSearch(domain.domain, search) ||
          domain.changes.length > 0
        );
      });
  }, [domains, search]);

  const latestActivity = getLatestDate(
    domains.map((domain) => domain.latestChangeAt)
  );

  return (
    <AppShell>
      <PageContent>
        <Button asChild variant="ghost" className="px-0">
          <Link href={`/repositories/${repoId}/architecture`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to architecture intelligence
          </Link>
        </Button>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
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
                Evolution scorecard showing architecture domains, engineering
                styles, change patterns, technologies, and system growth over
                time.
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
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>

            <Skeleton className="h-80 rounded-xl" />
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
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <ScoreCard
                label="Architecture Changes"
                score={Math.min(totalChanges * 10, 100)}
                level={`${totalChanges.toLocaleString()} changes`}
                description="Total architecture-level changes detected by ArcHive."
              />

              <ScoreCard
                label="Architecture Domains"
                score={Math.min(totalDomains * 20, 100)}
                level={`${totalDomains.toLocaleString()} domains`}
                description="Distinct architecture areas affected over time."
              />

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Most Active Domain
                    </p>

                    <h3 className="mt-3 text-xl font-bold">
                      {mostActiveDomain
                        ? formatFilterLabel(mostActiveDomain)
                        : "Unknown"}
                    </h3>
                  </div>

                  <Network className="h-5 w-5 text-primary" />
                </div>

                <p className="mt-4 text-xs leading-5 text-muted-foreground">
                  Architecture area with the highest detected evolution.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Latest Activity
                    </p>

                    <h3 className="mt-3 text-xl font-bold">
                      {latestActivity}
                    </h3>
                  </div>

                  <GitBranch className="h-5 w-5 text-primary" />
                </div>

                <p className="mt-4 text-xs leading-5 text-muted-foreground">
                  Most recent grouped architecture evolution signal.
                </p>
              </div>
            </div>

            <IntelligenceSection
              title="Architecture Styles"
              description="High-level engineering styles detected across this repository."
            >
              <BadgeGroup items={architectureStyles} />
            </IntelligenceSection>

            <IntelligenceSection
              title="Evolution Search"
              description="Search architecture domains, technologies, files, change types, and evolution summaries."
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search evolution signals..."
                  className="pl-9"
                />
              </div>
            </IntelligenceSection>

            <IntelligenceSection
              title="Architecture Domains"
              description="Grouped evolution lanes showing which parts of the system changed and why."
            >
              {filteredDomains.length === 0 ? (
                <div className="rounded-xl border border-border bg-background p-6 text-center">
                  <p className="font-medium">No matching domains found</p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Try another search term or clear the search field.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                  {filteredDomains.map((domain) => (
                    <div
                      key={domain.domain}
                      className="rounded-xl border border-border bg-background p-5"
                    >
                      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">
                              {domain.label || formatFilterLabel(domain.domain)}
                            </h3>

                            <Badge variant="secondary">
                              {domain.totalChanges} changes
                            </Badge>
                          </div>

                          <p className="mt-2 text-sm text-muted-foreground">
                            Latest activity:{" "}
                            {domain.latestChangeAt
                              ? new Date(domain.latestChangeAt).toLocaleString()
                              : "Unknown"}
                          </p>
                        </div>

                        <Boxes className="h-5 w-5 text-primary" />
                      </div>

                      {domain.technologies && domain.technologies.length > 0 && (
                        <div className="mt-4">
                          <BadgeGroup
                            items={domain.technologies}
                            variant="outline"
                            humanize={false}
                            limit={5}
                          />
                        </div>
                      )}

                      <div className="mt-5 space-y-3">
                        {domain.changes.slice(0, 3).map((change) => (
                          <div
                            key={change.id}
                            className="rounded-lg border border-border bg-card p-4"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">
                                {formatFilterLabel(change.changeType)}
                              </Badge>

                              {change.detectedTechnology && (
                                <Badge variant="secondary">
                                  {change.detectedTechnology}
                                </Badge>
                              )}
                            </div>

                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                              {change.summary ||
                                "Architecture change detected."}
                            </p>

                            {change.evolutionSummary && (
                              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                {change.evolutionSummary}
                              </p>
                            )}

                            {change.fileAffected && (
                              <p className="mt-3 break-all rounded-md bg-background p-2 text-xs text-muted-foreground">
                                {change.fileAffected}
                              </p>
                            )}
                          </div>
                        ))}

                        {domain.changes.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{domain.changes.length - 3} more changes hidden
                            for readability.
                          </p>
                        )}

                        {domain.changes.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            No matching changes in this domain.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </IntelligenceSection>

            <IntelligenceSection
              title="Evolution Intelligence Notes"
              description="Compact evidence extracted from the latest architecture evolution signals."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-background p-5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <p className="font-medium">Recent Evolution Summaries</p>
                  </div>

                  <div className="mt-4">
                    <InsightList
                      items={domains
                        .flatMap((domain) =>
                          domain.changes.map(
                            (change) => change.evolutionSummary
                          )
                        )
                        .filter(Boolean)}
                      limit={5}
                      empty="No evolution summaries available yet."
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background p-5">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-primary" />
                    <p className="font-medium">Recent Architecture Changes</p>
                  </div>

                  <div className="mt-4">
                    <InsightList
                      items={domains
                        .flatMap((domain) =>
                          domain.changes.map((change) => change.summary)
                        )
                        .filter(Boolean)}
                      limit={5}
                      empty="No recent architecture change summaries available."
                    />
                  </div>
                </div>
              </div>
            </IntelligenceSection>
          </>
        )}
      </PageContent>
    </AppShell>
  );
}
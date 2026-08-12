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

function matchesSearch(
  value: string | undefined | null,
  search: string
) {
  if (!search.trim()) return true;

  return (
    value?.toLowerCase().includes(search.toLowerCase()) ?? false
  );
}

function getLatestDate(
  values: Array<string | null | undefined>
) {
  const validDates = values
    .map((value) => (value ? new Date(value) : null))
    .filter(
      (value): value is Date =>
        Boolean(value && !Number.isNaN(value.getTime()))
    )
    .sort((a, b) => b.getTime() - a.getTime());

  return validDates[0]?.toLocaleString() || "Unknown";
}

/**
 * Historical evolution metrics are counts, not scores.
 *
 * We deliberately keep these separate from ScoreCard because
 * converting "1 architecture change" into "10%" would imply
 * quality or maturity when the value is simply historical volume.
 */
function EvolutionMetricCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof GitBranch;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <h3 className="mt-3 text-2xl font-bold">
            {value}
          </h3>
        </div>

        <Icon className="h-5 w-5 text-primary" />
      </div>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export default function ArchitectureEvolutionPage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params.repoId;

  const liveStatus = useRepositoryLiveStatus(repoId);

  const { data, isLoading, isError, error } =
    useRepositoryArchitectureEvolution(repoId);

  const [search, setSearch] = useState("");

  const domains = data?.domains || [];
  const insights = data?.insights;

  const architectureStyles =
    insights?.architectureStyles || [];

  const detectedCapabilities =
    insights?.detectedCapabilities || [];

  const missingCapabilities =
    insights?.missingCapabilities || [];

  const infrastructureEvidence =
    insights?.infrastructureDepthEvidence;

  const totalChanges =
    data?.summary?.totalArchitectureChanges || 0;

  const totalDomains =
    data?.summary?.totalDomains || domains.length;

  const mostActiveDomain =
    data?.summary?.mostActiveDomain;

  const repositoryMaturityScore =
    insights?.repositoryMaturityScore ??
    insights?.architectureMaturityScore ??
    0;

  const capabilityScore =
    insights?.capabilityScore ?? 0;

  const infrastructureDepthScore =
    insights?.infrastructureDepthScore ?? 0;

  const infrastructureDepth =
    insights?.infrastructureDepth || "Unknown";

  const filteredDomains = useMemo(() => {
    return domains
      .map((domain) => {
        const changes = domain.changes.filter((change) => {
          return (
            matchesSearch(change.changeType, search) ||
            matchesSearch(change.summary, search) ||
            matchesSearch(
              change.evolutionSummary,
              search
            ) ||
            matchesSearch(
              change.detectedTechnology,
              search
            ) ||
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
                  <Badge variant="secondary">
                    {data.repository.fullName}
                  </Badge>
                )}
              </div>

              <p className="mt-2 max-w-3xl text-muted-foreground">
                Track how this repository&apos;s architecture
                changes over time, while keeping its current
                engineering maturity, capabilities, and
                infrastructure context visible.
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

        <RepositoryIntelligenceNav
          repositoryId={repoId}
        />

        {isLoading && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>

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
            {/* Current state is context for the historical evolution below. */}
            <IntelligenceSection
              title="Current Architecture Context"
              description="Current engineering state returned alongside the repository's historical evolution data."
            >
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <ScoreCard
                  label="Repository Maturity"
                  score={repositoryMaturityScore}
                  level={`${repositoryMaturityScore}%`}
                  description="Current structural maturity of the repository based on ArcHive's detected engineering evidence."
                />

                <ScoreCard
                  label="Capability Coverage"
                  score={capabilityScore}
                  level={`${capabilityScore}%`}
                  description="Current coverage of engineering capabilities detected across the repository."
                />

                <ScoreCard
                  label="Infrastructure Depth"
                  score={infrastructureDepthScore}
                  level={formatFilterLabel(
                    infrastructureDepth
                  )}
                  description={
                    infrastructureEvidence
                      ? `${infrastructureEvidence.detectedCount} of ${infrastructureEvidence.totalPossible} infrastructure areas detected.`
                      : "Current depth of infrastructure capabilities detected by ArcHive."
                  }
                />
              </div>

              {(architectureStyles.length > 0 ||
                detectedCapabilities.length > 0 ||
                missingCapabilities.length > 0) && (
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background p-5">
                    <p className="font-medium">
                      Architecture Styles
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      High-level engineering patterns currently
                      detected in this repository.
                    </p>

                    <div className="mt-4">
                      <BadgeGroup
                        items={architectureStyles}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-background p-5">
                    <p className="font-medium">
                      Detected Capabilities
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Engineering capabilities currently
                      contributing to the repository&apos;s
                      architecture profile.
                    </p>

                    <div className="mt-4">
                      <BadgeGroup
                        items={detectedCapabilities}
                      />
                    </div>

                    {missingCapabilities.length > 0 && (
                      <div className="mt-5 border-t border-border pt-5">
                        <p className="text-sm font-medium">
                          Missing Capabilities
                        </p>

                        <div className="mt-3">
                          <BadgeGroup
                            items={missingCapabilities}
                            variant="outline"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </IntelligenceSection>

            {/* Historical metrics are deliberately displayed as counts. */}
            <IntelligenceSection
              title="Historical Evolution"
              description="Recorded architecture activity observed by ArcHive over time. These values represent historical evidence, not quality scores."
            >
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <EvolutionMetricCard
                  label="Recorded Changes"
                  value={totalChanges.toLocaleString()}
                  icon={GitBranch}
                  description="Architecture-level changes recorded by ArcHive."
                />

                <EvolutionMetricCard
                  label="Domains Affected"
                  value={totalDomains.toLocaleString()}
                  icon={Boxes}
                  description="Distinct architecture domains represented in the recorded evolution history."
                />

                <EvolutionMetricCard
                  label="Most Active Domain"
                  value={
                    mostActiveDomain
                      ? formatFilterLabel(mostActiveDomain)
                      : "Unknown"
                  }
                  icon={Network}
                  description="Architecture area with the highest amount of recorded evolution."
                />

                <EvolutionMetricCard
                  label="Latest Activity"
                  value={latestActivity}
                  icon={GitBranch}
                  description="Most recent grouped architecture evolution signal."
                />
              </div>
            </IntelligenceSection>

            <IntelligenceSection
              title="Evolution Search"
              description="Search architecture domains, technologies, files, change types, and evolution summaries."
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
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
                  <p className="font-medium">
                    No matching domains found
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Try another search term or clear the
                    search field.
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
                              {domain.label ||
                                formatFilterLabel(
                                  domain.domain
                                )}
                            </h3>

                            <Badge variant="secondary">
                              {domain.totalChanges} changes
                            </Badge>
                          </div>

                          <p className="mt-2 text-sm text-muted-foreground">
                            Latest activity:{" "}
                            {domain.latestChangeAt
                              ? new Date(
                                  domain.latestChangeAt
                                ).toLocaleString()
                              : "Unknown"}
                          </p>
                        </div>

                        <Boxes className="h-5 w-5 text-primary" />
                      </div>

                      {domain.technologies &&
                        domain.technologies.length > 0 && (
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
                        {domain.changes
                          .slice(0, 3)
                          .map((change) => (
                            <div
                              key={change.id}
                              className="rounded-lg border border-border bg-card p-4"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline">
                                  {formatFilterLabel(
                                    change.changeType
                                  )}
                                </Badge>

                                {change.detectedTechnology && (
                                  <Badge variant="secondary">
                                    {
                                      change.detectedTechnology
                                    }
                                  </Badge>
                                )}
                              </div>

                              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                {change.summary ||
                                  "Architecture change detected."}
                              </p>

                              {change.evolutionSummary && (
                                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                  {
                                    change.evolutionSummary
                                  }
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
                            +{domain.changes.length - 3} more
                            changes hidden for readability.
                          </p>
                        )}

                        {domain.changes.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            No matching changes in this
                            domain.
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
                    <p className="font-medium">
                      Recent Evolution Summaries
                    </p>
                  </div>

                  <div className="mt-4">
                    <InsightList
                      items={domains
                        .flatMap((domain) =>
                          domain.changes.map(
                            (change) =>
                              change.evolutionSummary
                          )
                        )
                        .filter(
                          (item): item is string =>
                            Boolean(item)
                        )}
                      limit={5}
                      empty="No evolution summaries available yet."
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background p-5">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-primary" />
                    <p className="font-medium">
                      Recent Architecture Changes
                    </p>
                  </div>

                  <div className="mt-4">
                    <InsightList
                      items={domains
                        .flatMap((domain) =>
                          domain.changes.map(
                            (change) => change.summary
                          )
                        )
                        .filter(
                          (item): item is string =>
                            Boolean(item)
                        )}
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
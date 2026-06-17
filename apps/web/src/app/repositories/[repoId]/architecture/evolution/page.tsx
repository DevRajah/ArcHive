"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ArchitectureDomainOverview } from "@/components/architecture/ArchitectureDomainOverview";
import { ArchitectureEvolutionFilters } from "@/components/architecture/ArchitectureEvolutionFilters";
import { ArchitectureEvolutionLanes } from "@/components/architecture/ArchitectureEvolutionLanes";
import { ArchitectureEvolutionSummary } from "@/components/architecture/ArchitectureEvolutionSummary";
import { ArchitectureIntelligenceGraph } from "@/components/architecture/ArchitectureIntelligenceGraph";
import { RepositoryLiveStatus } from "@/components/repositories/RepositoryLiveStatus";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepositoryArchitectureEvolution } from "@/hooks/useArchitecture";
import { useRepositoryLiveStatus } from "@/hooks/useRepositoryLiveStatus";
import { formatFilterLabel, matchesSearch } from "@/lib/filters";
import { RepositoryIntelligenceNav } from "@/components/repositories/RepositoryIntelligenceNav";
import { PageContent } from "@/components/layout/PageContent";

export default function ArchitectureEvolutionPage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params.repoId;

  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("ALL");

  const liveStatus = useRepositoryLiveStatus(repoId);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useRepositoryArchitectureEvolution(repoId);

  const domainOptions = useMemo(() => {
    if (!data?.domains) return [];

    return data.domains.map((domain) => domain.domain);
  }, [data?.domains]);

  const filteredDomains = useMemo(() => {
    if (!data?.domains) return [];

    const query = search.trim();

    return data.domains
      .filter((domain) => {
        const matchesDomain =
          selectedDomain === "ALL" || domain.domain === selectedDomain;

        const matchesQuery =
          !query ||
          matchesSearch(domain.label, query) ||
          matchesSearch(domain.domain, query) ||
          domain.technologies.some((technology) =>
            matchesSearch(technology, query)
          ) ||
          domain.changes.some((change) => {
            return (
              matchesSearch(change.changeType, query) ||
              matchesSearch(change.summary, query) ||
              matchesSearch(change.evolutionSummary, query) ||
              matchesSearch(change.detectedTechnology, query) ||
              matchesSearch(change.fileAffected, query)
            );
          });

        return matchesDomain && matchesQuery;
      })
      .map((domain) => {
        if (!query) return domain;

        return {
          ...domain,
          changes: domain.changes.filter((change) => {
            return (
              matchesSearch(change.changeType, query) ||
              matchesSearch(change.summary, query) ||
              matchesSearch(change.evolutionSummary, query) ||
              matchesSearch(change.detectedTechnology, query) ||
              matchesSearch(change.fileAffected, query)
            );
          }),
        };
      });
  }, [data?.domains, search, selectedDomain]);

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
        <RepositoryIntelligenceNav repositoryId={repoId} />

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

            {data.insights?.architectureStyles &&
              data.insights.architectureStyles.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold">
                    Architecture Styles
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    High-level engineering patterns detected across this
                    repository.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {data.insights.architectureStyles.map((style) => (
                      <Badge key={style} variant="secondary">
                        {formatFilterLabel(style)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {data.domains.length > 0 && (
              <ArchitectureEvolutionFilters
                search={search}
                onSearchChange={setSearch}
                selectedDomain={selectedDomain}
                onDomainChange={setSelectedDomain}
                domains={domainOptions}
              />
            )}

            <ArchitectureDomainOverview domains={filteredDomains} />

            <ArchitectureIntelligenceGraph
              data={{
                ...data,
                domains: filteredDomains,
              }}
            />

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
            ) : filteredDomains.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-10 text-center">
                <h2 className="text-xl font-semibold">
                  No matching evolution signals
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your search or selected architecture domain.
                </p>
              </div>
            ) : (
              <ArchitectureEvolutionLanes domains={filteredDomains} />
            )}
          </>
        )}
      </PageContent>
    </AppShell>
  );
}
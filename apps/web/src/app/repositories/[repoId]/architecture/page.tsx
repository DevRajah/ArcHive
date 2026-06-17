"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Network,
  ShieldCheck,
  Database,
  Boxes,
  ServerCog,
  GitBranch,
  GitGraph
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ActivityFilters } from "@/components/filters/ActivityFilters";
import { RepositoryLiveStatus } from "@/components/repositories/RepositoryLiveStatus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepositoryArchitecture } from "@/hooks/useArchitecture";
import { useRepositoryLiveStatus } from "@/hooks/useRepositoryLiveStatus";
import { formatFilterLabel, matchesSearch } from "@/lib/filters";
import { RepositoryIntelligenceNav } from "@/components/repositories/RepositoryIntelligenceNav";

function formatLabel(value?: string | null) {
  if (!value || value === "UNKNOWN") return "Architecture Change";

  return formatFilterLabel(value);
}

function getArchitectureIcon(value?: string | null) {
  if (!value) return Network;

  if (value.includes("AUTH") || value.includes("SECURITY")) {
    return ShieldCheck;
  }

  if (
    value.includes("DATABASE") ||
    value.includes("PRISMA") ||
    value.includes("SCHEMA")
  ) {
    return Database;
  }

  if (
    value.includes("QUEUE") ||
    value.includes("WORKER") ||
    value.includes("BULLMQ")
  ) {
    return ServerCog;
  }

  if (
    value.includes("REDIS") ||
    value.includes("CACHE") ||
    value.includes("INFRASTRUCTURE")
  ) {
    return Boxes;
  }

  if (value.includes("API") || value.includes("ROUTE")) {
    return GitBranch;
  }

  return Network;
}

export default function ArchitecturePage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params.repoId;

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");

  const {
    data: architectureChanges,
    isLoading,
    isError,
    error,
  } = useRepositoryArchitecture(repoId);

  const liveStatus = useRepositoryLiveStatus(repoId);
  const totalChanges = architectureChanges?.length ?? 0;

  const architectureTypes = useMemo(() => {
    if (!architectureChanges) return [];

    return Array.from(
      new Set(
        architectureChanges
          .map((change) => change.changeType)
          .filter((changeType): changeType is string => Boolean(changeType))
      )
    );
  }, [architectureChanges]);

  const filteredChanges = useMemo(() => {
    if (!architectureChanges) return [];

    const query = search.trim();

    return architectureChanges.filter((change) => {
      const matchesType =
        selectedType === "ALL" || change.changeType === selectedType;

      const matchesQuery =
        !query ||
        matchesSearch(change.changeType, query) ||
        matchesSearch(change.summary, query) ||
        matchesSearch(change.description, query) ||
        matchesSearch(change.detectedTechnology, query) ||
        matchesSearch(change.fileAffected, query);

      return matchesType && matchesQuery;
    });
  }, [architectureChanges, search, selectedType]);

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
              <h1 className="text-3xl font-bold tracking-tight">
                Architecture Intelligence
              </h1>

              <p className="mt-2 max-w-3xl text-muted-foreground">
                System-level architecture changes detected from repository
                activity, webhook events, infrastructure updates, and codebase
                evolution.
              </p>

              <div className="mt-4">
                <RepositoryLiveStatus
                  isConnected={liveStatus.isConnected}
                  lastUpdatedAt={liveStatus.lastUpdatedAt}
                />
              </div>
            </div>



            <div className="flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href={`/repositories/${repoId}/architecture/evolution`}>
                  <GitGraph className="mr-2 h-4 w-4" />
                  View Evolution
                </Link>
              </Button>

              <Badge variant="secondary">{totalChanges} changes</Badge>
            </div>          </div>
        </div>

        <RepositoryIntelligenceNav repositoryId={repoId} />

        {!isLoading &&
          !isError &&
          architectureChanges &&
          architectureChanges.length > 0 && (
            <ActivityFilters
              search={search}
              onSearchChange={setSearch}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              types={architectureTypes}
            />
          )}

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-44 rounded-xl" />
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
                ArcHive has not detected system-level architectural evolution
                for this repository yet.
              </p>
            </div>
          )}

        {!isLoading &&
          !isError &&
          architectureChanges &&
          architectureChanges.length > 0 &&
          filteredChanges.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <h2 className="text-xl font-semibold">
                No matching architecture changes
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your filters or search query.
              </p>
            </div>
          )}

        {!isLoading &&
          !isError &&
          architectureChanges &&
          architectureChanges.length > 0 &&
          filteredChanges.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredChanges.map((change) => {
                const title =
                  change.changeType || change.title || "Architecture Change";

                const description =
                  change.summary ||
                  change.description ||
                  "ArcHive detected a repository architecture change.";

                const Icon = getArchitectureIcon(title);

                return (
                  <div
                    key={change.id}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>

                        <div>
                          <h2 className="font-semibold">
                            {formatLabel(title)}
                          </h2>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(change.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <Badge variant="secondary">
                        {formatLabel(change.severity || change.changeType)}
                      </Badge>
                    </div>

                    <p className="text-sm leading-6 text-muted-foreground">
                      {description}
                    </p>

                    {change.detectedTechnology && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Technology: {change.detectedTechnology}
                      </p>
                    )}

                    {change.fileAffected && (
                      <p className="mt-1 break-all text-xs text-muted-foreground">
                        File: {change.fileAffected}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </AppShell>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  GitCompareArrows,
  GitFork,
  Layers3,
  Network,
  RefreshCcw,
  SearchX,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { PortfolioNavigation } from "@/components/portfolio/PortfolioNavigation";

import { DependencyEmptyState } from "@/components/dependencies/DependencyEmptyState";
import { DependencyScoreCard } from "@/components/dependencies/DependencyScoreCard";
import { RelationshipStrength } from "@/components/dependencies/RelationshipStrength";
import { RiskLevelBadge } from "@/components/dependencies/RiskLevelBadge";
import { TechnologyRelationshipCard } from "@/components/dependencies/TechnologyRelationshipCard";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useTechnologyDependencyDetail } from "@/hooks/useDependencyIntelligence";
import { getUserId } from "@/lib/auth";
import { formatIntelligenceLabel } from "@/lib/intelligence-labels";

import type {
  NamedDependencyCount,
  TechnologyDependencyRepository,
} from "@/types/dependency-intelligence.types";

function decodeTechnology(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getStatus(error: unknown) {
  return axios.isAxiosError(error)
    ? error.response?.status ?? null
    : null;
}

function scoreLabel(value?: number | null) {
  const score =
    typeof value === "number" && Number.isFinite(value)
      ? value
      : 0;

  return score <= 1
    ? `${Math.round(score * 100)}%`
    : score.toLocaleString();
}

function formatDate(value?: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Unknown"
    : date.toLocaleDateString();
}

export default function TechnologyDependencyDetailPage() {
  const params = useParams<{ technology: string }>();
  const router = useRouter();
  const userId = getUserId();

  const technologyName = useMemo(
    () => decodeTechnology(params.technology),
    [params.technology]
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useTechnologyDependencyDetail(userId, technologyName);

  const status = getStatus(error);

  useEffect(() => {
    if (status === 401) {
      router.replace("/connect-github");
    }
  }, [router, status]);

  return (
    <AppShell>
      <PageContent>
        <PortfolioNavigation />

        <Button asChild variant="ghost" className="px-0">
          <Link href="/portfolio/dependencies">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dependency Intelligence
          </Link>
        </Button>

        {isLoading && <DetailSkeleton />}

        {isError && status === 403 && (
          <ErrorState
            icon={ShieldAlert}
            title="Dependency detail access denied"
            description="The current ArcHive account cannot view this technology."
          />
        )}

        {isError && status === 404 && (
          <ErrorState
            icon={SearchX}
            title="Technology not found in this dependency portfolio"
            description={`${technologyName} does not appear in the current portfolio dependency intelligence.`}
          />
        )}

        {isError &&
          status !== 401 &&
          status !== 403 &&
          status !== 404 && (
            <ErrorState
              icon={TriangleAlert}
              title="Failed to load dependency detail"
              description={
                error instanceof Error
                  ? error.message
                  : "ArcHive could not load this technology."
              }
              onRetry={() => refetch()}
            />
          )}

        {!isLoading && !isError && data && (
          <>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col justify-between gap-5 lg:flex-row">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">
                      {data.technology.technology}
                    </h1>

                    <RiskLevelBadge
                      riskLevel={data.technology.riskLevel}
                    />
                  </div>

                  <p className="mt-2 max-w-4xl text-muted-foreground">
                    Explore where this technology appears, which
                    technologies commonly appear with it, and how deeply
                    it is embedded across the engineering portfolio.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      Centrality{" "}
                      {scoreLabel(data.technology.centralityScore)}
                    </Badge>

                    <Badge variant="secondary">
                      Impact {scoreLabel(data.technology.impactScore)}
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={isFetching}
                >
                  <RefreshCcw
                    className={`mr-2 h-4 w-4 ${
                      isFetching ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DependencyScoreCard
                label="Repositories"
                value={data.technology.repositoryCount}
                icon={GitFork}
              />

              <DependencyScoreCard
                label="Tracked Repositories"
                value={data.technology.trackedRepositoryCount}
                icon={Activity}
              />

              <DependencyScoreCard
                label="Connected Technologies"
                value={data.technology.connectedTechnologyCount}
                icon={GitCompareArrows}
              />

              <DependencyScoreCard
                label="Architecture Domains"
                value={data.technology.architectureDomains.length}
                icon={Layers3}
              />

              <DependencyScoreCard
                label="Repository Types"
                value={data.technology.repositoryTypes.length}
                icon={Network}
              />

              <DependencyScoreCard
                label="Capabilities"
                value={data.technology.capabilities.length}
                icon={Sparkles}
              />

              <DependencyScoreCard
                label="Centrality Score"
                value={scoreLabel(data.technology.centralityScore)}
                icon={Network}
              />

              <DependencyScoreCard
                label="Impact Score"
                value={scoreLabel(data.technology.impactScore)}
                icon={Activity}
              />
            </div>

            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Repositories</h2>

              {data.repositories.length === 0 ? (
                <DependencyEmptyState
                  title="No repository usage found"
                  description="No repositories currently expose this technology in dependency intelligence."
                />
              ) : (
                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  {data.repositories.map((repository) => (
                    <RepositoryCard
                      key={repository.id}
                      repository={repository}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">
                Related Technologies
              </h2>

              {data.relatedTechnologies.length === 0 ? (
                <DependencyEmptyState
                  title="No related technologies"
                  description="ArcHive has not detected other technologies sharing repository usage with this technology."
                />
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {data.relatedTechnologies.map((technology, index) => {
                    const name =
                      technology.technology ||
                      technology.name ||
                      `Technology ${index + 1}`;

                    const sharedCount =
                      technology.sharedRepositoryCount ??
                      technology.sharedRepositories ??
                      0;

                    return (
                      <article
                        key={`${name}-${index}`}
                        className="rounded-xl border border-border bg-background p-5"
                      >
                        <h3 className="font-semibold">{name}</h3>

                        <p className="mt-2 text-sm text-muted-foreground">
                          {sharedCount} shared repositories
                        </p>

                        <div className="mt-4">
                          <RelationshipStrength
                            value={technology.strength}
                          />
                        </div>

                        {technology.sharedRepositoryNames &&
                          technology.sharedRepositoryNames.length >
                            0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {technology.sharedRepositoryNames.map(
                                (repository, repositoryIndex) => (
                                  <Badge
                                    key={`${repository}-${repositoryIndex}`}
                                    variant="outline"
                                  >
                                    {repository}
                                  </Badge>
                                )
                              )}
                            </div>
                          )}

                        <div className="mt-5 grid gap-2">
                          <Button asChild variant="outline">
                            <Link
                              href={`/portfolio/dependencies/${encodeURIComponent(
                                name
                              )}`}
                            >
                              Dependency Detail
                            </Link>
                          </Button>

                          <Button asChild>
                            <Link
                              href={`/portfolio/impact/${encodeURIComponent(
                                name
                              )}`}
                            >
                              Impact Report
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">
                Relationship Evidence
              </h2>

              {data.relationships.length === 0 ? (
                <DependencyEmptyState
                  title="No relationship evidence"
                  description="No technology co-occurrence relationships are currently recorded."
                />
              ) : (
                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  {data.relationships.map((relationship, index) => (
                    <TechnologyRelationshipCard
                      key={`${relationship.source}-${relationship.target}-${index}`}
                      relationship={relationship}
                      showActions={false}
                    />
                  ))}
                </div>
              )}
            </section>

            <div className="grid gap-6 xl:grid-cols-3">
              <RankedList
                title="Architecture Domains"
                items={data.architectureDomains}
              />

              <RankedList
                title="Repository Types"
                items={data.repositoryTypes}
              />

              <RankedList
                title="Capabilities"
                items={data.capabilities}
              />
            </div>
          </>
        )}
      </PageContent>
    </AppShell>
  );
}

function RepositoryCard({
  repository,
}: {
  repository: TechnologyDependencyRepository;
}) {
  return (
    <article className="rounded-xl border border-border bg-background p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">
            {repository.fullName || repository.name}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {repository.language || "Language unavailable"}
          </p>
        </div>

        <Badge variant={repository.isTracked ? "default" : "outline"}>
          {repository.isTracked ? "Tracked" : "Not tracked"}
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="secondary">
          {repository.relationshipCount ?? 0} relationships
        </Badge>

        <Badge variant="outline">
          Updated{" "}
          {formatDate(
            repository.lastUpdatedAt || repository.updatedAt
          )}
        </Badge>
      </div>

      <RepositorySignals
        title="Technologies"
        values={repository.technologies}
      />

      <RepositorySignals
        title="Architecture Domains"
        values={repository.architectureDomains}
      />

      <RepositorySignals
        title="Repository Types"
        values={repository.repositoryTypes}
      />

      <RepositorySignals
        title="Capabilities"
        values={repository.capabilities}
      />

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <RepositoryLink
          href={`/repositories/${repository.id}`}
          label="Overview"
        />

        <RepositoryLink
          href={`/repositories/${repository.id}/intelligence`}
          label="Intelligence"
        />

        <RepositoryLink
          href={`/repositories/${repository.id}/architecture`}
          label="Architecture"
        />

        <RepositoryLink
          href={`/repositories/${repository.id}/timeline`}
          label="Timeline"
        />

        <RepositoryLink
          href={`/repositories/${repository.id}/knowledge-graph`}
          label="Knowledge Graph"
        />

        <RepositoryLink
          href={`/repositories/${repository.id}/intelligence/diff`}
          label="Intelligence Diff"
        />
      </div>
    </article>
  );
}

function RepositorySignals({
  title,
  values,
}: {
  title: string;
  values?: string[];
}) {
  if (!values?.length) return null;

  return (
    <div className="mt-4">
      <p className="text-xs font-medium text-muted-foreground">
        {title}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((value, index) => (
          <Badge key={`${value}-${index}`} variant="outline">
            {formatIntelligenceLabel(value)}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function RepositoryLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Button asChild variant="outline" size="sm">
      <Link href={href}>{label}</Link>
    </Button>
  );
}

function RankedList({
  title,
  items,
}: {
  title: string;
  items: NamedDependencyCount[];
}) {
  const sorted = [...items].sort(
    (first, second) => second.count - first.count
  );

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-semibold">{title}</h2>

      {sorted.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No {title.toLowerCase()} available.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {sorted.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3"
            >
              <span className="text-sm font-medium">
                {formatIntelligenceLabel(item.name)}
              </span>

              <Badge variant="secondary">{item.count}</Badge>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-52 rounded-xl" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-80 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function ErrorState({
  icon: Icon,
  title,
  description,
  onRetry,
}: {
  icon: typeof TriangleAlert;
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-10 text-center">
      <Icon className="mx-auto h-9 w-9 text-muted-foreground" />
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
        {description}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          className="mt-6"
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </div>
  );
}
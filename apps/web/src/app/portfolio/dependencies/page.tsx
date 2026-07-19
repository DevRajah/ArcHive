"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  GitCompareArrows,
  GitFork,
  Network,
  RefreshCcw,
  Search,
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
import { RiskLevelBadge } from "@/components/dependencies/RiskLevelBadge";
import { TechnologyRelationshipCard } from "@/components/dependencies/TechnologyRelationshipCard";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { useDependencyOverview } from "@/hooks/useDependencyIntelligence";
import { getUserId } from "@/lib/auth";

import type {
  DependencyOverviewSort,
  DependencyRiskLevel,
  TechnologyDependencyNode,
} from "@/types/dependency-intelligence.types";

function getStatus(error: unknown) {
  return axios.isAxiosError(error)
    ? error.response?.status ?? null
    : null;
}

function riskRank(value?: DependencyRiskLevel) {
  if (value === "CRITICAL") return 4;
  if (value === "HIGH") return 3;
  if (value === "MEDIUM") return 2;
  return 1;
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

export default function DependencyIntelligencePage() {
  const router = useRouter();
  const userId = getUserId();

  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("");
  const [minimumCentrality, setMinimumCentrality] = useState(0);
  const [minimumImpact, setMinimumImpact] = useState(0);
  const [trackedOnly, setTrackedOnly] = useState(false);
  const [sort, setSort] =
    useState<DependencyOverviewSort>("CENTRALITY");

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useDependencyOverview(userId);

  const status = getStatus(error);

  useEffect(() => {
    if (status === 401) {
      router.replace("/connect-github");
    }
  }, [router, status]);

  const technologies = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...(data?.technologies ?? [])]
      .filter((technology) => {
        return (
          technology.technology.toLowerCase().includes(query) &&
          (!risk || technology.riskLevel === risk) &&
          technology.centralityScore >= minimumCentrality &&
          technology.impactScore >= minimumImpact &&
          (!trackedOnly || technology.trackedRepositoryCount > 0)
        );
      })
      .sort((first, second) => {
        if (sort === "IMPACT") {
          return second.impactScore - first.impactScore;
        }

        if (sort === "REPOSITORIES") {
          return second.repositoryCount - first.repositoryCount;
        }

        if (sort === "CONNECTIONS") {
          return (
            second.connectedTechnologyCount -
            first.connectedTechnologyCount
          );
        }

        if (sort === "RISK") {
          return (
            riskRank(second.riskLevel) -
            riskRank(first.riskLevel)
          );
        }

        if (sort === "ALPHABETICAL") {
          return first.technology.localeCompare(second.technology);
        }

        return second.centralityScore - first.centralityScore;
      });
  }, [
    data?.technologies,
    minimumCentrality,
    minimumImpact,
    risk,
    search,
    sort,
    trackedOnly,
  ]);

  return (
    <AppShell>
      <PageContent>
        <PortfolioNavigation />

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Engineering Dependency Intelligence
              </h1>

              <p className="mt-2 max-w-4xl text-muted-foreground">
                Understand how technologies are connected across your
                repositories, which technologies are most central, and
                where engineering changes may have the widest portfolio
                impact.
              </p>

              <div className="mt-4 rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
                ArcHive currently derives these relationships from shared
                repository usage and intelligence signals. They represent
                engineering affinity, not confirmed runtime dependency
                direction.
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

        {isLoading && <OverviewSkeleton />}

        {isError && status === 403 && (
          <PageError
            icon={ShieldAlert}
            title="Dependency Intelligence access denied"
            description="The current ArcHive account cannot access this portfolio."
          />
        )}

        {isError && status === 404 && (
          <PageError
            icon={SearchX}
            title="Portfolio not found"
            description="ArcHive could not find dependency intelligence for this portfolio."
          />
        )}

        {isError &&
          status !== 401 &&
          status !== 403 &&
          status !== 404 && (
            <PageError
              icon={TriangleAlert}
              title="Failed to load Dependency Intelligence"
              description={
                error instanceof Error
                  ? error.message
                  : "ArcHive could not load the portfolio relationships."
              }
              onRetry={() => refetch()}
            />
          )}

        {!isLoading && !isError && data && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DependencyScoreCard
                label="Total Repositories"
                value={data.summary.totalRepositories}
                icon={GitFork}
              />

              <DependencyScoreCard
                label="Tracked Repositories"
                value={data.summary.trackedRepositories}
                icon={Activity}
              />

              <DependencyScoreCard
                label="Total Technologies"
                value={data.summary.totalTechnologies}
                icon={Network}
              />

              <DependencyScoreCard
                label="Technology Relationships"
                value={data.summary.totalRelationships}
                icon={GitCompareArrows}
              />

              <DependencyScoreCard
                label="Most Central Technology"
                value={
                  data.summary.mostCentralTechnology?.technology ||
                  "Not available"
                }
                description={
                  data.summary.mostCentralTechnology
                    ? `Centrality: ${scoreLabel(
                        data.summary.mostCentralTechnology.centralityScore
                      )}`
                    : undefined
                }
                icon={Sparkles}
              />

              <DependencyScoreCard
                label="Highest Impact Technology"
                value={
                  data.summary.highestImpactTechnology?.technology ||
                  "Not available"
                }
                description={
                  data.summary.highestImpactTechnology
                    ? `Impact: ${scoreLabel(
                        data.summary.highestImpactTechnology.impactScore
                      )}`
                    : undefined
                }
                icon={AlertTriangle}
              />

              <DependencyScoreCard
                label="Critical Technologies"
                value={data.summary.criticalTechnologies}
                icon={AlertTriangle}
              />

              <DependencyScoreCard
                label="High-Risk Technologies"
                value={data.summary.highRiskTechnologies}
                icon={AlertTriangle}
              />
            </div>

            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">
                Strongest Co-occurrence Relationship
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                The strongest shared repository usage detected across
                portfolio technologies.
              </p>

              <div className="mt-5">
                {data.summary.strongestRelationship ? (
                  <TechnologyRelationshipCard
                    relationship={data.summary.strongestRelationship}
                  />
                ) : (
                  <DependencyEmptyState
                    title="No strongest relationship available"
                    description="ArcHive has not detected enough shared repository usage to identify a strongest relationship."
                  />
                )}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search technologies..."
                    className="pl-9"
                  />
                </div>

                <select
                  value={risk}
                  onChange={(event) => setRisk(event.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">All risk levels</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>

                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(
                      event.target.value as DependencyOverviewSort
                    )
                  }
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="CENTRALITY">
                    Highest Centrality
                  </option>
                  <option value="IMPACT">Highest Impact</option>
                  <option value="REPOSITORIES">
                    Most Repositories
                  </option>
                  <option value="CONNECTIONS">
                    Most Connections
                  </option>
                  <option value="RISK">Risk Level</option>
                  <option value="ALPHABETICAL">
                    Alphabetical
                  </option>
                </select>

                <NumberFilter
                  label="Minimum centrality"
                  value={minimumCentrality}
                  onChange={setMinimumCentrality}
                />

                <NumberFilter
                  label="Minimum impact"
                  value={minimumImpact}
                  onChange={setMinimumImpact}
                />

                <label className="flex h-10 items-center gap-3 rounded-md border border-input bg-background px-3 text-sm">
                  <input
                    type="checkbox"
                    checked={trackedOnly}
                    onChange={(event) =>
                      setTrackedOnly(event.target.checked)
                    }
                  />
                  Used by tracked repositories only
                </label>
              </div>
            </section>

            {data.technologies.length === 0 ? (
              <DependencyEmptyState
                title="No dependency intelligence available"
                description="Generate repository intelligence first so ArcHive can detect technology co-occurrence relationships."
                showRepositoriesLink
              />
            ) : technologies.length === 0 ? (
              <DependencyEmptyState
                title="No technologies match these filters"
                description="Change or clear the current filters to reveal more portfolio technologies."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {technologies.map((technology) => (
                  <TechnologyDependencyCard
                    key={technology.technology}
                    technology={technology}
                  />
                ))}
              </div>
            )}

            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">
                Relationship Explorer
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Technology co-occurrence and shared repository usage
                relationships.
              </p>

              {data.relationships.length === 0 ? (
                <DependencyEmptyState
                  title="No relationships detected"
                  description="ArcHive has not detected technology co-occurrence across multiple repositories yet."
                />
              ) : (
                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  {data.relationships.map((relationship, index) => (
                    <TechnologyRelationshipCard
                      key={`${relationship.source}-${relationship.target}-${index}`}
                      relationship={relationship}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </PageContent>
    </AppShell>
  );
}

function TechnologyDependencyCard({
  technology,
}: {
  technology: TechnologyDependencyNode;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="break-words text-lg font-semibold">
          {technology.technology}
        </h2>

        <RiskLevelBadge riskLevel={technology.riskLevel} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric label="Repositories" value={technology.repositoryCount} />
        <Metric
          label="Tracked"
          value={technology.trackedRepositoryCount}
        />
        <Metric
          label="Connections"
          value={technology.connectedTechnologyCount}
        />
        <Metric
          label="Domains"
          value={technology.architectureDomains.length}
        />
        <Metric
          label="Capabilities"
          value={technology.capabilities.length}
        />
        <Metric
          label="Centrality"
          value={scoreLabel(technology.centralityScore)}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="secondary">
          Impact {scoreLabel(technology.impactScore)}
        </Badge>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <Button asChild variant="outline">
          <Link
            href={`/portfolio/dependencies/${encodeURIComponent(
              technology.technology
            )}`}
          >
            Dependency Detail
          </Link>
        </Button>

        <Button asChild>
          <Link
            href={`/portfolio/impact/${encodeURIComponent(
              technology.technology
            )}`}
          >
            Impact Report
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-bold">
        {typeof value === "number"
          ? value.toLocaleString()
          : value}
      </p>
    </div>
  );
}

function NumberFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input
        type="number"
        min={0}
        step={0.1}
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value) || 0)
        }
      />
    </label>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-80 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-80 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function PageError({
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
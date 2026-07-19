"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useTechnologyImpact } from "@/hooks/useDependencyIntelligence";
import { getUserId } from "@/lib/auth";
import { formatIntelligenceLabel } from "@/lib/intelligence-labels";

import type {
  AffectedRepository,
  NamedDependencyCount,
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

export default function TechnologyImpactPage() {
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
  } = useTechnologyImpact(userId, technologyName);

  const status = getStatus(error);

  useEffect(() => {
    if (status === 401) {
      router.replace("/connect-github");
    }
  }, [router, status]);

  const affectedRepositories = useMemo(() => {
    return [...(data?.affectedRepositories ?? [])].sort(
      (first, second) =>
        second.impactContributionScore -
        first.impactContributionScore
    );
  }, [data?.affectedRepositories]);

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

        {isLoading && <ImpactSkeleton />}

        {isError && status === 403 && (
          <ErrorState
            icon={ShieldAlert}
            title="Impact Report access denied"
            description="The current ArcHive account cannot access this report."
          />
        )}

        {isError && status === 404 && (
          <ErrorState
            icon={SearchX}
            title="Technology not found in this engineering portfolio"
            description={`${technologyName} does not appear in the current portfolio intelligence.`}
          />
        )}

        {isError &&
          status !== 401 &&
          status !== 403 &&
          status !== 404 && (
            <ErrorState
              icon={TriangleAlert}
              title="Failed to load Impact Report"
              description={
                error instanceof Error
                  ? error.message
                  : "ArcHive could not load this report."
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
                      {data.technology} Impact Report
                    </h1>

                    <RiskLevelBadge
                      riskLevel={data.summary.riskLevel}
                    />

                    <Badge variant="secondary">
                      Impact {scoreLabel(data.summary.impactScore)}
                    </Badge>
                  </div>

                  <h2 className="mt-5 text-xl font-semibold">
                    {data.explanation?.headline ||
                      "Portfolio engineering exposure"}
                  </h2>

                  <p className="mt-2 max-w-4xl text-muted-foreground">
                    {data.explanation?.description ||
                      "ArcHive estimated portfolio exposure from shared technology usage."}
                  </p>

                  <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700">
                    This report estimates engineering exposure from
                    portfolio-wide co-occurrence and intelligence
                    signals. It does not confirm runtime failure or
                    package dependency direction.
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
                  Refresh Report
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DependencyScoreCard
                label="Affected Repositories"
                value={data.summary.affectedRepositoryCount}
                icon={GitFork}
              />

              <DependencyScoreCard
                label="Tracked Repositories"
                value={data.summary.trackedRepositoryCount}
                icon={Activity}
              />

              <DependencyScoreCard
                label="Related Technologies"
                value={data.summary.relatedTechnologyCount}
                icon={Network}
              />

              <DependencyScoreCard
                label="Architecture Domains"
                value={data.summary.architectureDomainCount}
                icon={Layers3}
              />

              <DependencyScoreCard
                label="Repository Types"
                value={data.summary.repositoryTypeCount}
                icon={Network}
              />

              <DependencyScoreCard
                label="Capabilities"
                value={data.summary.capabilityCount}
                icon={Sparkles}
              />

              <DependencyScoreCard
                label="Impact Score"
                value={scoreLabel(data.summary.impactScore)}
                icon={AlertTriangle}
              />

              <DependencyScoreCard
                label="Risk Level"
                value={data.summary.riskLevel}
                icon={AlertTriangle}
              />
            </div>

            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">
                Affected Repositories
              </h2>

              {affectedRepositories.length === 0 ? (
                <DependencyEmptyState
                  title="No affected repositories"
                  description="ArcHive has not identified repository exposure for this technology."
                />
              ) : (
                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  {affectedRepositories.map((repository) => (
                    <AffectedRepositoryCard
                      key={repository.id}
                      repository={repository}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Warnings</h2>

              {data.warnings.length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
                  No major portfolio-wide dependency warnings detected.
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {data.warnings.map((warning, index) => (
                    <div
                      key={`${warning}-${index}`}
                      className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4"
                    >
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                      <p className="text-sm leading-6">{warning}</p>
                    </div>
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
                  description="No portfolio-wide co-occurrence relationships are currently available."
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

            <div className="grid gap-6 xl:grid-cols-3">
              <ExposureList
                title="Architecture Domains"
                items={data.architectureDomains}
              />

              <ExposureList
                title="Repository Types"
                items={data.repositoryTypes}
              />

              <ExposureList
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

function AffectedRepositoryCard({
  repository,
}: {
  repository: AffectedRepository;
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

      <div className="mt-4 rounded-lg border border-border bg-card p-3">
        <p className="text-xs text-muted-foreground">
          Impact Contribution
        </p>

        <p className="mt-1 text-xl font-bold">
          {scoreLabel(repository.impactContributionScore)}
        </p>
      </div>

      <SignalList
        title="Related Technologies"
        values={repository.relatedTechnologies}
      />

      <SignalList
        title="Architecture Domains"
        values={repository.architectureDomains}
      />

      <SignalList
        title="Repository Types"
        values={repository.repositoryTypes}
      />

      <SignalList
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

function SignalList({
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

function ExposureList({
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
          No {title.toLowerCase()} exposure detected.
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

function ImpactSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-72 rounded-xl" />

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
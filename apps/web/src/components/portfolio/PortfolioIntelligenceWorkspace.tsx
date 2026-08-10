"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Boxes,
  Brain,
  CircleGauge,
  GitBranch,
  GitFork,
  History,
  Layers3,
  Lightbulb,
  Network,
  RefreshCcw,
  Sparkles,
  Star,
  TriangleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { BadgeGroup } from "@/components/intelligence-v2/BadgeGroup";
import { IntelligenceSection } from "@/components/intelligence-v2/IntelligenceSection";

import { useIntelligenceOverview } from "@/hooks/useRepositories";
import { usePortfolioOperations } from "@/hooks/usePortfolioOperations";

import { getUserId } from "@/lib/auth";
import { formatFilterLabel } from "@/lib/filters";

import type {
  PortfolioDistributionItem,
  PortfolioHighlightRepository,
  PortfolioSummary,
} from "@/types/portfolio.types";
import { formatIntelligenceLabel } from "@/lib/intelligence-labels";

type IntelligenceOverviewItem = {
  repository: {
    id: string;
    name: string;
    fullName?: string | null;
    language?: string | null;
  };

  semanticProfile?: {
    semanticLabel?: string | null;

    confidence?: {
      confidenceScore?: number | null;
      confidenceLevel?: string | null;
    };

    intelligenceProfile?: {
      repositoryTypes?: string[];
      domains?: string[];
      technologies?: string[];
    };
  };

  repositoryTypes?: string[];
  domains?: string[];
  technologies?: string[];
};

type PortfolioRepo = {
  id: string;
  name: string;
  fullName?: string | null;
  language?: string | null;
  semanticLabel?: string | null;
  confidence?: number | null;
  repositoryTypes?: string[];
  dominantDomains?: string[];
  technologies?: string[];
};

function countItems(
  repositories: PortfolioRepo[],
  key: keyof PortfolioRepo
) {
  const counts = new Map<string, number>();

  repositories.forEach((repository) => {
    const values = repository[key];

    if (!Array.isArray(values)) return;

    values.forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((first, second) => second.count - first.count);
}

function getAverageConfidence(repositories: PortfolioRepo[]) {
  const scores = repositories
    .map((repository) => repository.confidence)
    .filter(
      (score): score is number =>
        typeof score === "number"
    );

  if (scores.length === 0) return null;

  return Math.round(
    scores.reduce((total, score) => total + score, 0) /
    scores.length
  );
}

function getTopRepo(repositories: PortfolioRepo[]) {
  return [...repositories]
    .filter(
      (repository) =>
        typeof repository.confidence === "number"
    )
    .sort(
      (first, second) =>
        (second.confidence || 0) -
        (first.confidence || 0)
    )[0];
}

function formatDate(value?: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function CountList({
  title,
  items,
  humanize = true,
  emptyMessage = "No portfolio signals detected yet.",
  formatter,
}: {
  title: string;
  items: Array<{
    name: string;
    count: number;
  }>;
  humanize?: boolean;
  emptyMessage?: string;
  formatter?: (
    value: string,
  ) => string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <h3 className="font-semibold">{title}</h3>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.slice(0, 8).map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
            >
              <span className="min-w-0 truncate text-sm">
                {formatter
                  ? formatter(item.name)
                  : humanize
                    ? formatFilterLabel(
                      item.name,
                    )
                    : item.name}
              </span>

              <Badge variant="secondary">
                {item.count.toLocaleString()}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PortfolioMetricCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <p className="mt-3 break-words text-3xl font-bold">
            {typeof value === "number"
              ? value.toLocaleString()
              : value}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function PortfolioOperationsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-36 rounded-xl"
          />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-32 rounded-xl"
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-44 rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}

function PortfolioOperationsWarning({
  message,
  onRetry,
  isRetrying,
}: {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />

          <div>
            <p className="font-medium">
              Portfolio operations are temporarily unavailable
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {message}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Existing semantic portfolio intelligence remains
              available below.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
        >
          <RefreshCcw
            className={`mr-2 h-4 w-4 ${isRetrying ? "animate-spin" : ""
              }`}
          />

          {isRetrying ? "Retrying..." : "Retry"}
        </Button>
      </div>
    </div>
  );
}

function PortfolioActivitySummary({
  summary,
}: {
  summary: PortfolioSummary;
}) {
  return (
    <IntelligenceSection
      title="Portfolio Activity Summary"
      description="Operational coverage and accumulated engineering activity across your repositories."
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <PortfolioMetricCard
          label="Timeline Entries"
          value={summary.totalTimelineEntries}
          description="Repository evolution entries recorded across the portfolio."
          icon={History}
        />

        <PortfolioMetricCard
          label="Total Recommendations"
          value={summary.totalRecommendations}
          description="All active and resolved engineering recommendations."
          icon={Lightbulb}
        />

        <PortfolioMetricCard
          label="With Intelligence"
          value={summary.repositoriesWithIntelligence}
          description="Repositories with generated engineering intelligence."
          icon={Brain}
        />

        <PortfolioMetricCard
          label="Without Intelligence"
          value={summary.repositoriesWithoutIntelligence}
          description="Repositories still waiting for intelligence generation."
          icon={CircleGauge}
        />

        <PortfolioMetricCard
          label="Untracked Repositories"
          value={summary.untrackedRepositories}
          description="Imported repositories not currently monitored by ArcHive."
          icon={Boxes}
        />
      </div>
    </IntelligenceSection>
  );
}

function getHighlightMetric(
  type:
    | "stars"
    | "activity"
    | "updated"
    | "recommendations",
  repository: PortfolioHighlightRepository
) {
  switch (type) {
    case "stars":
      return `${(
        repository.stars ??
        repository.metric ??
        0
      ).toLocaleString()} stars`;

    case "activity":
      return `${(
        repository.totalEngineeringEvents ??
        repository.activityCount ??
        repository.metric ??
        0
      ).toLocaleString()} engineering events`;

    case "updated":
      return `Updated ${formatDate(
        repository.lastUpdatedAt ??
        repository.updatedAt
      )}`;

    case "recommendations":
      return `${(
        repository.activeRecommendations ??
        repository.recommendationCount ??
        repository.totalRecommendations ??
        repository.metric ??
        0
      ).toLocaleString()} active recommendations`;
  }
}

function PortfolioHighlightCard({
  title,
  repository,
  metricType,
}: {
  title: string;
  repository: PortfolioHighlightRepository | null;
  metricType:
  | "stars"
  | "activity"
  | "updated"
  | "recommendations";
}) {
  if (!repository) {
    return (
      <div className="rounded-xl border border-border bg-background p-5">
        <p className="text-sm text-muted-foreground">
          {title}
        </p>

        <p className="mt-3 font-semibold">
          No portfolio highlight available
        </p>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ArcHive does not yet have enough repository data to
          calculate this highlight.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <p className="text-sm text-muted-foreground">
        {title}
      </p>

      <h3 className="mt-3 break-words text-xl font-bold">
        {repository.fullName || repository.name}
      </h3>

      <Badge variant="secondary" className="mt-3">
        {getHighlightMetric(metricType, repository)}
      </Badge>

      {repository.id && (
        <Link
          href={`/repositories/${repository.id}/intelligence`}
          className="mt-5 inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          Open intelligence report
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

type PortfolioIdentityResult = {
  title: string;
  description: string;
  isDominant: boolean;
  topTypes: PortfolioDistributionItem[];
};

function getPortfolioIdentity(
  repositoryTypes: PortfolioDistributionItem[],
): PortfolioIdentityResult {
  if (!repositoryTypes.length) {
    return {
      title: "Portfolio Identity Unavailable",
      description:
        "ArcHive does not yet have enough canonical repository-purpose data to describe this portfolio.",
      isDominant: false,
      topTypes: [],
    };
  }

  const highestCount = Math.max(
    ...repositoryTypes.map(
      (item) => item.count,
    ),
  );

  const topTypes =
    repositoryTypes.filter(
      (item) =>
        item.count === highestCount,
    );

  /*
   * A single repository purpose has the highest representation.
   * We can truthfully describe it as the portfolio's dominant purpose.
   */
  if (topTypes.length === 1) {
    const dominantType =
      topTypes[0];

    return {
      title:
        formatIntelligenceLabel(
          dominantType.name,
        ),
      description:
        `${dominantType.count.toLocaleString()} ${dominantType.count === 1
          ? "repository is"
          : "repositories are"
        } classified under this canonical repository purpose.`,
      isDominant: true,
      topTypes,
    };
  }

  /*
   * Multiple repository purposes share the highest count.
   *
   * There is no genuine dominant purpose, so we explicitly describe
   * the portfolio as diverse instead of arbitrarily choosing the first
   * item returned by a sorted array.
   */
  const purposeNames =
    topTypes.map((item) =>
      formatIntelligenceLabel(
        item.name,
      ),
    );

  return {
    title:
      "Diverse Engineering Portfolio",

    description:
      `No single repository purpose dominates this portfolio. ` +
      `The strongest representation is shared equally across ${purposeNames.join(
        ", ",
      )}.`,

    isDominant: false,
    topTypes,
  };
}

export function PortfolioIntelligenceWorkspace() {
  const userId = getUserId();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useIntelligenceOverview();

  const {
    data: operationalPortfolio,
    isLoading: isOperationalPortfolioLoading,
    isError: isOperationalPortfolioError,
    error: operationalPortfolioError,
    refetch: refetchOperationalPortfolio,
    isRefetching: isOperationalPortfolioRefetching,
  } = usePortfolioOperations(userId);

  /*
   * The intelligence-overview endpoint returns an array of repository
   * intelligence records.
   *
   * We only reshape that backend data for presentation here.
   * No repository-purpose classification happens on the frontend.
   */
  const repositories: PortfolioRepo[] =
    Array.isArray(data)
      ? (data as IntelligenceOverviewItem[]).map(
        (item) => ({
          id: item.repository.id,
          name: item.repository.name,
          fullName:
            item.repository.fullName,
          language:
            item.repository.language,

          semanticLabel:
            item.semanticProfile
              ?.semanticLabel ?? null,

          confidence:
            item.semanticProfile
              ?.confidence
              ?.confidenceScore ??
            null,

          repositoryTypes:
            item.repositoryTypes ??
            item.semanticProfile
              ?.intelligenceProfile
              ?.repositoryTypes ??
            [],

          dominantDomains:
            item.domains ??
            item.semanticProfile
              ?.intelligenceProfile
              ?.domains ??
            [],

          technologies:
            item.technologies ??
            item.semanticProfile
              ?.intelligenceProfile
              ?.technologies ??
            [],
        }),
      )
      : [];

  const averageConfidence = getAverageConfidence(repositories);
  const topRepo = getTopRepo(repositories);

  /*
 * The operational Portfolio API already provides canonical distributions.
 *
 * We prefer those values instead of reconstructing portfolio identity from
 * repository-level semantic arrays. This prevents secondary implementation
 * types from being mistaken for canonical repository purposes.
 *
 * The semantic overview remains useful as a fallback for non-identity
 * presentation when portfolio operations are temporarily unavailable.
 */
  const semanticRepositoryTypes =
    countItems(
      repositories,
      "repositoryTypes",
    );

  const semanticTechnologies =
    countItems(
      repositories,
      "technologies",
    );

  const semanticDomains =
    countItems(
      repositories,
      "dominantDomains",
    );

  const repositoryTypes:
    PortfolioDistributionItem[] =
    operationalPortfolio
      ?.distributions
      .repositoryTypes ??
    semanticRepositoryTypes;

  const technologies:
    PortfolioDistributionItem[] =
    operationalPortfolio
      ?.distributions
      .technologies ??
    semanticTechnologies;

  const domains:
    PortfolioDistributionItem[] =
    operationalPortfolio
      ?.distributions
      .architectureDomains ??
    semanticDomains;

  const languages:
    PortfolioDistributionItem[] =
    operationalPortfolio
      ?.distributions
      .languages ?? [];

  /*
* Portfolio identity is based strictly on the canonical repository-purpose
* distribution returned by the Portfolio API.
*
* We intentionally do not infer identity from technologies, descriptions,
* repository names, or semantic labels.
*/
  const portfolioIdentity =
    getPortfolioIdentity(
      operationalPortfolio
        ?.distributions
        .repositoryTypes ?? [],
    );

  const topRepositoryTypes = repositoryTypes.map(
    (item) => item.name
  );

  const topTechnologies = technologies.map(
    (item) => item.name
  );

  const topDomains = domains.map(
    (item) => item.name
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Portfolio Intelligence
            </h1>

            <p className="mt-2 max-w-3xl text-muted-foreground">
              A workspace-level view of your repository intelligence,
              engineering identity, dominant technologies, architecture
              domains, and strongest portfolio signals.
            </p>
          </div>
        </div>
      </div>

      {isOperationalPortfolioLoading && (
        <PortfolioOperationsSkeleton />
      )}

      {!isOperationalPortfolioLoading &&
        isOperationalPortfolioError && (
          <PortfolioOperationsWarning
            message={
              operationalPortfolioError instanceof Error
                ? operationalPortfolioError.message
                : "The operational portfolio request could not be completed."
            }
            onRetry={() => {
              void refetchOperationalPortfolio();
            }}
            isRetrying={isOperationalPortfolioRefetching}
          />
        )}

      {!isOperationalPortfolioLoading &&
        !isOperationalPortfolioError &&
        operationalPortfolio && (
          <>
            <IntelligenceSection
              title="Portfolio Identity"
              description="A portfolio-level view derived from canonical repository-purpose distribution and classification confidence."
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                <div className="rounded-xl border border-border bg-background p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">
                        {portfolioIdentity.isDominant
                          ? "Dominant Portfolio Identity"
                          : "Portfolio Identity"}
                      </p>

                      <h2 className="mt-2 text-2xl font-bold">
                        {portfolioIdentity.title}
                      </h2>

                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {portfolioIdentity.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="mb-3 text-sm font-medium">
                      Canonical Repository Purposes
                    </p>

                    {repositoryTypes.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {repositoryTypes.map(
                          (item) => (
                            <Badge
                              key={item.name}
                              variant="outline"
                            >
                              {formatIntelligenceLabel(
                                item.name,
                              )}
                              <span className="ml-2 text-muted-foreground">
                                {item.count}
                              </span>
                            </Badge>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No canonical repository-purpose distribution is available yet.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <BadgeCheck className="h-4 w-4 text-primary" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">
                        Highest Classification Confidence
                      </p>

                      <h2 className="mt-2 break-words text-2xl font-bold">
                        {topRepo?.fullName ||
                          topRepo?.name ||
                          "Confidence unavailable"}
                      </h2>

                      {typeof topRepo?.confidence ===
                        "number" ? (
                        <Badge
                          variant="secondary"
                          className="mt-3"
                        >
                          {topRepo.confidence}%
                          confidence
                        </Badge>
                      ) : null}

                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {topRepo?.semanticLabel
                          ? `${topRepo.semanticLabel}. This represents ArcHive's confidence in the repository classification, not an engineering-quality ranking.`
                          : "Classification confidence is not currently available for the repositories in this portfolio."}
                      </p>

                      {topRepo ? (
                        <Link
                          href={`/repositories/${topRepo.id}/intelligence`}
                          className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
                        >
                          Open intelligence report

                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </IntelligenceSection>

            <PortfolioActivitySummary
              summary={operationalPortfolio.summary}
            />

            <IntelligenceSection
              title="Portfolio Highlights"
              description="Operational standouts calculated from repository activity, GitHub metadata, updates, and recommendations."
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <PortfolioHighlightCard
                  title="Most Starred Repository"
                  repository={
                    operationalPortfolio.highlights
                      .mostStarredRepository
                  }
                  metricType="stars"
                />

                <PortfolioHighlightCard
                  title="Most Active Repository"
                  repository={
                    operationalPortfolio.highlights
                      .mostActiveRepository
                  }
                  metricType="activity"
                />

                <PortfolioHighlightCard
                  title="Most Recently Updated"
                  repository={
                    operationalPortfolio.highlights
                      .mostRecentlyUpdatedRepository
                  }
                  metricType="updated"
                />

                <PortfolioHighlightCard
                  title="Most Active Recommendations"
                  repository={
                    operationalPortfolio.highlights
                      .repositoryWithMostRecommendations
                  }
                  metricType="recommendations"
                />
              </div>
            </IntelligenceSection>
          </>
        )}

      {isLoading && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>

          <Skeleton className="h-96 rounded-xl" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
          <p className="font-medium text-destructive">
            Failed to load portfolio intelligence
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Please check backend connection."}
          </p>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <PortfolioMetricCard
              label="Repositories With Intelligence"
              value={
                operationalPortfolio
                  ? `${operationalPortfolio.summary.repositoriesWithIntelligence}/${operationalPortfolio.summary.totalRepositories}`
                  : repositories.length
              }
              description={
                operationalPortfolio
                  ? `${operationalPortfolio.summary.intelligenceCoveragePercent}% of imported repositories currently have generated engineering intelligence.`
                  : "Repositories currently returned by the intelligence overview."
              }
              icon={Brain}
            />

            <PortfolioMetricCard
              label="Average Classification Confidence"
              value={
                averageConfidence !== null
                  ? `${averageConfidence}%`
                  : "Unavailable"
              }
              description="Average backend classification confidence across repositories with available semantic intelligence."
              icon={BadgeCheck}
            />

            <PortfolioMetricCard
              label="Canonical Repository Purposes"
              value={repositoryTypes.length}
              description={
                repositoryTypes.length === 1
                  ? "One canonical repository purpose is currently represented across the portfolio."
                  : `${repositoryTypes.length} distinct canonical repository purposes are currently represented across the portfolio.`
              }
              icon={Layers3}
            />

            <PortfolioMetricCard
              label="Detected Technologies"
              value={technologies.length}
              description={
                technologies.length === 1
                  ? "One distinct technology is currently represented in the portfolio intelligence distribution."
                  : `${technologies.length} distinct technologies are currently represented in the portfolio intelligence distribution.`
              }
              icon={Network}
            />
          </div>

          <IntelligenceSection
            title="Portfolio Identity"
            description="The strongest engineering themes detected across your repositories."
          >
            <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
              <div className="rounded-xl border border-border bg-background p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Brain className="h-4 w-4 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Dominant Portfolio Identity
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                      {repositoryTypes[0]
                        ? formatFilterLabel(
                          repositoryTypes[0].name
                        )
                        : "Portfolio identity pending"}
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      ArcHive derives this from repository types,
                      technologies, architecture domains, and semantic
                      classifications across your tracked repositories.
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-3 text-sm font-medium">
                    Top Repository Types
                  </p>

                  <BadgeGroup items={topRepositoryTypes} />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Strongest Repository
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                      {topRepo?.fullName ||
                        topRepo?.name ||
                        "Not enough data"}
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {topRepo?.semanticLabel ||
                        "ArcHive has not ranked a strongest repository yet."}
                    </p>

                    {topRepo && (
                      <Link
                        href={`/repositories/${topRepo.id}/intelligence`}
                        className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
                      >
                        Open intelligence report
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </IntelligenceSection>

          <IntelligenceSection
            title="Portfolio Signal Breakdown"
            description="What shows up repeatedly across your tracked repositories."
          >
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <CountList
                title="Repository Purposes"
                items={repositoryTypes}
                formatter={
                  formatIntelligenceLabel
                }
              />

              <CountList
                title="Architecture Domains"
                items={domains}
              />

              <CountList
                title="Technologies"
                items={technologies}
                humanize={false}
              />

              <CountList
                title="Languages"
                items={languages}
                humanize={false}
                emptyMessage={
                  isOperationalPortfolioError
                    ? "Language distribution is temporarily unavailable."
                    : "No repository language data is available yet."
                }
              />
            </div>
          </IntelligenceSection>

          <IntelligenceSection
            title="Repository Intelligence Cards"
            description="A quick scan of every classified repository in the workspace."
          >
            {repositories.length === 0 ? (
              <div className="rounded-xl border border-border bg-background p-6 text-center">
                <p className="font-medium">
                  No portfolio intelligence yet
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                  Track repositories and refresh intelligence to
                  populate this portfolio view.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {repositories.map((repository) => (
                  <Link
                    key={repository.id}
                    href={`/repositories/${repository.id}/intelligence`}
                    className="group rounded-xl border border-border bg-background p-5 transition hover:border-primary/50 hover:bg-accent"
                  >
                    <div className="flex justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Network className="h-4 w-4 text-primary" />

                          <h3 className="truncate font-semibold">
                            {repository.fullName ||
                              repository.name}
                          </h3>
                        </div>

                        <p className="mt-2 text-sm text-muted-foreground">
                          {repository.semanticLabel ||
                            "Repository intelligence available"}
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {typeof repository.confidence ===
                        "number" && (
                          <Badge variant="secondary">
                            {repository.confidence}% confidence
                          </Badge>
                        )}

                      {repository.repositoryTypes
                        ?.slice(0, 2)
                        .map((type) => (
                          <Badge
                            key={type}
                            variant="outline"
                          >
                            {formatFilterLabel(type)}
                          </Badge>
                        ))}

                      {repository.dominantDomains
                        ?.slice(0, 2)
                        .map((domain) => (
                          <Badge
                            key={domain}
                            variant="secondary"
                          >
                            {formatFilterLabel(domain)}
                          </Badge>
                        ))}

                      {repository.technologies
                        ?.slice(0, 3)
                        .map((technology) => (
                          <Badge
                            key={technology}
                            variant="outline"
                          >
                            {technology}
                          </Badge>
                        ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </IntelligenceSection>
        </>
      )}
    </div>
  );
}
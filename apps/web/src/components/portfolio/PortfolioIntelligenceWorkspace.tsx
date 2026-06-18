"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  Layers3,
  Network,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BadgeGroup } from "@/components/intelligence-v2/BadgeGroup";
import { IntelligenceSection } from "@/components/intelligence-v2/IntelligenceSection";
import { ScoreCard } from "@/components/intelligence-v2/ScoreCard";
import { useIntelligenceOverview } from "@/hooks/useRepositories";
import { formatFilterLabel } from "@/lib/filters";

type PortfolioRepo = {
  id: string;
  name: string;
  fullName?: string | null;
  semanticLabel?: string | null;
  confidence?: number | null;
  repositoryTypes?: string[];
  dominantDomains?: string[];
  technologies?: string[];
};

function countItems(repositories: PortfolioRepo[], key: keyof PortfolioRepo) {
  const counts = new Map<string, number>();

  repositories.forEach((repo) => {
    const values = repo[key];

    if (!Array.isArray(values)) return;

    values.forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function getAverageConfidence(repositories: PortfolioRepo[]) {
  const scores = repositories
    .map((repo) => repo.confidence)
    .filter((score): score is number => typeof score === "number");

  if (scores.length === 0) return null;

  return Math.round(
    scores.reduce((total, score) => total + score, 0) / scores.length
  );
}

function getTopRepo(repositories: PortfolioRepo[]) {
  return [...repositories]
    .filter((repo) => typeof repo.confidence === "number")
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))[0];
}

function CountList({
  title,
  items,
  humanize = true,
}: {
  title: string;
  items: Array<{ name: string; count: number }>;
  humanize?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <h3 className="font-semibold">{title}</h3>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No portfolio signals detected yet.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.slice(0, 8).map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
            >
              <span className="text-sm">
                {humanize ? formatFilterLabel(item.name) : item.name}
              </span>

              <Badge variant="secondary">{item.count}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PortfolioIntelligenceWorkspace() {
  const { data, isLoading, isError, error } = useIntelligenceOverview();

  const repositories = (data?.repositories || []) as PortfolioRepo[];

  const averageConfidence = getAverageConfidence(repositories);
  const topRepo = getTopRepo(repositories);

  const repositoryTypes = countItems(repositories, "repositoryTypes");
  const technologies = countItems(repositories, "technologies");
  const domains = countItems(repositories, "dominantDomains");

  const topRepositoryTypes = repositoryTypes.map((item) => item.name);
  const topTechnologies = technologies.map((item) => item.name);
  const topDomains = domains.map((item) => item.name);

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
              engineering identity, dominant technologies, architecture domains,
              and strongest portfolio signals.
            </p>
          </div>
        </div>
      </div>

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
            <ScoreCard
              label="Intelligent Repositories"
              score={
                repositories.length
                  ? Math.min(repositories.length * 10, 100)
                  : null
              }
              level={`${repositories.length} repos`}
              description="Repositories with available semantic intelligence."
            />

            <ScoreCard
              label="Average Confidence"
              score={averageConfidence}
              description="Average classification confidence across available repositories."
            />

            <ScoreCard
              label="Repository Type Diversity"
              score={
                repositoryTypes.length
                  ? Math.min(repositoryTypes.length * 15, 100)
                  : null
              }
              level={`${repositoryTypes.length} types`}
              description="How diverse your portfolio appears across repository types."
            />

            <ScoreCard
              label="Technology Coverage"
              score={
                technologies.length ? Math.min(technologies.length * 8, 100) : null
              }
              level={`${technologies.length} technologies`}
              description="Unique technologies detected across your repositories."
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
                        ? formatFilterLabel(repositoryTypes[0].name)
                        : "Portfolio identity pending"}
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      ArcHive derives this from repository types, technologies,
                      architecture domains, and semantic classifications across
                      your tracked repositories.
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
                      {topRepo?.fullName || topRepo?.name || "Not enough data"}
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
            <div className="grid gap-6 lg:grid-cols-3">
              <CountList title="Repository Types" items={repositoryTypes} />
              <CountList title="Architecture Domains" items={domains} />
              <CountList
                title="Technologies"
                items={technologies}
                humanize={false}
              />
            </div>
          </IntelligenceSection>

          <IntelligenceSection
            title="Repository Intelligence Cards"
            description="A quick scan of every classified repository in the workspace."
          >
            {repositories.length === 0 ? (
              <div className="rounded-xl border border-border bg-background p-6 text-center">
                <p className="font-medium">No portfolio intelligence yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Track repositories and refresh intelligence to populate this
                  portfolio view.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {repositories.map((repo) => (
                  <Link
                    key={repo.id}
                    href={`/repositories/${repo.id}/intelligence`}
                    className="group rounded-xl border border-border bg-background p-5 transition hover:border-primary/50 hover:bg-accent"
                  >
                    <div className="flex justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Network className="h-4 w-4 text-primary" />
                          <h3 className="truncate font-semibold">
                            {repo.fullName || repo.name}
                          </h3>
                        </div>

                        <p className="mt-2 text-sm text-muted-foreground">
                          {repo.semanticLabel ||
                            "Repository intelligence available"}
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {typeof repo.confidence === "number" && (
                        <Badge variant="secondary">
                          {repo.confidence}% confidence
                        </Badge>
                      )}

                      {repo.repositoryTypes?.slice(0, 2).map((type) => (
                        <Badge key={type} variant="outline">
                          {formatFilterLabel(type)}
                        </Badge>
                      ))}

                      {repo.dominantDomains?.slice(0, 2).map((domain) => (
                        <Badge key={domain} variant="secondary">
                          {formatFilterLabel(domain)}
                        </Badge>
                      ))}

                      {repo.technologies?.slice(0, 3).map((technology) => (
                        <Badge key={technology} variant="outline">
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
"use client";

import Link from "next/link";
import { ArrowRight, Brain, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { IntelligenceOverviewResponse } from "@/types/intelligence-overview.types";
import { formatFilterLabel } from "@/lib/filters";

interface IntelligenceOverviewProps {
  data?: IntelligenceOverviewResponse;
  isLoading?: boolean;
}

export function IntelligenceOverview({
  data,
  isLoading,
}: IntelligenceOverviewProps) {
  const repositories = data?.repositories ?? [];

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Loading repository intelligence overview...
        </p>
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Intelligence Overview</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No repository intelligence classifications are available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="h-4 w-4 text-primary" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">Intelligence Overview</h2>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Semantic repository classifications across your ArcHive workspace.
            </p>
          </div>
        </div>

        <Badge variant="secondary">{repositories.length} repositories</Badge>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {repositories.slice(0, 6).map((repo) => (
          <Link
            key={repo.id}
            href={`/repositories/${repo.id}/intelligence`}
            className="group rounded-xl border border-border bg-background p-5 transition hover:border-primary/50 hover:bg-accent"
          >
            <div className="flex justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />

                  <h3 className="truncate font-semibold">
                    {repo.fullName || repo.name}
                  </h3>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {repo.semanticLabel || "Repository intelligence available"}
                </p>
              </div>

              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {typeof repo.confidence === "number" && (
                <Badge variant="secondary">{repo.confidence}% confidence</Badge>
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

      {repositories.length > 6 && (
        <p className="mt-4 text-xs text-muted-foreground">
          Showing 6 of {repositories.length} repositories. Use Intelligence
          Search to filter more precisely.
        </p>
      )}
    </div>
  );
}
"use client";

import Link from "next/link";
import { ArrowRight, Brain } from "lucide-react";

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
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Brain className="h-4 w-4 text-primary" />
        </div>

        <div>
          <h2 className="text-lg font-semibold">Intelligence Overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Semantic repository classifications across your ArcHive workspace.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {repositories.map((repo) => (
          <Link
            key={repo.id}
            href={`/repositories/${repo.id}/intelligence`}
            className="group rounded-xl border border-border bg-background p-5 transition hover:border-primary/50 hover:bg-accent"
          >
            <div className="flex justify-between gap-3">
              <div>
                <h3 className="font-semibold">{repo.fullName || repo.name}</h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {repo.semanticLabel || "Semantic profile pending"}
                </p>
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {typeof repo.confidence === "number" && (
                <Badge variant="secondary">{repo.confidence}% confidence</Badge>
              )}

              {repo.repositoryTypes?.slice(0, 3).map((type) => (
                <Badge key={type} variant="outline">
                  {formatFilterLabel(type)}
                </Badge>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {repo.dominantDomains?.slice(0, 3).map((domain) => (
                <Badge key={domain} variant="secondary">
                  {formatFilterLabel(domain)}
                </Badge>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {repo.technologies?.slice(0, 4).map((technology) => (
                <Badge key={technology} variant="outline">
                  {technology}
                </Badge>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
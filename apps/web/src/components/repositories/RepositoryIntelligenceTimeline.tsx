"use client";

import { Clock3, GitBranch, Network } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { RepositoryIntelligenceTimelineResponse } from "@/types/repository-intelligence-timeline.types";
import { formatFilterLabel } from "@/lib/filters";

interface RepositoryIntelligenceTimelineProps {
  data?: RepositoryIntelligenceTimelineResponse;
  isLoading?: boolean;
}

function formatDate(value?: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleString();
}

export function RepositoryIntelligenceTimeline({
  data,
  isLoading,
}: RepositoryIntelligenceTimelineProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Loading intelligence phases...
        </p>
      </div>
    );
  }

  if (!data || data.phases.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Intelligence Timeline</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No interpreted engineering phases detected yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <GitBranch className="h-4 w-4 text-primary" />
        </div>

        <div>
          <h2 className="text-lg font-semibold">Intelligence Timeline</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Interpreted engineering phases showing how this repository evolved
            over time.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">        {data.phases.map((phase) => (
        <div
          key={`${phase.domain}-${phase.phaseType}-${phase.startedAt}`}
          className="rounded-xl border border-border bg-background p-5"
        >
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{phase.title}</h3>

                <Badge variant="secondary">
                  {formatFilterLabel(phase.domain)}
                </Badge>
              </div>

              {phase.description && (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {phase.description}
                </p>
              )}
            </div>

            <Badge variant="outline">
              {phase.totalChanges} changes
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {phase.technologies?.map((technology) => (
              <Badge key={technology} variant="outline">
                {technology}
              </Badge>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              Started: {formatDate(phase.startedAt)}
            </span>

            <span className="flex items-center gap-1">
              <Network className="h-3.5 w-3.5" />
              Latest: {formatDate(phase.latestActivityAt)}
            </span>
          </div>

          {phase.highlights && phase.highlights.length > 0 && (
            <div className="mt-5 space-y-3">
              {phase.highlights.slice(0, 2).map((highlight, index) => (
                <div
                  key={`${highlight.createdAt}-${index}`}
                  className="rounded-lg border border-border bg-card p-3"
                >
                  {highlight.summary && (
                    <p className="text-xs leading-5 text-muted-foreground">                      {highlight.summary}
                    </p>
                  )}

                  {highlight.evolutionSummary && (
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {highlight.evolutionSummary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      </div>
    </div>
  );
}
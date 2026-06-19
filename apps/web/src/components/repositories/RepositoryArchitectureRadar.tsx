"use client";

import Link from "next/link";
import { Activity, ArrowRight, Radar, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatFilterLabel } from "@/lib/filters";

type RadarItem = {
  domain: string;
  label: string;
  score: number;
  changeCount: number;
};

interface RepositoryArchitectureRadarProps {
  data?: {
    radar?: RadarItem[];
  };
  isLoading?: boolean;
  repositoryId?: string;
}

function getLevel(score: number) {
  if (score >= 80) return "Dominant";
  if (score >= 50) return "Strong";
  if (score >= 25) return "Emerging";
  return "Light";
}

export function RepositoryArchitectureRadar({
  data,
  isLoading,
  repositoryId,
}: RepositoryArchitectureRadarProps) {
  const radar = [...(data?.radar || [])].sort(
    (a, b) => b.score - a.score || b.changeCount - a.changeCount
  );

  const strongest = radar[0];

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Loading architecture radar...
        </p>
      </div>
    );
  }

  if (radar.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Repository Architecture Radar</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No architecture radar signals detected yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Radar className="h-4 w-4 text-primary" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Repository Architecture Radar
            </h2>

            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Engineering DNA profile showing dominant architecture domains,
              system depth, and specialization signals.
            </p>
          </div>
        </div>

        {strongest && (
          <Badge variant="secondary">
            Strongest: {formatFilterLabel(strongest.domain)}
          </Badge>
        )}
      </div>

      {strongest && (
        <div className="mt-6 rounded-xl border border-border bg-background p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 text-primary" />

            <div>
              <p className="text-sm text-muted-foreground">
                Dominant Engineering Signal
              </p>

              <h3 className="mt-1 text-xl font-bold">
                {strongest.label || formatFilterLabel(strongest.domain)}
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                This repository currently shows strongest architecture depth in{" "}
                {formatFilterLabel(strongest.domain)}, based on{" "}
                {strongest.changeCount} detected architecture changes.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {radar.map((item) => (
          <div
            key={item.domain}
            className="rounded-xl border border-border bg-background p-4"
          >
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">
                    {item.label || formatFilterLabel(item.domain)}
                  </h3>

                  <Badge variant="secondary">{getLevel(item.score)}</Badge>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  {item.changeCount} architecture changes detected
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">{item.score}%</span>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {repositoryId && (
        <div className="mt-6">
          <Link
            href={`/repositories/${repositoryId}/architecture/evolution`}
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            View architecture evolution
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
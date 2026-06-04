"use client";

import { Activity, Crown, Radar, SignalHigh } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { RepositoryArchitectureRadarResponse } from "@/types/repository-radar.types";
import { formatFilterLabel } from "@/lib/filters";

interface RepositoryArchitectureRadarProps {
  data?: RepositoryArchitectureRadarResponse;
  isLoading?: boolean;
}

function getRadarStrength(score: number) {
  if (score >= 80) return "Dominant";
  if (score >= 50) return "Strong";
  if (score >= 25) return "Emerging";

  return "Low signal";
}

function getProgressWidth(score: number) {
  if (score < 0) return 0;
  if (score > 100) return 100;
  return score;
}

export function RepositoryArchitectureRadar({
  data,
  isLoading,
}: RepositoryArchitectureRadarProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Loading architecture radar...
        </p>
      </div>
    );
  }

  if (!data || data.radar.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Radar className="h-4 w-4 text-primary" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Repository Architecture Radar
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              No architecture signals detected for this repository yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sortedRadar = [...data.radar].sort((a, b) => b.score - a.score);
  const dominantDomain = sortedRadar[0];

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Radar className="h-4 w-4 text-primary" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Repository Architecture Radar
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Engineering DNA profile showing dominant architecture domains,
                infrastructure maturity, and repository specialization.
              </p>
            </div>
          </div>
        </div>

        <Badge variant="secondary">
          Dominant: {dominantDomain.label || formatFilterLabel(dominantDomain.domain)}
        </Badge>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-background p-5">
        <div className="flex items-start gap-3">
          <Crown className="mt-0.5 h-5 w-5 text-primary" />

          <div>
            <p className="text-sm font-medium">Dominant Engineering Domain</p>

            <p className="mt-1 text-xl font-semibold">
              {dominantDomain.label || formatFilterLabel(dominantDomain.domain)}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {dominantDomain.changeCount} architecture changes detected with a{" "}
              {dominantDomain.score}% radar score.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {sortedRadar.map((item) => {
          const progress = getProgressWidth(item.score);
          const strength = getRadarStrength(item.score);

          return (
            <div
              key={item.domain}
              className="rounded-xl border border-border bg-background p-4"
            >
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <SignalHigh className="h-4 w-4 text-primary" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">
                        {item.label || formatFilterLabel(item.domain)}
                      </p>

                      <Badge variant={item.score >= 80 ? "default" : "secondary"}>
                        {strength}
                      </Badge>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.changeCount} architecture changes detected
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium">
                  <Activity className="h-4 w-4 text-primary" />
                  {item.score}%
                </div>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
"use client";

import { Brain, Clock3, RefreshCcw, Radar, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatFilterLabel } from "@/lib/filters";
import { RepositoryIntelligenceSummaryResponse } from "@/types/repository-intelligence-summary.types";
import { RepositoryConfidencePanel } from "@/components/repositories/RepositoryConfidencePanel";
interface RepositoryIntelligenceSummaryProps {
  data?: RepositoryIntelligenceSummaryResponse;
  isLoading?: boolean;
  isRefetching?: boolean;
  onRefresh?: () => void;
}

export function RepositoryIntelligenceSummary({
  data,
  isLoading,
  isRefetching,
  onRefresh,
}: RepositoryIntelligenceSummaryProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Generating repository intelligence summary...
        </p>
      </div>
    );
  }

  if (!data?.summary) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h2 className="text-lg font-semibold">
              Repository Intelligence Summary
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              ArcHive has not generated an intelligence summary for this
              repository yet.
            </p>
          </div>

          {onRefresh && (
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh Summary
            </Button>
          )}
        </div>
      </div>
    );
  }

  const summary = data.summary;
  const mode = summary.mode?.toUpperCase();
  const isActive = mode === "ACTIVE";

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Repository Intelligence Summary
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                ArcHive engineering intelligence synthesis and repository
                evolution analysis.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active Intelligence" : "Passive Intelligence"}
          </Badge>

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefetching}
            >
              <RefreshCcw
                className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""
                  }`}
              />
              {isRefetching ? "Refreshing..." : "Refresh"}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-background p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>

          <div>
            <h3 className="text-2xl font-bold leading-tight">
              {summary.headline ||
                (isActive
                  ? "Recent engineering activity detected"
                  : "No significant weekly activity detected")}
            </h3>

            <p className="mt-4 max-w-4xl text-sm leading-7 text-muted-foreground">
              {summary.overview ||
                (isActive
                  ? "ArcHive detected recent repository activity and is monitoring engineering evolution."
                  : "ArcHive is still monitoring this repository for engineering activity, architecture changes, and system evolution.")}
            </p>
          </div>
        </div>
      </div>

      <RepositoryConfidencePanel
        confidence={summary.confidence}
        reasoningSignals={summary.reasoningSignals}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center gap-2">
            <Radar className="h-4 w-4 text-primary" />

            <p className="font-medium">Key Focus Areas</p>
          </div>

          {!summary.keyFocusAreas || summary.keyFocusAreas.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No engineering focus areas detected yet.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {summary.keyFocusAreas.map((area) => (
                <Badge key={area} variant="secondary">
                  {formatFilterLabel(area)}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />

            <p className="font-medium">Detected Patterns</p>
          </div>

          {!summary.detectedPatterns || summary.detectedPatterns.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No engineering patterns detected yet.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {summary.detectedPatterns.map((pattern) => (
                <Badge key={pattern} variant="outline">
                  {formatFilterLabel(pattern)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {summary.generatedAt && (
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5" />

          <span>Generated {new Date(summary.generatedAt).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
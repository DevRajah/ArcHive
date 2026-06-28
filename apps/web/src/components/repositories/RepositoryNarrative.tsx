"use client";

import { Brain, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { RepositoryNarrativeResponse } from "@/types/repository-narrative.types";
import { RepositoryConfidencePanel } from "@/components/repositories/RepositoryConfidencePanel";
import { formatFilterLabel } from "@/lib/filters";
import {
  getPrimaryRepositoryType,
  getPurposeDetails,
} from "@/lib/repository-purpose";

interface RepositoryNarrativeProps {
  data?: RepositoryNarrativeResponse;
  intelligenceReport?: unknown;
  isLoading?: boolean;
}

type CanonicalIntelligenceReport = {
  summary?: {
    primaryRepositoryType?: string | null;
  };

  repositoryIntelligence?: {
    identity?: {
      primaryRepositoryType?: string | null;
      repositoryTypes?: string[];
      repositoryPersona?: string;
      repositoryDNA?: {
        engineeringProfile?: string;
      };
    };
  };

  legacy?: {
    repositoryTypes?: string[];
  };
};

function renderBadges(items?: string[]) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item, index) => (
        <Badge key={`${item}-${index}`} variant="secondary">
          {formatFilterLabel(item)}
        </Badge>
      ))}
    </div>
  );
}

export function RepositoryNarrative({
  data,
  intelligenceReport,
  isLoading,
}: RepositoryNarrativeProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Loading repository narrative...
        </p>
      </div>
    );
  }

  if (!data?.narrative) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Repository Narrative</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Engineering summary is not available for this repository yet.
        </p>
      </div>
    );
  }

  const report = intelligenceReport as CanonicalIntelligenceReport | undefined;

  const primaryRepositoryType = getPrimaryRepositoryType(report);
  const purpose = getPurposeDetails(primaryRepositoryType);

  const canonicalEngineeringProfile =
    report?.repositoryIntelligence?.identity?.repositoryDNA?.engineeringProfile;

  const narrative = data.narrative;

  const headline =
    primaryRepositoryType && primaryRepositoryType !== "GENERAL_ENGINEERING_PROJECT"
      ? `${purpose.title} engineering narrative`
      : narrative.headline || "Engineering system profile";

  const summary =
    primaryRepositoryType && primaryRepositoryType !== "GENERAL_ENGINEERING_PROJECT"
      ? `ArcHive is classified as a ${purpose.title.toLowerCase()}. ${purpose.description}`
      : narrative.summary;

  const engineeringProfile =
    canonicalEngineeringProfile || narrative.engineeringProfile;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Brain className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">Repository Narrative</h2>

            <Badge variant="outline">
              <Sparkles className="mr-1 h-3 w-3" />
              Engineering Summary
            </Badge>

            {primaryRepositoryType && (
              <Badge variant="secondary">
                {formatFilterLabel(primaryRepositoryType)}
              </Badge>
            )}
          </div>

          <h3 className="mt-4 text-2xl font-bold">{headline}</h3>

          {summary && (
            <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
              {summary}
            </p>
          )}

          {engineeringProfile && (
            <div className="mt-5 rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-medium">Engineering Profile</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {engineeringProfile}
              </p>
            </div>
          )}

          <RepositoryConfidencePanel
            confidence={data.confidence}
            reasoningSignals={data.reasoningSignals}
          />

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-medium">Strengths</p>
              {renderBadges(narrative.strengths) || (
                <p className="mt-2 text-sm text-muted-foreground">
                  No strengths detected yet.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-medium">Dominant Patterns</p>
              {renderBadges(narrative.dominantPatterns) || (
                <p className="mt-2 text-sm text-muted-foreground">
                  No dominant patterns detected yet.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-medium">Specializations</p>
              {renderBadges(narrative.detectedSpecializations) || (
                <p className="mt-2 text-sm text-muted-foreground">
                  No specializations detected yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
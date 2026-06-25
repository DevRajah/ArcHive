"use client";

import { Compass, Layers3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatFilterLabel } from "@/lib/filters";
import {
  getPrimaryRepositoryType,
  getPurposeDetails,
  normalizeReasoningSignals,
} from "@/lib/repository-purpose";

type RepositoryPurposeCardData = {
  repositoryPurpose?: {
    purposeType?: string;
    label?: string;
    description?: string;
  };

  repositoryTypes?: string[];

  reasoningSignals?: unknown;

  summary?: {
    primaryRepositoryType?: string | null;
  };

  repositoryIntelligence?: {
    identity?: {
      primaryRepositoryType?: string | null;
      repositoryTypes?: string[];
    };

    signals?: {
      reasoningSignals?: unknown;
    };
  };

  legacy?: {
    repositoryTypes?: string[];
  };
};

interface RepositoryPurposeCardProps {
  data?: unknown;
  isLoading?: boolean;
}

export function RepositoryPurposeCard({
  data,
  isLoading,
}: RepositoryPurposeCardProps) {
    const report = data as RepositoryPurposeCardData | undefined;
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Detecting repository purpose...
        </p>
      </div>
    );
  }

  const canonicalPrimaryRepositoryType = getPrimaryRepositoryType(report);
  const legacyPurposeType = report?.repositoryPurpose?.purposeType;

  const primaryRepositoryType =
    canonicalPrimaryRepositoryType || legacyPurposeType || null;

  const purpose = primaryRepositoryType
    ? getPurposeDetails(primaryRepositoryType)
    : report?.repositoryPurpose
      ? {
          title: report.repositoryPurpose.label || "Repository Purpose",
          category: report.repositoryPurpose.purposeType
            ? formatFilterLabel(report.repositoryPurpose.purposeType)
            : "Repository Intelligence",
          description:
            report.repositoryPurpose.description ||
            "Repository purpose was classified by ArcHive using backend intelligence signals.",
        }
      : null;

  const repositoryTypes =
  report?.repositoryIntelligence?.identity?.repositoryTypes?.length
      ? report.repositoryIntelligence.identity.repositoryTypes
      : report?.repositoryTypes?.length
        ? report.repositoryTypes
        : report?.legacy?.repositoryTypes || [];

  const reasoningSignals = normalizeReasoningSignals(
    report?.repositoryIntelligence?.signals?.reasoningSignals ||
      report?.reasoningSignals
  );

  if (!purpose) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Repository Purpose</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          ArcHive has not detected a clear repository purpose yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Compass className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">Repository Purpose</h2>

            <Badge variant="secondary">{purpose.category}</Badge>
          </div>

          <h3 className="mt-4 text-2xl font-bold">{purpose.title}</h3>

          <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
            {purpose.description}
          </p>

          {repositoryTypes.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center gap-2">
                <Layers3 className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Repository Types</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {repositoryTypes.map((type, index) => (
                  <Badge key={`${type}-${index}`} variant="outline">
                    {formatFilterLabel(type)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {reasoningSignals.length > 0 && (
            <div className="mt-5 rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-medium">
                Why ArcHive classified it this way
              </p>

              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {reasoningSignals.map((signal, index) => (
                  <li key={`${signal}-${index}`}>• {signal}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
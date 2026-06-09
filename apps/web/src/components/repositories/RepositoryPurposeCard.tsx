"use client";

import { Compass, Layers3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RepositoryPurposeResponse } from "@/types/repository-purpose.types";
import { formatFilterLabel } from "@/lib/filters";

interface RepositoryPurposeCardProps {
  data?: RepositoryPurposeResponse;
  isLoading?: boolean;
}

export function RepositoryPurposeCard({
  data,
  isLoading,
}: RepositoryPurposeCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Detecting repository purpose...
        </p>
      </div>
    );
  }

  if (!data?.repositoryPurpose) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Repository Purpose</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          ArcHive has not detected a clear repository purpose yet.
        </p>
      </div>
    );
  }

  const purpose = data.repositoryPurpose;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Compass className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">Repository Purpose</h2>

            <Badge variant="secondary">
              {formatFilterLabel(purpose.purposeType)}
            </Badge>
          </div>

          <h3 className="mt-4 text-2xl font-bold">{purpose.label}</h3>

          <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
            {purpose.description}
          </p>

          {data.repositoryTypes && data.repositoryTypes.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center gap-2">
                <Layers3 className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Repository Types</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {data.repositoryTypes.map((type) => (
                  <Badge key={type} variant="outline">
                    {formatFilterLabel(type)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {data.reasoningSignals && data.reasoningSignals.length > 0 && (
            <div className="mt-5 rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-medium">
                Why ArcHive classified it this way
              </p>

              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {data.reasoningSignals.map((signal) => (
                  <li key={signal}>• {signal}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
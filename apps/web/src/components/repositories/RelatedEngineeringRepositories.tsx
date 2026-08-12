"use client";

import Link from "next/link";
import { ArrowRight, Network } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { RepositoryRelatedResponse } from "@/types/repository-related.types";
import { formatFilterLabel } from "@/lib/filters";

interface RelatedEngineeringRepositoriesProps {
  data?: RepositoryRelatedResponse;
  isLoading?: boolean;
}

function SignalGroup({
  label,
  items,
}: {
  label: string;
  items?: string[];
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <div className="flex flex-wrap gap-2">
        {items.slice(0, 5).map((item) => (
          <Badge key={`${label}-${item}`} variant="outline">
            {formatFilterLabel(item)}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function RelatedEngineeringRepositories({
  data,
  isLoading,
}: RelatedEngineeringRepositoriesProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Finding related engineering repositories...
        </p>
      </div>
    );
  }

  if (!data || data.relatedRepositories.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <Network className="h-5 w-5 text-muted-foreground" />

          <div>
            <h2 className="text-lg font-semibold">
              Related Engineering Repositories
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              No related repositories detected yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Network className="h-5 w-5 text-primary" />
        </div>

        <div>
          <h2 className="text-lg font-semibold">
            Related Engineering Repositories
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Engineering similarity based on repository identity,
            architecture domains, capabilities, and technologies.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {data.relatedRepositories.map((item) => {
          const shared = item.similarity.sharedSignals;

          return (
            <Link
              key={item.repository.id}
              href={`/repositories/${item.repository.id}`}
              className="group rounded-xl border border-border bg-background p-5 transition hover:border-primary/50 hover:bg-accent"
            >
              <div className="flex justify-between gap-3">
                <div>
                  <h3 className="font-semibold">
                    {item.repository.fullName || item.repository.name}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.similarity.reason ||
                      "Similar engineering structure detected."}
                  </p>
                </div>

                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>
                  {item.similarity.similarityScore}% similar
                </Badge>

                <Badge variant="secondary">
                  {formatFilterLabel(
                    item.similarity.similarityLevel,
                  )}
                </Badge>
              </div>

              <div className="mt-5 space-y-4">
                <SignalGroup
                  label="Repository Types"
                  items={shared?.repositoryTypes}
                />

                <SignalGroup
                  label="Architecture Domains"
                  items={shared?.domains}
                />

                <SignalGroup
                  label="Shared Capabilities"
                  items={shared?.capabilities}
                />

                <SignalGroup
                  label="Technologies"
                  items={shared?.technologies}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
"use client";

import { ArrowRight, Boxes, Code2, Database, Network, ServerCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ArchitectureEvolutionResponse } from "@/types/architecture-evolution.types";
import { formatFilterLabel } from "@/lib/filters";

interface Props {
  data?: ArchitectureEvolutionResponse;
}

function getDomainIcon(domain: string) {
  if (domain.includes("FRONTEND")) return Code2;
  if (domain.includes("API")) return ServerCog;
  if (domain.includes("DATABASE")) return Database;
  if (domain.includes("QUEUE")) return Boxes;
  if (domain.includes("REALTIME")) return Network;
  return Network;
}

export function ArchitectureIntelligenceGraph({ data }: Props) {
  const domains = data?.domains || [];
  const styles = data?.insights?.architectureStyles || [];

  if (domains.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Architecture Intelligence Graph</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No architecture graph signals detected yet.
        </p>
      </div>
    );
  }

  const sortedDomains = [...domains].sort(
    (a, b) => b.totalChanges - a.totalChanges
  );

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h2 className="text-lg font-semibold">Architecture Intelligence Graph</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Visual map of the repository&apos;s dominant architecture domains and engineering flow.
          </p>
        </div>

        {styles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {styles.slice(0, 4).map((style) => (
              <Badge key={style} variant="secondary">
                {formatFilterLabel(style)}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 overflow-x-auto">
        <div className="flex min-w-max items-center gap-4">
          {sortedDomains.map((domain, index) => {
            const Icon = getDomainIcon(domain.domain);

            return (
              <div key={domain.domain} className="flex items-center gap-4">
                <div className="w-64 rounded-xl border border-border bg-background p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>

                    <div>
                      <p className="font-medium">
                        {domain.label || formatFilterLabel(domain.domain)}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {domain.totalChanges} architecture changes
                      </p>
                    </div>
                  </div>

                  {domain.technologies?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {domain.technologies.slice(0, 3).map((technology) => (
                        <Badge key={technology} variant="outline">
                          {technology}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {index < sortedDomains.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
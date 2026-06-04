import { Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ArchitectureEvolutionDomain } from "@/types/architecture-evolution.types";
import { formatFilterLabel } from "@/lib/filters";

interface ArchitectureEvolutionLanesProps {
  domains: ArchitectureEvolutionDomain[];
}

function formatDate(value?: string | null) {
  if (!value) return "No recent change";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "No recent change";

  return date.toLocaleString();
}

export function ArchitectureEvolutionLanes({
  domains,
}: ArchitectureEvolutionLanesProps) {
  return (
    <div className="space-y-6">
      {domains.map((domain) => (
        <div
          key={domain.domain}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold">
                  {domain.label || formatFilterLabel(domain.domain)}
                </h2>

                <Badge variant="secondary">
                  {domain.totalChanges} changes
                </Badge>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                Latest change: {formatDate(domain.latestChangeAt)}
              </p>

              {domain.technologies?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {domain.technologies.map((technology) => (
                    <Badge key={technology} variant="outline">
                      {technology}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {domain.changes.length === 0 && (
            <p className="mt-6 text-sm text-muted-foreground">
              No changes recorded for this architecture domain yet.
            </p>
          )}

          {domain.changes.length > 0 && (
            <div className="mt-6 space-y-5">
              {domain.changes.map((change) => (
                <div key={change.id} className="relative flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Network className="h-4 w-4 text-primary" />
                  </div>

                  <div className="flex-1 rounded-xl border border-border bg-background p-5">
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                      <div>
                        <h3 className="font-medium">
                          {formatFilterLabel(change.changeType)}
                        </h3>

                        {change.summary && (
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {change.summary}
                          </p>
                        )}

                        {change.evolutionSummary && (
                          <p className="mt-3 rounded-lg border border-border bg-card p-3 text-sm leading-6 text-muted-foreground">
                            {change.evolutionSummary}
                          </p>
                        )}
                      </div>

                      <Badge variant="secondary">
                        {formatFilterLabel(change.architectureDomain)}
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                      {change.detectedTechnology && (
                        <p>Technology: {change.detectedTechnology}</p>
                      )}

                      {change.fileAffected && (
                        <p className="break-all">
                          File: {change.fileAffected}
                        </p>
                      )}

                      <p>{new Date(change.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
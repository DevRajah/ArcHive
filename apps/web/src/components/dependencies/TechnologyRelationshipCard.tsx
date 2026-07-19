import Link from "next/link";
import { ArrowRight, GitCompareArrows } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  formatRelationshipPercentage,
  RelationshipStrength,
} from "@/components/dependencies/RelationshipStrength";

import { formatIntelligenceLabel } from "@/lib/intelligence-labels";

import type { TechnologyRelationship } from "@/types/dependency-intelligence.types";

export function TechnologyRelationshipCard({
  relationship,
  showActions = true,
}: {
  relationship: TechnologyRelationship;
  showActions?: boolean;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <GitCompareArrows className="h-5 w-5 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">
              {relationship.source} and {relationship.target}
            </h3>

            <Badge variant="secondary">
              {relationship.sharedRepositories ?? 0} shared repositories
            </Badge>
          </div>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {relationship.evidenceSummary ||
              "These technologies share repository usage across the engineering portfolio."}
          </p>

          <div className="mt-4">
            <RelationshipStrength value={relationship.strength} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <CoverageBox
              label={`${relationship.source} coverage`}
              value={formatRelationshipPercentage(
                relationship.sourceRepositoryCoverage
              )}
            />

            <CoverageBox
              label={`${relationship.target} coverage`}
              value={formatRelationshipPercentage(
                relationship.targetRepositoryCoverage
              )}
            />
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium text-muted-foreground">
              Relationship Type
            </p>

            <Badge variant="outline" className="mt-2">
              {formatIntelligenceLabel(
                relationship.relationshipType
              )}
            </Badge>
          </div>

          {relationship.sharedRepositoryNames?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground">
                Shared repositories
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {relationship.sharedRepositoryNames.map(
                  (repository, index) => (
                    <Badge
                      key={`${repository}-${index}`}
                      variant="outline"
                    >
                      {repository}
                    </Badge>
                  )
                )}
              </div>
            </div>
          )}

          {showActions && (
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link
                  href={`/portfolio/dependencies/${encodeURIComponent(
                    relationship.source
                  )}`}
                >
                  Explore {relationship.source}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="sm">
                <Link
                  href={`/portfolio/dependencies/${encodeURIComponent(
                    relationship.target
                  )}`}
                >
                  Explore {relationship.target}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function CoverageBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
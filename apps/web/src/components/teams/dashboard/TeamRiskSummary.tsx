import Link from "next/link";

import {
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type {
  TeamRiskLevel,
  TeamRiskSummary as TeamRiskSummaryType,
} from "@/types/team.types";

interface TeamRiskSummaryProps {
  risks: TeamRiskSummaryType;
}

function getRiskBadgeVariant(
  riskLevel: TeamRiskLevel,
):
  | "destructive"
  | "secondary"
  | "outline" {
  switch (riskLevel) {
    case "CRITICAL":
    case "HIGH":
      return "destructive";

    case "MEDIUM":
      return "secondary";

    case "LOW":
    default:
      return "outline";
  }
}

export function TeamRiskSummary({
  risks,
}: TeamRiskSummaryProps) {
  /*
   * totalRepositories represents repositories with a canonical
   * Architecture Advisor risk assessment.
   *
   * Zero does not mean "zero engineering risk". It means ArcHive
   * currently has no canonical risk assessment to aggregate.
   */
  const hasRiskAssessments =
    risks.totalRepositories > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ShieldAlert className="h-5 w-5 text-primary" />
          </div>

          <div>
            <CardTitle>
              Team Risks
            </CardTitle>

            <p className="mt-2 text-sm text-muted-foreground">
              Canonical Architecture Advisor risk assessments
              across Team repositories.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!hasRiskAssessments ? (
          <div className="rounded-xl border border-dashed py-10 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" />

            <p className="mt-3 font-medium">
              No risk assessment available
            </p>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              ArcHive does not currently have a canonical
              Architecture Advisor risk assessment for the
              repositories in this workspace.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">
                  Critical
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {risks.criticalRepositories}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">
                  High
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {risks.highRiskRepositories}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">
                  Medium
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {risks.mediumRiskRepositories}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">
                  Low
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {risks.lowRiskRepositories}
                </p>
              </div>
            </div>

            {risks.repositories.length === 0 ? (
              <div className="rounded-xl border border-dashed py-10 text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" />

                <p className="mt-3 font-medium">
                  No repository risk details available
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                  ArcHive has no repository-level risk records
                  to display for this workspace.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {risks.repositories.map(
                  (repository) => (
                    <div
                      key={
                        repository.repositoryId
                      }
                      className="rounded-xl border p-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">
                              {
                                repository.repositoryName
                              }
                            </h3>

                            <Badge
                              variant={getRiskBadgeVariant(
                                repository.riskLevel,
                              )}
                            >
                              {
                                repository.riskLevel
                              }
                            </Badge>

                            <Badge variant="outline">
                              {
                                repository.maturityLabel
                              }
                            </Badge>
                          </div>

                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {
                              repository.overallAssessment
                            }
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              Risk score
                            </p>

                            <p className="mt-1 text-xl font-bold">
                              {
                                repository.overallRiskScore
                              }
                            </p>
                          </div>

                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                          >
                            <Link
                              href={`/repositories/${repository.repositoryId}`}
                            >
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
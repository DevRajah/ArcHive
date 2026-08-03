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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Team Risks
        </CardTitle>

        <p className="text-sm text-muted-foreground">
          Repositories requiring engineering attention.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
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

        {!risks.repositories.length ? (
          <div className="rounded-xl border border-dashed py-10 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" />

            <p className="mt-3 font-medium">
              No repository risks detected
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {risks.repositories.map(
              (repository) => (
                <div
                  key={repository.repositoryId}
                  className="rounded-xl border p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">
                          {repository.repositoryName}
                        </h3>

                        <Badge
                          variant={getRiskBadgeVariant(
                            repository.riskLevel,
                          )}
                        >
                          {repository.riskLevel}
                        </Badge>

                        <Badge variant="outline">
                          {repository.maturityLabel}
                        </Badge>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {repository.overallAssessment}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Risk score
                        </p>

                        <p className="mt-1 text-xl font-bold">
                          {repository.overallRiskScore}
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
      </CardContent>
    </Card>
  );
}
"use client";

import { Trophy } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import type {
  OrganizationRepositoryRanking,
} from "@/types/organization.types";

export default function OrganizationHighlights({
  repositories,
}: {
  repositories: OrganizationRepositoryRanking[];
}) {
  const best = [...repositories]
    .sort(
      (first, second) =>
        second.overallScore -
        first.overallScore,
    )[0];

  /*
   * Only repositories with a canonical numeric risk score may
   * participate in the "Highest Risk" comparison.
   *
   * null does NOT mean zero risk.
   * null means the repository does not currently have sufficient
   * evidence for a canonical risk assessment.
   */
  const assessedRiskRepositories =
    repositories.filter(
      (
        repository,
      ): repository is OrganizationRepositoryRanking & {
        riskScore: number;
      } =>
        typeof repository.riskScore ===
          "number" &&
        Number.isFinite(
          repository.riskScore,
        ),
    );

  const highestRisk =
    [...assessedRiskRepositories].sort(
      (first, second) =>
        second.riskScore -
        first.riskScore,
    )[0];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-500" />

            <div>
              <h2 className="font-bold">
                Best Repository
              </h2>

              <p className="text-muted-foreground">
                {best?.repositoryName ??
                  "Not available"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-red-500" />

            <div>
              <h2 className="font-bold">
                Highest Assessed Risk
              </h2>

              <p className="text-muted-foreground">
                {highestRisk?.repositoryName ??
                  "No assessed risk available"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
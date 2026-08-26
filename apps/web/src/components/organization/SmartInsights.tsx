"use client";

import {
  Lightbulb,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type {
  OrganizationOverview,
} from "@/types/organization.types";

interface SmartInsightsProps {
  overview: OrganizationOverview;
}

export default function SmartInsights({
  overview,
}: SmartInsightsProps) {
  const insights: string[] = [];

  const architectureScore =
    overview.averageArchitectureScore;

  const productionScore =
    overview.averageProductionReadinessScore;

  const engineeringQuality =
    overview.averageEngineeringQualityScore;

  /*
   * Only compare metrics when both values actually exist.
   *
   * Missing organization intelligence must not silently become zero.
   */
  if (
    architectureScore !== null &&
    productionScore !== null &&
    architectureScore >
      productionScore
  ) {
    insights.push(
      "Architecture quality currently exceeds production readiness.",
    );
  }

  if (
    engineeringQuality !== null &&
    engineeringQuality >= 90
  ) {
    insights.push(
      "Engineering quality remains consistently excellent.",
    );
  }

  /*
   * Organization risk insight must respect assessment coverage.
   *
   * averageRiskScore === null means there is no assessable
   * organization-level risk population.
   *
   * It must not be interpreted as LOW risk or as risk being
   * "under control".
   */
  if (
    overview.averageRiskScore === null
  ) {
    insights.push(
      "Organization risk is not yet assessable because ArcHive does not currently have sufficient risk evidence across the portfolio.",
    );
  } else if (
    overview.averageRiskScore > 60
  ) {
    insights.push(
      `Assessed organization risk is elevated across ${overview.riskAssessmentCoveragePercentage}% of tracked repositories.`,
    );
  } else {
    insights.push(
      `Assessed organization risk is currently low across ${overview.riskAssessmentCoveragePercentage}% of tracked repositories.`,
    );
  }

  /*
   * Explicitly surface incomplete risk coverage.
   *
   * This prevents a legitimate LOW / 0 assessed result from
   * being mistaken for complete portfolio verification.
   */
  if (
    overview.unassessedRiskRepositories >
    0
  ) {
    insights.push(
      `${overview.unassessedRiskRepositories} ${
        overview.unassessedRiskRepositories ===
        1
          ? "repository does"
          : "repositories do"
      } not yet have sufficient evidence for canonical risk assessment.`,
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />

          Engineering Insights
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {insights.map(
            (item, index) => (
              <div
                key={index}
                className="rounded-lg border p-4"
              >
                {item}
              </div>
            ),
          )}
        </div>
      </CardContent>
    </Card>
  );
}
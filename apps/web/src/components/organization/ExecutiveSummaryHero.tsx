"use client";

import {
  Brain,
  GitBranch,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import ExecutiveStat from "./ExecutiveStat";

import type {
  OrganizationOverview,
} from "@/types/organization.types";

interface Props {
  overview: OrganizationOverview;
}

export default function ExecutiveSummaryHero({
  overview,
}: Props) {
const riskValue =
  overview.averageRiskScore === null
    ? "Not assessed"
    : overview.averageRiskScore;

const riskSubtitle =
  overview.averageRiskScore === null
    ? "No repositories currently have sufficient risk evidence"
    : `${overview.overallRiskLevel} · ${overview.riskAssessmentCoveragePercentage}% coverage`;
  return (
    <div className="grid gap-5 xl:grid-cols-4">
      <ExecutiveStat
        title="Repositories"
        value={overview.totalRepositories}
        subtitle="Tracked"
        icon={
          <GitBranch className="h-6 w-6" />
        }
      />

      <ExecutiveStat
        title="Engineering"
        value={
          overview.averageEngineeringQualityScore ??
          "Not available"
        }
        subtitle="Average quality"
        icon={
          <Brain className="h-6 w-6" />
        }
      />

      <ExecutiveStat
        title="Production"
        value={
          overview.averageProductionReadinessScore ??
          "Not available"
        }
        subtitle="Readiness"
        icon={
          <ShieldCheck className="h-6 w-6" />
        }
      />

      <ExecutiveStat
        title="Assessed Risk"
        value={riskValue}
        subtitle={riskSubtitle}
        icon={
          <ShieldAlert className="h-6 w-6" />
        }
      />
    </div>
  );
}
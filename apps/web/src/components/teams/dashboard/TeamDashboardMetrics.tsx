import {
  Activity,
  Boxes,
  Gauge,
  GitBranch,
  Layers3,
  ShieldAlert,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";

import { TeamDashboardMetricCard } from "@/components/teams/dashboard/TeamDashboardMetricCard";

import type {
  TeamDashboard,
} from "@/types/team.types";

interface TeamDashboardMetricsProps {
  dashboard: TeamDashboard;
}

function formatScore(value: number) {
  return Number.isFinite(value)
    ? Math.round(value)
    : 0;
}

export function TeamDashboardMetrics({
  dashboard,
}: TeamDashboardMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      <TeamDashboardMetricCard
        title="Team Members"
        value={dashboard.members.total}
        description="People with access to this workspace."
        icon={Users}
      />

      <TeamDashboardMetricCard
        title="Shared Repositories"
        value={dashboard.repositories.total}
        description="Repositories attached to this team."
        icon={GitBranch}
      />

      <TeamDashboardMetricCard
        title="Repository Coverage"
        value={formatScore(
          dashboard.engineering.repositoryCoverage,
        )}
        suffix="%"
        description="Repositories currently covered by analysis."
        icon={Gauge}
      />

      <TeamDashboardMetricCard
        title="Architecture"
        value={formatScore(
          dashboard.engineering.averageArchitecture,
        )}
        description="Average architecture score."
        icon={Boxes}
      />

      <TeamDashboardMetricCard
        title="Engineering Quality"
        value={formatScore(
          dashboard.engineering.averageEngineeringQuality,
        )}
        description="Average engineering quality."
        icon={Workflow}
      />

      <TeamDashboardMetricCard
        title="Production Readiness"
        value={formatScore(
          dashboard.engineering.averageProductionReadiness,
        )}
        description="Average production readiness."
        icon={ShieldCheck}
      />

      <TeamDashboardMetricCard
        title="Capability"
        value={formatScore(
          dashboard.engineering.averageCapability,
        )}
        description="Average engineering capability."
        icon={Activity}
      />

      <TeamDashboardMetricCard
        title="Maturity"
        value={formatScore(
          dashboard.engineering.averageMaturity,
        )}
        description="Average repository maturity."
        icon={Layers3}
      />

      <TeamDashboardMetricCard
        title="Critical Risks"
        value={dashboard.risks.criticalRepositories}
        description="Repositories requiring immediate attention."
        icon={ShieldAlert}
      />
    </div>
  );
}
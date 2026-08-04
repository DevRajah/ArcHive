import {
  CheckCircle2,
  Clock3,
  FileText,
  XCircle,
} from "lucide-react";

import { TeamStatsCard } from "@/components/teams/TeamStatsCard";

import type {
  TeamReportListItem,
} from "@/types/team.types";

interface TeamReportsSummaryCardsProps {
  reports: TeamReportListItem[];
}

export function TeamReportsSummaryCards({
  reports,
}: TeamReportsSummaryCardsProps) {
  const completed =
    reports.filter(
      (report) =>
        report.status === "COMPLETED",
    ).length;

  const generating =
    reports.filter(
      (report) =>
        report.status === "QUEUED" ||
        report.status === "GENERATING",
    ).length;

  const failed =
    reports.filter(
      (report) =>
        report.status === "FAILED",
    ).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <TeamStatsCard
        title="Total Reports"
        value={reports.length}
        description="Every Executive Report generated for this workspace."
        icon={FileText}
      />

      <TeamStatsCard
        title="Completed"
        value={completed}
        description="Reports ready to view and download."
        icon={CheckCircle2}
      />

      <TeamStatsCard
        title="Generating"
        value={generating}
        description="Queued or actively generating reports."
        icon={Clock3}
      />

      <TeamStatsCard
        title="Failed"
        value={failed}
        description="Reports that could not be generated."
        icon={XCircle}
      />
    </div>
  );
}
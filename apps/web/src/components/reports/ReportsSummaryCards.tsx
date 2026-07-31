import {
  CheckCircle2,
  Clock3,
  FileText,
  XCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { ExecutiveReport } from "@/types/report.types";

interface ReportsSummaryCardsProps {
  reports: ExecutiveReport[];
}

interface SummaryCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>

        <div className="rounded-lg border bg-muted/40 p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-3xl font-bold tracking-tight">
          {value}
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export function ReportsSummaryCards({
  reports,
}: ReportsSummaryCardsProps) {
  const completed = reports.filter(
    (report) => report.status === "COMPLETED",
  ).length;

  const generating = reports.filter(
    (report) =>
      report.status === "QUEUED" ||
      report.status === "GENERATING",
  ).length;

  const failed = reports.filter(
    (report) => report.status === "FAILED",
  ).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Total Reports"
        value={reports.length}
        description="All generated executive reports"
        icon={FileText}
      />

      <SummaryCard
        title="Completed"
        value={completed}
        description="Reports ready to view and download"
        icon={CheckCircle2}
      />

      <SummaryCard
        title="Generating"
        value={generating}
        description="Reports currently being processed"
        icon={Clock3}
      />

      <SummaryCard
        title="Failed"
        value={failed}
        description="Reports that could not be generated"
        icon={XCircle}
      />
    </div>
  );
}
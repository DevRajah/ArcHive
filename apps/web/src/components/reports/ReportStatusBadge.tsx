import { Badge } from "@/components/ui/badge";
import type { ReportStatus } from "@/types/report.types";

interface ReportStatusBadgeProps {
  status: ReportStatus;
}

const statusStyles: Record<ReportStatus, string> = {
  QUEUED:
    "border-border bg-muted text-muted-foreground hover:bg-muted",
  GENERATING:
    "border-blue-500/20 bg-blue-500/10 text-blue-600 hover:bg-blue-500/10 dark:text-blue-400",
  COMPLETED:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400",
  FAILED:
    "border-red-500/20 bg-red-500/10 text-red-600 hover:bg-red-500/10 dark:text-red-400",
};

const statusLabels: Record<ReportStatus, string> = {
  QUEUED: "Queued",
  GENERATING: "Generating",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

export function ReportStatusBadge({
  status,
}: ReportStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={statusStyles[status]}
    >
      {statusLabels[status]}
    </Badge>
  );
}
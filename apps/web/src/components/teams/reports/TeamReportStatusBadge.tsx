import {
  CircleCheck,
  CircleX,
  Clock3,
  LoaderCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type {
  TeamReportStatus,
} from "@/types/team.types";

interface TeamReportStatusBadgeProps {
  status: TeamReportStatus;
}

const statusConfig = {
  QUEUED: {
    label: "Queued",
    icon: Clock3,
    className:
      "border-border bg-muted text-muted-foreground",
  },

  GENERATING: {
    label: "Generating",
    icon: LoaderCircle,
    className:
      "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },

  COMPLETED: {
    label: "Completed",
    icon: CircleCheck,
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },

  FAILED: {
    label: "Failed",
    icon: CircleX,
    className:
      "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  },
} satisfies Record<
  TeamReportStatus,
  {
    label: string;
    icon: React.ElementType;
    className: string;
  }
>;

export function TeamReportStatusBadge({
  status,
}: TeamReportStatusBadgeProps) {
  const config =
    statusConfig[status];

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={config.className}
    >
      <Icon
        className={`mr-1.5 h-3.5 w-3.5 ${
          status === "GENERATING"
            ? "animate-spin"
            : ""
        }`}
      />

      {config.label}
    </Badge>
  );
}
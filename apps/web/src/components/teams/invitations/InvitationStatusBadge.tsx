import {
  Ban,
  CheckCircle2,
  Clock3,
  TimerOff,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type {
  TeamInvitationStatus,
} from "@/types/team.types";

interface InvitationStatusBadgeProps {
  status: TeamInvitationStatus;
}

const statusConfig = {
  PENDING: {
    label: "Pending",
    icon: Clock3,
    className:
      "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },

  ACCEPTED: {
    label: "Accepted",
    icon: CheckCircle2,
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },

  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    className:
      "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },

  EXPIRED: {
    label: "Expired",
    icon: TimerOff,
    className:
      "border-border bg-muted text-muted-foreground",
  },

  CANCELLED: {
    label: "Cancelled",
    icon: Ban,
    className:
      "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  },
} satisfies Record<
  TeamInvitationStatus,
  {
    label: string;
    icon: React.ElementType;
    className: string;
  }
>;

export function InvitationStatusBadge({
  status,
}: InvitationStatusBadgeProps) {
  const config =
    statusConfig[status];

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={config.className}
    >
      <Icon className="mr-1.5 h-3.5 w-3.5" />

      {config.label}
    </Badge>
  );
}
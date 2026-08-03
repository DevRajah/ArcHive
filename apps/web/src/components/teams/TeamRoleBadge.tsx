import {
  Crown,
  Eye,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type {
  TeamMemberRole,
} from "@/types/team.types";

interface TeamRoleBadgeProps {
  role: TeamMemberRole;
}

const roleConfig = {
  OWNER: {
    label: "Owner",
    icon: Crown,
    className:
      "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },

  ADMIN: {
    label: "Admin",
    icon: ShieldCheck,
    className:
      "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },

  MEMBER: {
    label: "Member",
    icon: Users,
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },

  VIEWER: {
    label: "Viewer",
    icon: Eye,
    className:
      "border-border bg-muted text-muted-foreground",
  },
} satisfies Record<
  TeamMemberRole,
  {
    label: string;
    icon: React.ElementType;
    className: string;
  }
>;

export function TeamRoleBadge({
  role,
}: TeamRoleBadgeProps) {
  const config = roleConfig[role];
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
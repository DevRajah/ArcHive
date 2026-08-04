import {
  Eye,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type {
  TeamInvitationRole,
} from "@/types/team.types";

interface InvitationRoleBadgeProps {
  role: TeamInvitationRole;
}

const roleConfig = {
  ADMIN: {
    label: "Admin",
    icon: ShieldCheck,
  },

  MEMBER: {
    label: "Member",
    icon: Users,
  },

  VIEWER: {
    label: "Viewer",
    icon: Eye,
  },
} satisfies Record<
  TeamInvitationRole,
  {
    label: string;
    icon: React.ElementType;
  }
>;

export function InvitationRoleBadge({
  role,
}: InvitationRoleBadgeProps) {
  const config =
    roleConfig[role];

  const Icon = config.icon;

  return (
    <Badge variant="secondary">
      <Icon className="mr-1.5 h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}
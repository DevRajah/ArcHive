import {
  Ban,
  CheckCircle2,
  Clock3,
  Mail,
} from "lucide-react";

import { TeamStatsCard } from "@/components/teams/TeamStatsCard";

import type {
  TeamInvitation,
} from "@/types/team.types";

interface InvitationInboxSummaryProps {
  invitations: TeamInvitation[];
}

export function InvitationInboxSummary({
  invitations,
}: InvitationInboxSummaryProps) {
  const pending =
    invitations.filter(
      (invitation) =>
        invitation.status ===
        "PENDING",
    ).length;

  const accepted =
    invitations.filter(
      (invitation) =>
        invitation.status ===
        "ACCEPTED",
    ).length;

  const inactive =
    invitations.filter(
      (invitation) =>
        invitation.status ===
          "REJECTED" ||
        invitation.status ===
          "EXPIRED" ||
        invitation.status ===
          "CANCELLED",
    ).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <TeamStatsCard
        title="All Invitations"
        value={invitations.length}
        description="Every Team invitation addressed to your account."
        icon={Mail}
      />

      <TeamStatsCard
        title="Pending"
        value={pending}
        description="Invitations currently waiting for your response."
        icon={Clock3}
      />

      <TeamStatsCard
        title="Accepted"
        value={accepted}
        description="Team Workspaces you joined through an invitation."
        icon={CheckCircle2}
      />

      <TeamStatsCard
        title="Inactive"
        value={inactive}
        description="Rejected, expired, or cancelled invitations."
        icon={Ban}
      />
    </div>
  );
}
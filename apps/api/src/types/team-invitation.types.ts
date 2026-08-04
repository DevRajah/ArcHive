import type {
    TeamInvitationStatus,
    TeamMemberRole,
} from "@prisma/client";

export interface CreateTeamInvitationInput {
    actorUserId: string;

    /**
     * Invitations currently target an existing ArcHive user.
     *
     * Email-only invitations for people without an ArcHive account
     * will be introduced later.
     */
    inviteeUserId: string;

    role: Exclude<
        TeamMemberRole,
        "OWNER"
    >;
}

export interface RespondToTeamInvitationInput {
    actorUserId: string;
}

export interface TeamInvitationResponse {
  id: string;
  teamId: string;

  role: Exclude<
    TeamMemberRole,
    "OWNER"
  >;

  status: TeamInvitationStatus;

  /**
   * Gives the frontend enough information to show which team
   * this invitation belongs to without making another API request.
   */
  team: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };

  invitedBy: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };

  invitee: {
    id: string;
    username: string;
    email: string | null;
    avatarUrl: string | null;
  };

  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;

  acceptedAt: Date | null;
  rejectedAt: Date | null;
  cancelledAt: Date | null;
}
import type {
  TeamInvitationStatus,
  TeamMemberRole,
} from "@prisma/client";

/**
 * User-facing invitation target.
 *
 * GitHub username is now the preferred identifier because users should
 * never need to know another ArcHive user's internal database UUID.
 */
type TeamInvitationUsernameTarget = {
  username: string;
  inviteeUserId?: never;
};

/**
 * Temporary compatibility path for existing internal consumers.
 *
 * Future me:
 * Remove this once every caller has migrated to GitHub username.
 */
type TeamInvitationLegacyUserTarget = {
  username?: never;
  inviteeUserId: string;
};

export type CreateTeamInvitationInput = {
  actorUserId: string;

  role: Exclude<
    TeamMemberRole,
    "OWNER"
  >;
} & (
  | TeamInvitationUsernameTarget
  | TeamInvitationLegacyUserTarget
);

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
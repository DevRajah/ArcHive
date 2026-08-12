import type { TeamMemberRole } from "@prisma/client";

export interface CreateTeamInput {
  userId: string;
  name: string;
  description?: string;
}

export interface UpdateTeamInput {
  actorUserId: string;
  name?: string;
  description?: string | null;
}

/**
 * A team member can be resolved through either their GitHub username or,
 * temporarily, their internal ArcHive user ID.
 *
 * Future me:
 * Username is the preferred user-facing contract.
 *
 * userId remains only as a compatibility path for older/internal consumers.
 * The two identifiers must never be supplied together.
 */
type AddTeamMemberTarget =
  | {
      username: string;
      userId?: never;
    }
  | {
      userId: string;
      username?: never;
    };

export type AddTeamMemberInput =
  AddTeamMemberTarget & {
    actorUserId: string;

    role?: Exclude<
      TeamMemberRole,
      "OWNER"
    >;
  };

export interface UpdateTeamMemberInput {
  actorUserId: string;
  role: Exclude<TeamMemberRole, "OWNER">;
}

export interface AddTeamRepositoryInput {
  actorUserId: string;
  repositoryId: string;
}

export interface TeamSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;

  role: TeamMemberRole;

  memberCount: number;
  repositoryCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMemberResponse {
  id: string;
  userId: string;
  username: string;
  email: string | null;
  avatarUrl: string | null;
  role: TeamMemberRole;
  joinedAt: Date;
}

export interface TeamRepositoryResponse {
  id: string;
  repositoryId: string;
  name: string;
  owner: string;
  fullName: string;
  description: string | null;
  language: string | null;
  isTracked: boolean;
  addedAt: Date;
  addedBy: {
    id: string;
    username: string;
  };
}
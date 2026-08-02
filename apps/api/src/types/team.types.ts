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

export interface AddTeamMemberInput {
  actorUserId: string;
  userId: string;
  role?: Exclude<TeamMemberRole, "OWNER">;
}

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
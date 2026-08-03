export type TeamMemberRole =
  | "OWNER"
  | "ADMIN"
  | "MEMBER"
  | "VIEWER";

export interface TeamSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  role: TeamMemberRole;
  memberCount: number;
  repositoryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListTeamsResponse {
  success: true;
  count: number;
  data: TeamSummary[];
}

export interface CreateTeamPayload {
  userId: string;
  name: string;
  description?: string;
}

export interface CreatedTeam {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  role: "OWNER";
  memberCount: number;
  repositoryCount: number;
}

export interface CreateTeamResponse {
  success: true;
  message: string;
  data: CreatedTeam;
}

export interface TeamCreator {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface TeamDetails {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  currentUserRole: TeamMemberRole;
  createdBy: TeamCreator;
  memberCount: number;
  repositoryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamDetailsResponse {
  success: true;
  data: TeamDetails;
}
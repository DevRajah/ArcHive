import { api } from "@/lib/api";

import type {
  AddTeamMemberPayload,
  AddTeamMemberResponse,
  CreateTeamPayload,
  CreateTeamResponse,
  ListTeamMembersResponse,
  ListTeamsResponse,
  RemoveTeamMemberResponse,
  TeamDashboard,
  TeamDetailsResponse,
  UpdateTeamMemberRolePayload,
  UpdateTeamMemberRoleResponse,
} from "@/types/team.types";

class TeamService {
  /**
   * Fetch every team the current ArcHive user belongs to.
   *
   * The shared Axios client already includes /api in its base URL.
   */
  async getTeams(
    userId: string,
  ): Promise<ListTeamsResponse> {
    const { data } =
      await api.get<ListTeamsResponse>(
        `/users/${userId}/teams`,
      );

    return data;
  }

  /**
   * Create a shared Team Workspace.
   *
   * The creating user automatically becomes the OWNER.
   */
  async createTeam(
    payload: CreateTeamPayload,
  ): Promise<CreateTeamResponse> {
    const { data } =
      await api.post<CreateTeamResponse>(
        "/teams",
        payload,
      );

    return data;
  }

  /**
   * Fetch one Team Workspace and the current user's role.
   *
   */
  async getTeam(
    teamId: string,
    userId: string,
  ): Promise<TeamDetailsResponse> {
    const { data } =
      await api.get<TeamDetailsResponse>(
        `/teams/${teamId}`,
        {
          params: {
            userId,
          },
        },
      );

    return data;
  }

  /**
 * Fetch the complete Team Intelligence dashboard.
 *
 */
/**
 * Fetch the complete Team Intelligence dashboard.
 *
 * Important:
 * The backend returns the raw TeamDashboard object.
 * It is not wrapped inside { success, data }.
 */
async getTeamDashboard(
  teamId: string,
): Promise<TeamDashboard> {
  const { data } =
    await api.get<TeamDashboard>(
      `/teams/${teamId}/dashboard`,
    );

  return data;
}


/**
 * Fetch all members belonging to a Team Workspace.
 */
async getTeamMembers(
  teamId: string,
  userId: string,
): Promise<ListTeamMembersResponse> {
  const { data } =
    await api.get<ListTeamMembersResponse>(
      `/teams/${teamId}/members`,
      {
        params: {
          userId,
        },
      },
    );

  return data;
}

/**
 * Add an existing ArcHive user to a Team Workspace.
 *
 * OWNER and ADMIN can add members.
 * OWNER cannot be assigned through this endpoint.
 */
async addTeamMember(
  teamId: string,
  payload: AddTeamMemberPayload,
): Promise<AddTeamMemberResponse> {
  const { data } =
    await api.post<AddTeamMemberResponse>(
      `/teams/${teamId}/members`,
      payload,
    );

  return data;
}

/**
 * Update a Team member's role.
 *
 * The Team owner cannot be downgraded through this endpoint.
 */
async updateTeamMemberRole(
  teamId: string,
  memberId: string,
  payload: UpdateTeamMemberRolePayload,
): Promise<UpdateTeamMemberRoleResponse> {
  const { data } =
    await api.patch<UpdateTeamMemberRoleResponse>(
      `/teams/${teamId}/members/${memberId}`,
      payload,
    );

  return data;
}

/**
 * Remove a member from a Team Workspace.
 */
async removeTeamMember(
  teamId: string,
  memberId: string,
  actorUserId: string,
): Promise<RemoveTeamMemberResponse> {
  const { data } =
    await api.delete<RemoveTeamMemberResponse>(
      `/teams/${teamId}/members/${memberId}`,
      {
        params: {
          actorUserId,
        },
      },
    );

  return data;
}
}

export const teamService =
  new TeamService();

  
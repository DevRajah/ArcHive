import { api } from "@/lib/api";

import type {
  CreateTeamPayload,
  CreateTeamResponse,
  ListTeamsResponse,
  TeamDetailsResponse,
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
}

export const teamService =
  new TeamService();
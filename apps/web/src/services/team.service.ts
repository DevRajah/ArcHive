import { api } from "@/lib/api";

import type {
  AddTeamMemberPayload,
  AddTeamMemberResponse,
  AddTeamRepositoryPayload,
  AddTeamRepositoryResponse,
  CreateTeamPayload,
  CreateTeamResponse,
  DeleteTeamReportResponse,
  GenerateTeamReportPayload,
  GenerateTeamReportResponse,
  GetTeamReportResponse,
  ListTeamMembersResponse,
  ListTeamRepositoriesResponse,
  ListTeamReportsResponse,
  ListTeamsResponse,
  RemoveTeamMemberResponse,
  RemoveTeamRepositoryResponse,
  TeamDashboard,
  TeamDetailsResponse,
  TeamExecutiveReport,
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


/**
 * Fetch repositories attached to one Team Workspace.
 */
async getTeamRepositories(
  teamId: string,
  userId: string,
): Promise<ListTeamRepositoriesResponse> {
  const { data } =
    await api.get<ListTeamRepositoriesResponse>(
      `/teams/${teamId}/repositories`,
      {
        params: {
          userId,
        },
      },
    );

  return data;
}

/**
 * Attach one repository to a Team Workspace.
 *
 * Only repositories belonging to the acting user's
 * ArcHive account can be attached.
 */
async addTeamRepository(
  teamId: string,
  payload: AddTeamRepositoryPayload,
): Promise<AddTeamRepositoryResponse> {
  const { data } =
    await api.post<AddTeamRepositoryResponse>(
      `/teams/${teamId}/repositories`,
      payload,
    );

  return data;
}

/**
 * Remove one repository from the Team Workspace.
 */
async removeTeamRepository(
  teamId: string,
  repositoryId: string,
  actorUserId: string,
): Promise<RemoveTeamRepositoryResponse> {
  const { data } =
    await api.delete<RemoveTeamRepositoryResponse>(
      `/teams/${teamId}/repositories/${repositoryId}`,
      {
        params: {
          actorUserId,
        },
      },
    );

  return data;
}

/**
 * Fetch every Executive Report generated for one Team Workspace.
 */
async getTeamReports(
  teamId: string,
  userId: string,
): Promise<ListTeamReportsResponse> {
  const { data } =
    await api.get<ListTeamReportsResponse>(
      `/teams/${teamId}/reports`,
      {
        params: {
          userId,
        },
      },
    );

  return data;
}

/**
 * Queue a Team Executive Report.
 *
 * OWNER, ADMIN, and MEMBER can generate reports.
 */
async generateTeamReport(
  teamId: string,
  payload: GenerateTeamReportPayload,
): Promise<GenerateTeamReportResponse> {
  const { data } =
    await api.post<GenerateTeamReportResponse>(
      `/teams/${teamId}/reports/generate`,
      payload,
    );

  return data;
}

/**
 * Fetch one Team Report with its stored Schema v3 snapshot.
 */
async getTeamReport(
  teamId: string,
  reportId: string,
  userId: string,
): Promise<TeamExecutiveReport> {
  const { data } =
    await api.get<GetTeamReportResponse>(
      `/teams/${teamId}/reports/${reportId}`,
      {
        params: {
          userId,
        },
      },
    );

  return data.report;
}

/**
 * Download a completed Team Report as PDF.
 */
async downloadTeamReportPdf(
  teamId: string,
  reportId: string,
  userId: string,
): Promise<Blob> {
  const { data } =
    await api.get<Blob>(
      `/teams/${teamId}/reports/${reportId}/download/pdf`,
      {
        params: {
          userId,
        },
        responseType: "blob",
      },
    );

  return data;
}

/**
 * Download a completed Team Report as CSV.
 */
async downloadTeamReportCsv(
  teamId: string,
  reportId: string,
  userId: string,
): Promise<Blob> {
  const { data } =
    await api.get<Blob>(
      `/teams/${teamId}/reports/${reportId}/download/csv`,
      {
        params: {
          userId,
        },
        responseType: "blob",
      },
    );

  return data;
}

/**
 * Delete one Team Executive Report.
 *
 * Only OWNER and ADMIN can perform this action.
 */
async deleteTeamReport(
  teamId: string,
  reportId: string,
  actorUserId: string,
): Promise<DeleteTeamReportResponse> {
  const { data } =
    await api.delete<DeleteTeamReportResponse>(
      `/teams/${teamId}/reports/${reportId}`,
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

  
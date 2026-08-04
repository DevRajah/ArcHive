"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { teamService } from "@/services/team.service";

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

export const TEAM_QUERY_KEYS = {
  teams: (userId: string) =>
    ["teams", userId] as const,

  team: (
    teamId: string,
    userId: string,
  ) =>
    ["team", teamId, userId] as const,

  dashboard: (teamId: string) =>
    ["team-dashboard", teamId] as const,

  members: (
    teamId: string,
    userId: string,
  ) =>
    [
      "team-members",
      teamId,
      userId,
    ] as const,

  repositories: (
    teamId: string,
    userId: string,
  ) =>
    [
      "team-repositories",
      teamId,
      userId,
    ] as const,

  reports: (
    teamId: string,
    userId: string,
  ) =>
    [
      "team-reports",
      teamId,
      userId,
    ] as const,

  report: (
    teamId: string,
    reportId: string,
    userId: string,
  ) =>
    [
      "team-report",
      teamId,
      reportId,
      userId,
    ] as const,
};

/**
 * Load every Team Workspace available to one user.
 */
export function useTeams(
  userId: string,
) {
  return useQuery<ListTeamsResponse>({
    queryKey:
      TEAM_QUERY_KEYS.teams(userId),

    queryFn: () =>
      teamService.getTeams(userId),

    enabled: Boolean(userId),

    staleTime: 1000 * 60 * 2,

    refetchOnWindowFocus: false,
  });
}

/**
 * Load one Team Workspace and the current user's role.
 */
export function useTeam(
  teamId: string,
  userId: string,
) {
  return useQuery<TeamDetailsResponse>({
    queryKey:
      TEAM_QUERY_KEYS.team(
        teamId,
        userId,
      ),

    queryFn: () =>
      teamService.getTeam(
        teamId,
        userId,
      ),

    enabled:
      Boolean(teamId) &&
      Boolean(userId),

    refetchOnWindowFocus: false,
  });
}

/**
 * Create a Team Workspace and refresh the user's team list.
 */
export function useCreateTeam(
  userId: string,
) {
  const queryClient =
    useQueryClient();

  return useMutation<
    CreateTeamResponse,
    Error,
    CreateTeamPayload
  >({
    mutationFn: (
      payload: CreateTeamPayload,
    ) =>
      teamService.createTeam(
        payload,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          TEAM_QUERY_KEYS.teams(
            userId,
          ),
      });
    },
  });
}


/**
 * Load the complete Team Intelligence dashboard.
 */
export function useTeamDashboard(
  teamId: string,
) {
  return useQuery<TeamDashboard>({
    queryKey:
      TEAM_QUERY_KEYS.dashboard(teamId),

    queryFn: () =>
      teamService.getTeamDashboard(
        teamId,
      ),

    enabled: Boolean(teamId),

    staleTime: 1000 * 60 * 2,

    refetchOnWindowFocus: false,
  });
}

/**
 * Load all members of a Team Workspace.
 */
export function useTeamMembers(
  teamId: string,
  userId: string,
) {
  return useQuery<ListTeamMembersResponse>({
    queryKey:
      TEAM_QUERY_KEYS.members(
        teamId,
        userId,
      ),

    queryFn: () =>
      teamService.getTeamMembers(
        teamId,
        userId,
      ),

    enabled:
      Boolean(teamId) &&
      Boolean(userId),

    staleTime: 1000 * 60,

    refetchOnWindowFocus: false,
  });
}

/**
 * Add a new member to a Team Workspace.
 */
export function useAddTeamMember(
  teamId: string,
  userId: string,
) {
  const queryClient =
    useQueryClient();

  return useMutation<
    AddTeamMemberResponse,
    Error,
    AddTeamMemberPayload
  >({
    mutationFn: (payload) =>
      teamService.addTeamMember(
        teamId,
        payload,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          TEAM_QUERY_KEYS.members(
            teamId,
            userId,
          ),
      });

      queryClient.invalidateQueries({
        queryKey:
          TEAM_QUERY_KEYS.team(
            teamId,
            userId,
          ),
      });

      queryClient.invalidateQueries({
        queryKey:
          TEAM_QUERY_KEYS.dashboard(
            teamId,
          ),
      });
    },
  });
}

/**
 * Update a Team member's role.
 */
export function useUpdateTeamMemberRole(
  teamId: string,
  userId: string,
) {
  const queryClient =
    useQueryClient();

  return useMutation<
    UpdateTeamMemberRoleResponse,
    Error,
    {
      memberId: string;
      payload: UpdateTeamMemberRolePayload;
    }
  >({
    mutationFn: ({
      memberId,
      payload,
    }) =>
      teamService.updateTeamMemberRole(
        teamId,
        memberId,
        payload,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          TEAM_QUERY_KEYS.members(
            teamId,
            userId,
          ),
      });

      queryClient.invalidateQueries({
        queryKey:
          TEAM_QUERY_KEYS.team(
            teamId,
            userId,
          ),
      });
    },
  });
}

/**
 * Remove a member from a Team Workspace.
 */
export function useRemoveTeamMember(
  teamId: string,
  userId: string,
) {
  const queryClient =
    useQueryClient();

  return useMutation<
    RemoveTeamMemberResponse,
    Error,
    {
      memberId: string;
      actorUserId: string;
    }
  >({
    mutationFn: ({
      memberId,
      actorUserId,
    }) =>
      teamService.removeTeamMember(
        teamId,
        memberId,
        actorUserId,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          TEAM_QUERY_KEYS.members(
            teamId,
            userId,
          ),
      });

      queryClient.invalidateQueries({
        queryKey:
          TEAM_QUERY_KEYS.team(
            teamId,
            userId,
          ),
      });

      queryClient.invalidateQueries({
        queryKey:
          TEAM_QUERY_KEYS.dashboard(
            teamId,
          ),
      });
    },
  });
}
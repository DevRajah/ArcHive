"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { teamService } from "@/services/team.service";

import type {
  CreateTeamPayload,
  CreateTeamResponse,
  ListTeamsResponse,
  TeamDashboard,
  TeamDetailsResponse,
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
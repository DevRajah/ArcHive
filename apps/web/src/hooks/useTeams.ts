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
    AddTeamRepositoryPayload,
    AddTeamRepositoryResponse,
    CreateTeamPayload,
    CreateTeamResponse,
    DeleteTeamReportResponse,
    GenerateTeamReportPayload,
    GenerateTeamReportResponse,
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
    CancelTeamInvitationResponse,
    CreateTeamInvitationPayload,
    CreateTeamInvitationResponse,
    ListTeamInvitationsResponse,
    ListUserTeamInvitationsResponse,
    RespondToTeamInvitationResponse,
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

    invitations: (
        teamId: string,
        userId: string,
    ) =>
        [
            "team-invitations",
            teamId,
            userId,
        ] as const,

    userInvitations: (
        userId: string,
    ) =>
        [
            "user-team-invitations",
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

/**
 * Load all repositories attached to a Team Workspace.
 */
export function useTeamRepositories(
    teamId: string,
    userId: string,
) {
    return useQuery<ListTeamRepositoriesResponse>({
        queryKey:
            TEAM_QUERY_KEYS.repositories(
                teamId,
                userId,
            ),

        queryFn: () =>
            teamService.getTeamRepositories(
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
 * Attach one repository to a Team Workspace.
 */
export function useAddTeamRepository(
    teamId: string,
    userId: string,
) {
    const queryClient =
        useQueryClient();

    return useMutation<
        AddTeamRepositoryResponse,
        Error,
        AddTeamRepositoryPayload
    >({
        mutationFn: (payload) =>
            teamService.addTeamRepository(
                teamId,
                payload,
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey:
                    TEAM_QUERY_KEYS.repositories(
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
 * Remove one repository from a Team Workspace.
 */
export function useRemoveTeamRepository(
    teamId: string,
    userId: string,
) {
    const queryClient =
        useQueryClient();

    return useMutation<
        RemoveTeamRepositoryResponse,
        Error,
        {
            repositoryId: string;
            actorUserId: string;
        }
    >({
        mutationFn: ({
            repositoryId,
            actorUserId,
        }) =>
            teamService.removeTeamRepository(
                teamId,
                repositoryId,
                actorUserId,
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey:
                    TEAM_QUERY_KEYS.repositories(
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
 * Load all Executive Reports generated for a Team Workspace.
 */
export function useTeamReports(
    teamId: string,
    userId: string,
) {
    return useQuery<ListTeamReportsResponse>({
        queryKey:
            TEAM_QUERY_KEYS.reports(
                teamId,
                userId,
            ),

        queryFn: () =>
            teamService.getTeamReports(
                teamId,
                userId,
            ),

        enabled:
            Boolean(teamId) &&
            Boolean(userId),

        refetchInterval: (query) => {
            const reports =
                query.state.data?.reports ?? [];

            const hasActiveReport =
                reports.some(
                    (report) =>
                        report.status === "QUEUED" ||
                        report.status === "GENERATING",
                );

            return hasActiveReport
                ? 5000
                : false;
        },

        refetchOnWindowFocus: false,
    });
}

/** * Load one Executive Report generated for a Team Workspace.
 */
export function useTeamReport(
    teamId: string,
    reportId: string,
    userId: string,
) {
    return useQuery<TeamExecutiveReport>({
        queryKey:
            TEAM_QUERY_KEYS.report(
                teamId,
                reportId,
                userId,
            ),

        queryFn: () =>
            teamService.getTeamReport(
                teamId,
                reportId,
                userId,
            ),

        enabled:
            Boolean(teamId) &&
            Boolean(reportId) &&
            Boolean(userId),

        refetchOnWindowFocus: false,
    });
}

/**
 * Queue a new Executive Report for a Team Workspace.
 */
export function useGenerateTeamReport(
    teamId: string,
    userId: string,
) {
    const queryClient =
        useQueryClient();

    return useMutation<
        GenerateTeamReportResponse,
        Error,
        GenerateTeamReportPayload
    >({
        mutationFn: (payload) =>
            teamService.generateTeamReport(
                teamId,
                payload,
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey:
                    TEAM_QUERY_KEYS.reports(
                        teamId,
                        userId,
                    ),
            });
        },
    });
}

/**
 * Delete one Executive Report from a Team Workspace.
 */
export function useDeleteTeamReport(
    teamId: string,
    userId: string,
) {
    const queryClient =
        useQueryClient();

    return useMutation<
        DeleteTeamReportResponse,
        Error,
        {
            reportId: string;
            actorUserId: string;
        }
    >({
        mutationFn: ({
            reportId,
            actorUserId,
        }) =>
            teamService.deleteTeamReport(
                teamId,
                reportId,
                actorUserId,
            ),

        onSuccess: (
            _response,
            variables,
        ) => {
            queryClient.removeQueries({
                queryKey:
                    TEAM_QUERY_KEYS.report(
                        teamId,
                        variables.reportId,
                        userId,
                    ),
            });

            queryClient.invalidateQueries({
                queryKey:
                    TEAM_QUERY_KEYS.reports(
                        teamId,
                        userId,
                    ),
            });
        },
    });
}

export function useTeamInvitations(
    teamId: string,
    userId: string,
) {
    return useQuery<ListTeamInvitationsResponse>({
        queryKey:
            TEAM_QUERY_KEYS.invitations(
                teamId,
                userId,
            ),

        queryFn: () =>
            teamService.getTeamInvitations(
                teamId,
                userId,
            ),

        enabled:
            Boolean(teamId) &&
            Boolean(userId),

        staleTime: 1000 * 30,

        refetchOnWindowFocus: false,
    });
}

export function useCreateTeamInvitation(
    teamId: string,
    userId: string,
) {
    const queryClient =
        useQueryClient();

    return useMutation<
        CreateTeamInvitationResponse,
        Error,
        CreateTeamInvitationPayload
    >({
        mutationFn: (payload) =>
            teamService.createTeamInvitation(
                teamId,
                payload,
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey:
                    TEAM_QUERY_KEYS.invitations(
                        teamId,
                        userId,
                    ),
            });
        },
    });
}

export function useCancelTeamInvitation(
    teamId: string,
    userId: string,
) {
    const queryClient =
        useQueryClient();

    return useMutation<
        CancelTeamInvitationResponse,
        Error,
        {
            invitationId: string;
            actorUserId: string;
        }
    >({
        mutationFn: ({
            invitationId,
            actorUserId,
        }) =>
            teamService.cancelTeamInvitation(
                teamId,
                invitationId,
                actorUserId,
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey:
                    TEAM_QUERY_KEYS.invitations(
                        teamId,
                        userId,
                    ),
            });
        },
    });
}

export function useUserTeamInvitations(
    userId: string,
) {
    return useQuery<ListUserTeamInvitationsResponse>({
        queryKey:
            TEAM_QUERY_KEYS.userInvitations(
                userId,
            ),

        queryFn: () =>
            teamService.getUserTeamInvitations(
                userId,
            ),

        enabled: Boolean(userId),

        staleTime: 1000 * 30,

        refetchOnWindowFocus: false,
    });
}

export function useAcceptTeamInvitation(
    userId: string,
) {
    const queryClient =
        useQueryClient();

    return useMutation<
        RespondToTeamInvitationResponse,
        Error,
        {
            invitationId: string;
            actorUserId: string;
        }
    >({
        mutationFn: ({
            invitationId,
            actorUserId,
        }) =>
            teamService.acceptTeamInvitation(
                invitationId,
                {
                    actorUserId,
                },
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey:
                    TEAM_QUERY_KEYS.userInvitations(
                        userId,
                    ),
            });

            queryClient.invalidateQueries({
                queryKey:
                    TEAM_QUERY_KEYS.teams(
                        userId,
                    ),
            });
        },
    });
}

export function useRejectTeamInvitation(
    userId: string,
) {
    const queryClient =
        useQueryClient();

    return useMutation<
        RespondToTeamInvitationResponse,
        Error,
        {
            invitationId: string;
            actorUserId: string;
        }
    >({
        mutationFn: ({
            invitationId,
            actorUserId,
        }) =>
            teamService.rejectTeamInvitation(
                invitationId,
                {
                    actorUserId,
                },
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey:
                    TEAM_QUERY_KEYS.userInvitations(
                        userId,
                    ),
            });
        },
    });
}
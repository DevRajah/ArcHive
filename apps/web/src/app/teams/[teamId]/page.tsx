"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    useParams,
    useRouter,
    useSearchParams,
} from "next/navigation";

import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";

import { TeamWorkspaceError } from "@/components/teams/workspace/TeamWorkspaceError";
import { TeamWorkspaceHeader } from "@/components/teams/workspace/TeamWorkspaceHeader";
import { TeamWorkspaceNavigation } from "@/components/teams/workspace/TeamWorkspaceNavigation";
import { TeamWorkspaceOverview } from "@/components/teams/workspace/TeamWorkspaceOverview";
import { TeamWorkspacePlaceholder } from "@/components/teams/workspace/TeamWorkspacePlaceholder";
import { TeamWorkspaceSkeleton } from "@/components/teams/workspace/TeamWorkspaceSkeleton";
import { TeamMembersPanel } from "@/components/teams/members/TeamMembersPanel";

import { useTeam } from "@/hooks/useTeams";

import { getTeamPermissions } from "@/lib/team-permissions";

import type {
    TeamWorkspaceTab,
} from "@/types/team-workspace.types";
import { TeamRepositoriesPanel } from "@/components/teams/repositories/TeamRepositoriesPanel";

interface ArcHiveSession {
    userId?: string;
    username?: string;
    avatarUrl?: string;
    token?: string;
}

const validTabs: TeamWorkspaceTab[] = [
    "overview",
    "repositories",
    "members",
    "reports",
    "settings",
];

function getStoredUserId() {
    if (
        typeof window === "undefined"
    ) {
        return "";
    }

    const storedSession =
        window.localStorage.getItem(
            "archive_session",
        );

    if (!storedSession) {
        return "";
    }

    try {
        const session =
            JSON.parse(
                storedSession,
            ) as ArcHiveSession;

        return session.userId ?? "";
    } catch {
        return "";
    }
}

function isTeamWorkspaceTab(
    value: string | null,
): value is TeamWorkspaceTab {
    return Boolean(
        value &&
        validTabs.includes(
            value as TeamWorkspaceTab,
        ),
    );
}

export default function TeamWorkspacePage() {
    const params =
        useParams<{
            teamId: string;
        }>();

    const router = useRouter();
    const searchParams =
        useSearchParams();

    const teamId = params.teamId;

    const [userId, setUserId] =
        useState("");

    const [
        hasLoadedSession,
        setHasLoadedSession,
    ] = useState(false);

    useEffect(() => {
        setUserId(
            getStoredUserId(),
        );

        setHasLoadedSession(true);
    }, []);

    const requestedTab =
        searchParams.get("tab");

    const activeTab: TeamWorkspaceTab =
        isTeamWorkspaceTab(
            requestedTab,
        )
            ? requestedTab
            : "overview";

    const teamQuery =
        useTeam(teamId, userId);

    const team =
        teamQuery.data?.data;

    const permissions = team
        ? getTeamPermissions(
            team.currentUserRole,
        )
        : null;

    useEffect(() => {
        if (
            activeTab === "settings" &&
            permissions &&
            !permissions.canManageSettings
        ) {
            router.replace(
                `/teams/${teamId}?tab=overview`,
            );

            toast.warning(
                "You do not have permission to manage workspace settings.",
            );
        }
    }, [
        activeTab,
        permissions,
        router,
        teamId,
    ]);

    function handleTabChange(
        tab: TeamWorkspaceTab,
    ) {
        if (
            tab === "settings" &&
            !permissions?.canManageSettings
        ) {
            toast.warning(
                "You do not have permission to manage workspace settings.",
            );

            return;
        }

        router.push(
            `/teams/${teamId}?tab=${tab}`,
        );
    }

    if (
        !hasLoadedSession ||
        teamQuery.isLoading
    ) {
        return (
            <AppShell>
                <main className="p-4 sm:p-6 lg:p-8">
                    <TeamWorkspaceSkeleton />
                </main>
            </AppShell>
        );
    }

    if (!userId) {
        return (
            <AppShell>
                <main className="p-4 sm:p-6 lg:p-8">
                    <TeamWorkspaceError
                        message="Your ArcHive session could not be found. Please reconnect your account."
                        isRetrying={false}
                        onRetry={() => {
                            const storedUserId =
                                getStoredUserId();

                            setUserId(
                                storedUserId,
                            );

                            if (!storedUserId) {
                                toast.error(
                                    "Your ArcHive session could not be found.",
                                );
                            }
                        }}
                    />
                </main>
            </AppShell>
        );
    }

    if (
        teamQuery.isError ||
        !team ||
        !permissions
    ) {
        return (
            <AppShell>
                <main className="p-4 sm:p-6 lg:p-8">
                    <TeamWorkspaceError
                        message={
                            teamQuery.error instanceof
                                Error
                                ? teamQuery.error.message
                                : undefined
                        }
                        isRetrying={
                            teamQuery.isFetching
                        }
                        onRetry={() =>
                            teamQuery.refetch()
                        }
                    />
                </main>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <main className="space-y-6 p-4 sm:p-6 lg:p-8">
                <TeamWorkspaceHeader
                    team={team}
                    canManageSettings={
                        permissions.canManageSettings
                    }
                    onOpenSettings={() =>
                        handleTabChange(
                            "settings",
                        )
                    }
                />

                <TeamWorkspaceNavigation
                    activeTab={activeTab}
                    canViewSettings={
                        permissions.canManageSettings
                    }
                    onTabChange={
                        handleTabChange
                    }
                />

                {activeTab === "overview" ? (
                    <TeamWorkspaceOverview
                        teamId={teamId}
                        teamName={team.name}
                    />
                ) : activeTab === "repositories" ? (
                    <TeamRepositoriesPanel
                        teamId={teamId}
                        userId={userId}
                        canManageRepositories={
                            permissions.canManageRepositories
                        }
                    />
                ) : activeTab === "members" ? (
                    <TeamMembersPanel
                        teamId={teamId}
                        userId={userId}
                        canManageMembers={
                            permissions.canManageMembers
                        }
                    />
                ) : (
                    <TeamWorkspacePlaceholder
                        tab={activeTab}
                    />
                )}
            </main>
        </AppShell>
    );
}
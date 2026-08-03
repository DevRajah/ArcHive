"use client";

import {
  useEffect,
  useState,
} from "react";

import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";

import { CreateTeamDialog } from "@/components/teams/CreateTeamDialog";
import { TeamGrid } from "@/components/teams/TeamGrid";
import { TeamsEmptyState } from "@/components/teams/TeamsEmptyState";
import { TeamsErrorState } from "@/components/teams/TeamsErrorState";
import { TeamsHeader } from "@/components/teams/TeamsHeader";
import { TeamsSkeleton } from "@/components/teams/TeamsSkeleton";
import { TeamsSummaryCards } from "@/components/teams/TeamsSummaryCards";

import { useTeams } from "@/hooks/useTeams";

interface ArcHiveSession {
  userId?: string;
  username?: string;
  avatarUrl?: string;
  token?: string;
}

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

export default function TeamsPage() {
  const [userId, setUserId] =
    useState("");

  const [
    hasLoadedSession,
    setHasLoadedSession,
  ] = useState(false);

  const [
    isCreateTeamOpen,
    setIsCreateTeamOpen,
  ] = useState(false);

  useEffect(() => {
    setUserId(
      getStoredUserId(),
    );

    setHasLoadedSession(true);
  }, []);

  const teamsQuery =
    useTeams(userId);

  const teams =
    teamsQuery.data?.data ?? [];

  function handleCreateTeam() {
    if (!userId) {
      toast.error(
        "Your ArcHive session could not be found. Please reconnect your account.",
      );

      return;
    }

    setIsCreateTeamOpen(true);
  }

  return (
    <AppShell>
      <main className="space-y-6 p-4 sm:p-6 lg:p-8">
        {!hasLoadedSession ||
        teamsQuery.isLoading ? (
          <TeamsSkeleton />
        ) : !userId ? (
          <TeamsErrorState
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
        ) : teamsQuery.isError ? (
          <TeamsErrorState
            isRetrying={
              teamsQuery.isFetching
            }
            onRetry={() =>
              teamsQuery.refetch()
            }
          />
        ) : (
          <>
            <TeamsHeader
              onCreateTeam={
                handleCreateTeam
              }
            />

            {teams.length > 0 ? (
              <TeamsSummaryCards
                teams={teams}
              />
            ) : null}

            {teams.length === 0 ? (
              <TeamsEmptyState
                onCreateTeam={
                  handleCreateTeam
                }
              />
            ) : (
              <TeamGrid
                teams={teams}
              />
            )}
          </>
        )}

        <CreateTeamDialog
          userId={userId}
          open={isCreateTeamOpen}
          onOpenChange={
            setIsCreateTeamOpen
          }
        />
      </main>
    </AppShell>
  );
}
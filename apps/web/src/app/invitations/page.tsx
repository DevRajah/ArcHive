"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Mail,
  RefreshCcw,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";

import { isAxiosError } from "axios";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";

import { InvitationInboxEmptyState } from "@/components/invitations/InvitationInboxEmptyState";
import { InvitationInboxSkeleton } from "@/components/invitations/InvitationInboxSkeleton";
import { InvitationInboxSummary } from "@/components/invitations/InvitationInboxSummary";
import { RejectInvitationDialog } from "@/components/invitations/RejectInvitationDialog";
import { UserInvitationCard } from "@/components/invitations/UserInvitationCard";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useAcceptTeamInvitation,
  useRejectTeamInvitation,
  useUserTeamInvitations,
} from "@/hooks/useTeams";

import type {
  TeamInvitation,
  TeamInvitationStatus,
} from "@/types/team.types";

interface ArcHiveSession {
  userId?: string;
}

type InvitationFilter =
  | TeamInvitationStatus
  | "ALL";

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

function getErrorMessage(
  error: unknown,
) {
  if (isAxiosError(error)) {
    const responseData =
      error.response?.data as
        | {
            message?: string;
          }
        | undefined;

    return (
      responseData?.message ||
      error.message
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The invitation action could not be completed.";
}

export default function InvitationsPage() {
  const [userId, setUserId] =
    useState("");

  const [
    hasLoadedSession,
    setHasLoadedSession,
  ] = useState(false);

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<InvitationFilter>(
      "ALL",
    );

  const [
    invitationToReject,
    setInvitationToReject,
  ] =
    useState<TeamInvitation | null>(
      null,
    );

  const [
    acceptingInvitationId,
    setAcceptingInvitationId,
  ] = useState<string | null>(null);

  useEffect(() => {
    setUserId(
      getStoredUserId(),
    );

    setHasLoadedSession(true);
  }, []);

  const invitationsQuery =
    useUserTeamInvitations(
      userId,
    );

  const acceptMutation =
    useAcceptTeamInvitation(
      userId,
    );

  const rejectMutation =
    useRejectTeamInvitation(
      userId,
    );

  const invitations =
    invitationsQuery.data?.data ?? [];

  const visibleInvitations =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return [...invitations]
        .filter((invitation) => {
          const matchesStatus =
            statusFilter === "ALL" ||
            invitation.status ===
              statusFilter;

          const matchesSearch =
            !normalizedSearch ||
            invitation.team.name
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            invitation.team.description
              ?.toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            invitation.invitedBy.username
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          return (
            matchesStatus &&
            matchesSearch
          );
        })
        .sort(
          (first, second) =>
            new Date(
              second.createdAt,
            ).getTime() -
            new Date(
              first.createdAt,
            ).getTime(),
        );
    }, [
      invitations,
      search,
      statusFilter,
    ]);

  async function handleAccept(
    invitation: TeamInvitation,
  ) {
    if (!userId) {
      toast.error(
        "Your ArcHive session could not be found.",
      );

      return;
    }

    try {
      setAcceptingInvitationId(
        invitation.id,
      );

      const response =
        await acceptMutation.mutateAsync(
          {
            invitationId:
              invitation.id,
            actorUserId: userId,
          },
        );

      toast.success(
        response.message ||
          `You have joined ${invitation.team.name}.`,
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error),
      );
    } finally {
      setAcceptingInvitationId(
        null,
      );
    }
  }

  async function handleReject() {
    if (
      !invitationToReject ||
      !userId
    ) {
      return;
    }

    try {
      const response =
        await rejectMutation.mutateAsync(
          {
            invitationId:
              invitationToReject.id,
            actorUserId: userId,
          },
        );

      setInvitationToReject(null);

      toast.success(
        response.message ||
          "Team invitation rejected.",
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error),
      );
    }
  }

  if (
    !hasLoadedSession ||
    invitationsQuery.isLoading
  ) {
    return (
      <AppShell>
        <main className="p-4 sm:p-6 lg:p-8">
          <InvitationInboxSkeleton />
        </main>
      </AppShell>
    );
  }

  if (
    !userId ||
    invitationsQuery.isError ||
    !invitationsQuery.data
  ) {
    return (
      <AppShell>
        <main className="p-4 sm:p-6 lg:p-8">
          <Card className="flex min-h-[420px] items-center justify-center border-dashed">
            <div className="max-w-md px-6 py-14 text-center">
              <TriangleAlert className="mx-auto h-10 w-10 text-destructive" />

              <h2 className="mt-4 text-xl font-semibold">
                Unable to Load Invitations
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {!userId
                  ? "Your ArcHive session could not be found."
                  : "ArcHive could not load your Team Invitation Inbox."}
              </p>

              <Button
                variant="outline"
                className="mt-6"
                disabled={
                  invitationsQuery.isFetching
                }
                onClick={() => {
                  if (!userId) {
                    setUserId(
                      getStoredUserId(),
                    );

                    return;
                  }

                  invitationsQuery.refetch();
                }}
              >
                <RefreshCcw
                  className={`mr-2 h-4 w-4 ${
                    invitationsQuery.isFetching
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Retry
              </Button>
            </div>
          </Card>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="space-y-6 p-4 sm:p-6 lg:p-8">
        <header className="flex items-start gap-3">
          <div className="mt-1 hidden rounded-xl border bg-muted/40 p-2.5 sm:block">
            <Mail className="h-5 w-5 text-muted-foreground" />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Team Invitations
            </h1>

            <p className="mt-2 max-w-2xl text-muted-foreground">
              Review and respond to Team Workspace invitations
              addressed to your ArcHive account.
            </p>
          </div>
        </header>

        {!invitations.length ? (
          <InvitationInboxEmptyState />
        ) : (
          <>
            <InvitationInboxSummary
              invitations={invitations}
            />

            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  className="pl-9 pr-9"
                  placeholder="Search by team or inviter..."
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                />

                {search ? (
                  <button
                    type="button"
                    aria-label="Clear invitation search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                    onClick={() =>
                      setSearch("")
                    }
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(
                    value as InvitationFilter,
                  )
                }
              >
                <SelectTrigger className="w-full lg:w-52">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">
                    All statuses
                  </SelectItem>

                  <SelectItem value="PENDING">
                    Pending
                  </SelectItem>

                  <SelectItem value="ACCEPTED">
                    Accepted
                  </SelectItem>

                  <SelectItem value="REJECTED">
                    Rejected
                  </SelectItem>

                  <SelectItem value="EXPIRED">
                    Expired
                  </SelectItem>

                  <SelectItem value="CANCELLED">
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!visibleInvitations.length ? (
              <Card className="border-dashed px-6 py-16 text-center">
                <h2 className="text-lg font-semibold">
                  No Matching Invitations
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Change the search term or status filter.
                </p>

                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                  }}
                >
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visibleInvitations.map(
                  (invitation) => (
                    <UserInvitationCard
                      key={invitation.id}
                      invitation={
                        invitation
                      }
                      isAccepting={
                        acceptingInvitationId ===
                        invitation.id
                      }
                      isRejecting={
                        rejectMutation.isPending &&
                        invitationToReject?.id ===
                          invitation.id
                      }
                      onAccept={
                        handleAccept
                      }
                      onReject={
                        setInvitationToReject
                      }
                    />
                  ),
                )}
              </div>
            )}
          </>
        )}

        <RejectInvitationDialog
          invitation={
            invitationToReject
          }
          open={Boolean(
            invitationToReject,
          )}
          loading={
            rejectMutation.isPending
          }
          onConfirm={
            handleReject
          }
          onOpenChange={(open) => {
            if (!open) {
              setInvitationToReject(
                null,
              );
            }
          }}
        />
      </main>
    </AppShell>
  );
}
"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  LockKeyhole,
  MailPlus,
  RefreshCcw,
  Search,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { CancelInvitationDialog } from "@/components/teams/invitations/CancelInvitationDialog";
import { InviteTeamUserDialog } from "@/components/teams/invitations/InviteTeamUserDialog";
import { TeamInvitationHistory } from "@/components/teams/invitations/TeamInvitationHistory";

import { useTeamInvitations } from "@/hooks/useTeams";

import type {
  TeamInvitation,
  TeamInvitationStatus,
} from "@/types/team.types";

interface TeamInvitationsPanelProps {
  teamId: string;
  userId: string;
  canManageInvitations: boolean;
}

export function TeamInvitationsPanel({
  teamId,
  userId,
  canManageInvitations,
}: TeamInvitationsPanelProps) {
  const invitationsQuery =
    useTeamInvitations(
      teamId,
      userId,
    );

  const [
    isInviteOpen,
    setIsInviteOpen,
  ] = useState(false);

  const [
    invitationToCancel,
    setInvitationToCancel,
  ] =
    useState<TeamInvitation | null>(
      null,
    );

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<
      TeamInvitationStatus | "ALL"
    >("ALL");

  const invitations =
    invitationsQuery.data?.data ?? [];

  const visibleInvitations =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return invitations.filter(
        (invitation) => {
          const matchesStatus =
            statusFilter === "ALL" ||
            invitation.status ===
              statusFilter;

          const matchesSearch =
            !normalizedSearch ||
            invitation.invitee.username
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            invitation.invitee.email
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
        },
      );
    }, [
      invitations,
      search,
      statusFilter,
    ]);

  if (invitationsQuery.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-56" />

        {Array.from({
          length: 5,
        }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-28 rounded-xl"
          />
        ))}
      </div>
    );
  }

  if (
    invitationsQuery.isError ||
    !invitationsQuery.data
  ) {
    return (
      <Card className="flex min-h-[360px] items-center justify-center border-dashed">
        <div className="max-w-md px-6 py-14 text-center">
          <TriangleAlert className="mx-auto h-10 w-10 text-destructive" />

          <h3 className="mt-4 text-xl font-semibold">
            Unable to load invitations
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            ArcHive could not load this workspace&apos;s invitation
            history.
          </p>

          <Button
            variant="outline"
            className="mt-6"
            disabled={
              invitationsQuery.isFetching
            }
            onClick={() =>
              invitationsQuery.refetch()
            }
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
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold">
            Team Invitations
          </h3>

          <p className="mt-2 text-muted-foreground">
            Invite ArcHive users and review invitation history.
          </p>
        </div>

        {canManageInvitations ? (
          <Button
            onClick={() =>
              setIsInviteOpen(true)
            }
          >
            <MailPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            <LockKeyhole className="h-4 w-4" />
            Invitation history unavailable
          </div>
        )}
      </div>

      {canManageInvitations &&
      invitations.length > 0 ? (
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              className="pl-9"
              placeholder="Search invitations..."
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
            />
          </div>

          <select
            value={statusFilter}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | TeamInvitationStatus
                  | "ALL",
              )
            }
          >
            <option value="ALL">
              All statuses
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="ACCEPTED">
              Accepted
            </option>

            <option value="REJECTED">
              Rejected
            </option>

            <option value="EXPIRED">
              Expired
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>
          </select>
        </div>
      ) : null}

      {!canManageInvitations ? (
        <Card className="flex min-h-[320px] items-center justify-center border-dashed">
          <div className="max-w-md px-6 py-12 text-center">
            <LockKeyhole className="mx-auto h-9 w-9 text-muted-foreground" />

            <h3 className="mt-4 text-lg font-semibold">
              Invitation management is restricted
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Only workspace owners and administrators can view and
              manage Team invitations.
            </p>
          </div>
        </Card>
      ) : !invitations.length ? (
        <Card className="flex min-h-[360px] items-center justify-center border-dashed">
          <div className="max-w-md px-6 py-14 text-center">
            <MailPlus className="mx-auto h-10 w-10 text-muted-foreground" />

            <h3 className="mt-4 text-lg font-semibold">
              No invitations have been sent
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Invite engineers into this workspace.
            </p>

            <Button
              className="mt-6"
              onClick={() =>
                setIsInviteOpen(true)
              }
            >
              Invite User
            </Button>
          </div>
        </Card>
      ) : !visibleInvitations.length ? (
        <Card className="border-dashed p-12 text-center">
          <h3 className="font-semibold">
            No matching invitations
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Change the search term or status filter.
          </p>
        </Card>
      ) : (
        <TeamInvitationHistory
          invitations={
            visibleInvitations
          }
          canManageInvitations={
            canManageInvitations
          }
          onCancel={
            setInvitationToCancel
          }
        />
      )}

      <InviteTeamUserDialog
        teamId={teamId}
        actorUserId={userId}
        open={isInviteOpen}
        onOpenChange={
          setIsInviteOpen
        }
      />

      <CancelInvitationDialog
        teamId={teamId}
        actorUserId={userId}
        invitation={
          invitationToCancel
        }
        open={Boolean(
          invitationToCancel,
        )}
        onOpenChange={(open) => {
          if (!open) {
            setInvitationToCancel(null);
          }
        }}
      />
    </div>
  );
}
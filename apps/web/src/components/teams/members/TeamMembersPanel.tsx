"use client";

import {
  useState,
} from "react";

import {
  LockKeyhole,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { AddTeamMemberDialog } from "@/components/teams/members/AddTeamMemberDialog";
import { RemoveTeamMemberDialog } from "@/components/teams/members/RemoveTeamMemberDialog";
import { TeamMembersEmptyState } from "@/components/teams/members/TeamMembersEmptyState";
import { TeamMembersError } from "@/components/teams/members/TeamMembersError";
import { TeamMembersSkeleton } from "@/components/teams/members/TeamMembersSkeleton";
import { TeamMembersTable } from "@/components/teams/members/TeamMembersTable";
import { UpdateTeamMemberRoleDialog } from "@/components/teams/members/UpdateTeamMemberRoleDialog";

import { useTeamMembers } from "@/hooks/useTeams";

import type {
  TeamMember,
} from "@/types/team.types";

interface TeamMembersPanelProps {
  teamId: string;
  userId: string;
  canManageMembers: boolean;
}

export function TeamMembersPanel({
  teamId,
  userId,
  canManageMembers,
}: TeamMembersPanelProps) {
  const membersQuery =
    useTeamMembers(
      teamId,
      userId,
    );

  const [
    isAddMemberOpen,
    setIsAddMemberOpen,
  ] = useState(false);

  const [
    memberToEdit,
    setMemberToEdit,
  ] =
    useState<TeamMember | null>(
      null,
    );

  const [
    memberToRemove,
    setMemberToRemove,
  ] =
    useState<TeamMember | null>(
      null,
    );

  if (membersQuery.isLoading) {
    return (
      <TeamMembersSkeleton />
    );
  }

  if (
    membersQuery.isError ||
    !membersQuery.data
  ) {
    return (
      <TeamMembersError
        isRetrying={
          membersQuery.isFetching
        }
        onRetry={() =>
          membersQuery.refetch()
        }
      />
    );
  }

  const members =
    membersQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            Team Members
          </h2>

          <p className="mt-2 text-muted-foreground">
            Manage workspace access and member roles.
          </p>
        </div>

        {canManageMembers ? (
          <Button
            onClick={() =>
              setIsAddMemberOpen(true)
            }
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            <LockKeyhole className="h-4 w-4" />
            Read-only access
          </div>
        )}
      </div>

      {!members.length ? (
        <TeamMembersEmptyState
          canManageMembers={
            canManageMembers
          }
          onAddMember={() =>
            setIsAddMemberOpen(true)
          }
        />
      ) : (
        <TeamMembersTable
          members={members}
          canManageMembers={
            canManageMembers
          }
          currentUserId={userId}
          onEditRole={
            setMemberToEdit
          }
          onRemove={
            setMemberToRemove
          }
        />
      )}

      <AddTeamMemberDialog
        teamId={teamId}
        actorUserId={userId}
        open={isAddMemberOpen}
        onOpenChange={
          setIsAddMemberOpen
        }
      />

      <UpdateTeamMemberRoleDialog
        teamId={teamId}
        actorUserId={userId}
        member={memberToEdit}
        open={Boolean(memberToEdit)}
        onOpenChange={(open) => {
          if (!open) {
            setMemberToEdit(null);
          }
        }}
      />

      <RemoveTeamMemberDialog
        teamId={teamId}
        actorUserId={userId}
        member={memberToRemove}
        open={Boolean(
          memberToRemove,
        )}
        onOpenChange={(open) => {
          if (!open) {
            setMemberToRemove(null);
          }
        }}
      />
    </div>
  );
}
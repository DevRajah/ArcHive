"use client";

import {
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useRemoveTeamMember } from "@/hooks/useTeams";

import type {
  TeamMember,
} from "@/types/team.types";

interface RemoveTeamMemberDialogProps {
  teamId: string;
  actorUserId: string;
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (
    open: boolean,
  ) => void;
}

export function RemoveTeamMemberDialog({
  teamId,
  actorUserId,
  member,
  open,
  onOpenChange,
}: RemoveTeamMemberDialogProps) {
  const removeMemberMutation =
    useRemoveTeamMember(
      teamId,
      actorUserId,
    );

  const isRemoving =
    removeMemberMutation.isPending;

  function handleClose() {
    if (isRemoving) {
      return;
    }

    removeMemberMutation.reset();
    onOpenChange(false);
  }

  async function handleRemove() {
    if (!member) {
      return;
    }

    try {
      const response =
        await removeMemberMutation.mutateAsync(
          {
            memberId: member.id,
            actorUserId,
          },
        );

      handleClose();

      toast.success(
        response.message ||
          "Member removed successfully.",
      );
    } catch {
      toast.error(
        "The member could not be removed.",
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>

          <DialogTitle>
            Remove Team Member?
          </DialogTitle>

          <DialogDescription>
            This member will immediately lose access to the Team Workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="font-medium">
            {member?.username}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {member?.email ||
              member?.userId}
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={isRemoving}
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            disabled={
              isRemoving ||
              !member ||
              member.role === "OWNER"
            }
            onClick={handleRemove}
          >
            {isRemoving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove Member"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
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

import { useRemoveTeamRepository } from "@/hooks/useTeams";

import type {
  TeamRepository,
} from "@/types/team.types";

interface RemoveTeamRepositoryDialogProps {
  teamId: string;
  actorUserId: string;
  repository: TeamRepository | null;
  open: boolean;
  onOpenChange: (
    open: boolean,
  ) => void;
}

export function RemoveTeamRepositoryDialog({
  teamId,
  actorUserId,
  repository,
  open,
  onOpenChange,
}: RemoveTeamRepositoryDialogProps) {
  const removeRepositoryMutation =
    useRemoveTeamRepository(
      teamId,
      actorUserId,
    );

  const isRemoving =
    removeRepositoryMutation.isPending;

  function handleClose() {
    if (isRemoving) {
      return;
    }

    removeRepositoryMutation.reset();
    onOpenChange(false);
  }

  async function handleRemove() {
    if (!repository) {
      return;
    }

    try {
      const response =
        await removeRepositoryMutation.mutateAsync(
          {
            repositoryId:
              repository.repositoryId,
            actorUserId,
          },
        );

      handleClose();

      toast.success(
        response.message ||
          "Repository removed successfully.",
      );
    } catch {
      toast.error(
        "The repository could not be removed from this workspace.",
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
            Remove Team Repository?
          </DialogTitle>

          <DialogDescription>
            This removes the repository from the Team Workspace. It does
            not delete the repository from your ArcHive account.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="font-medium">
            {repository?.name}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {repository?.fullName}
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
              !repository
            }
            onClick={handleRemove}
          >
            {isRemoving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove Repository"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
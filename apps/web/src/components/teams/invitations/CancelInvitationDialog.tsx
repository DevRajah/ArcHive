"use client";

import {
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { isAxiosError } from "axios";
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

import { useCancelTeamInvitation } from "@/hooks/useTeams";

import type {
  TeamInvitation,
} from "@/types/team.types";

interface CancelInvitationDialogProps {
  teamId: string;
  actorUserId: string;
  invitation: TeamInvitation | null;
  open: boolean;
  onOpenChange: (
    open: boolean,
  ) => void;
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

  return error instanceof Error
    ? error.message
    : "The invitation could not be cancelled.";
}

export function CancelInvitationDialog({
  teamId,
  actorUserId,
  invitation,
  open,
  onOpenChange,
}: CancelInvitationDialogProps) {
  const cancelMutation =
    useCancelTeamInvitation(
      teamId,
      actorUserId,
    );

  const isCancelling =
    cancelMutation.isPending;

  function handleClose() {
    if (isCancelling) {
      return;
    }

    cancelMutation.reset();
    onOpenChange(false);
  }

  async function handleCancelInvitation() {
    if (!invitation) {
      return;
    }

    try {
      const response =
        await cancelMutation.mutateAsync(
          {
            invitationId:
              invitation.id,
            actorUserId,
          },
        );

      handleClose();

      toast.success(
        response.message ||
          "Invitation cancelled successfully.",
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error),
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
            Cancel Invitation?
          </DialogTitle>

          <DialogDescription>
            The invited user will no longer be able to accept this
            invitation.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="font-semibold">
            {invitation?.invitee.username}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Invitation to join as{" "}
            {invitation?.role.toLowerCase()}
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={isCancelling}
            onClick={handleClose}
          >
            Keep Invitation
          </Button>

          <Button
            variant="destructive"
            disabled={
              isCancelling ||
              !invitation
            }
            onClick={
              handleCancelInvitation
            }
          >
            {isCancelling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Cancel Invitation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
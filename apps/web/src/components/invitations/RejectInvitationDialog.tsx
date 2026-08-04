"use client";

import {
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type {
  TeamInvitation,
} from "@/types/team.types";

interface RejectInvitationDialogProps {
  invitation: TeamInvitation | null;
  open: boolean;
  loading: boolean;
  onConfirm: () => void;
  onOpenChange: (
    open: boolean,
  ) => void;
}

export function RejectInvitationDialog({
  invitation,
  open,
  loading,
  onConfirm,
  onOpenChange,
}: RejectInvitationDialogProps) {
  function handleOpenChange(
    nextOpen: boolean,
  ) {
    if (loading) {
      return;
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={
        handleOpenChange
      }
    >
      <DialogContent
        className="sm:max-w-md"
        onEscapeKeyDown={(event) => {
          if (loading) {
            event.preventDefault();
          }
        }}
        onPointerDownOutside={(event) => {
          if (loading) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
          </div>

          <DialogTitle>
            Reject Team Invitation?
          </DialogTitle>

          <DialogDescription>
            You will not be added to this workspace. This invitation
            cannot be accepted after it has been rejected.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="font-semibold">
            {invitation?.team.name}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Invited as{" "}
            {invitation?.role
              .toLowerCase()}
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={loading}
            onClick={() =>
              onOpenChange(false)
            }
          >
            Keep Invitation
          </Button>

          <Button
            variant="destructive"
            disabled={
              loading ||
              !invitation
            }
            onClick={onConfirm}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rejecting...
              </>
            ) : (
              "Reject Invitation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
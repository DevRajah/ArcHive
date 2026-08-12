"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  Loader2,
  Trash2,
} from "lucide-react";

import { useRouter } from "next/navigation";
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

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  useDeleteTeam,
} from "@/hooks/useTeams";

interface DeleteTeamWorkspaceDialogProps {
  teamId: string;
  teamName: string;
  actorUserId: string;

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

  if (error instanceof Error) {
    return error.message;
  }

  return "The workspace could not be deleted.";
}

export function DeleteTeamWorkspaceDialog({
  teamId,
  teamName,
  actorUserId,
  open,
  onOpenChange,
}: DeleteTeamWorkspaceDialogProps) {
  const router = useRouter();

  const deleteTeamMutation =
    useDeleteTeam(
      actorUserId,
    );

  const [
    confirmation,
    setConfirmation,
  ] = useState("");

  const isDeleting =
    deleteTeamMutation.isPending;

  const matchesTeamName =
    confirmation.trim() ===
    teamName;

  useEffect(() => {
    if (!open) {
      setConfirmation("");
    }
  }, [open]);

  function handleClose() {
    if (isDeleting) {
      return;
    }

    setConfirmation("");

    deleteTeamMutation.reset();

    onOpenChange(false);
  }

  async function handleDelete() {
    if (!matchesTeamName) {
      return;
    }

    try {
      const response =
        await deleteTeamMutation.mutateAsync(
          {
            teamId,
            actorUserId,
          },
        );

      toast.success(
        response.message ||
          "Team workspace deleted successfully.",
      );

      /*
       * Replace instead of push so the browser Back button
       * does not immediately return to a deleted workspace.
       */
      router.replace("/teams");
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
      <DialogContent
        className="sm:max-w-lg"
        onEscapeKeyDown={(event) => {
          if (isDeleting) {
            event.preventDefault();
          }
        }}
        onPointerDownOutside={(
          event,
        ) => {
          if (isDeleting) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <DialogTitle>
            Delete Team Workspace?
          </DialogTitle>

          <DialogDescription>
            This permanently deletes the
            workspace and its Team data.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-6">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-destructive">
              You are deleting:
            </p>

            <p className="mt-2 font-semibold">
              {teamName}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delete-team-confirmation">
              Type{" "}
              <span className="font-semibold">
                {teamName}
              </span>{" "}
              to confirm
            </Label>

            <Input
              id="delete-team-confirmation"
              value={confirmation}
              disabled={isDeleting}
              autoComplete="off"
              placeholder={teamName}
              onChange={(event) =>
                setConfirmation(
                  event.target.value,
                )
              }
            />

            <p className="text-xs leading-5 text-muted-foreground">
              Workspace deletion is
              permanent and cannot be
              reversed.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={
              isDeleting ||
              !matchesTeamName
            }
            onClick={handleDelete}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Workspace
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
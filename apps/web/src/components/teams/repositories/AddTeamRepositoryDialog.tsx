"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  FolderPlus,
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

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAddTeamRepository } from "@/hooks/useTeams";

interface AddTeamRepositoryDialogProps {
  teamId: string;
  actorUserId: string;
  open: boolean;
  onOpenChange: (
    open: boolean,
  ) => void;
}

export function AddTeamRepositoryDialog({
  teamId,
  actorUserId,
  open,
  onOpenChange,
}: AddTeamRepositoryDialogProps) {
  const addRepositoryMutation =
    useAddTeamRepository(
      teamId,
      actorUserId,
    );

  const [
    repositoryId,
    setRepositoryId,
  ] = useState("");

  const [
    repositoryIdError,
    setRepositoryIdError,
  ] = useState("");

  const isSubmitting =
    addRepositoryMutation.isPending;

  useEffect(() => {
    if (!open) {
      setRepositoryId("");
      setRepositoryIdError("");
    }
  }, [open]);

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setRepositoryId("");
    setRepositoryIdError("");
    addRepositoryMutation.reset();
    onOpenChange(false);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanedRepositoryId =
      repositoryId.trim();

    if (!cleanedRepositoryId) {
      setRepositoryIdError(
        "A repository ID is required.",
      );

      return;
    }

    try {
      const response =
        await addRepositoryMutation.mutateAsync(
          {
            actorUserId,
            repositoryId:
              cleanedRepositoryId,
          },
        );

      handleClose();

      toast.success(
        response.message ||
          "Repository attached successfully.",
      );
    } catch {
      toast.error(
        "The repository could not be attached. Confirm the repository ID and try again.",
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
          if (isSubmitting) {
            event.preventDefault();
          }
        }}
        onPointerDownOutside={(event) => {
          if (isSubmitting) {
            event.preventDefault();
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border bg-muted/50">
              <FolderPlus className="h-5 w-5 text-muted-foreground" />
            </div>

            <DialogTitle>
              Attach Team Repository
            </DialogTitle>

            <DialogDescription>
              Attach one of your existing ArcHive repositories to this
              shared workspace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-6">
            <Label htmlFor="team-repository-id">
              Repository ID
            </Label>

            <Input
              id="team-repository-id"
              value={repositoryId}
              disabled={isSubmitting}
              placeholder="ArcHive repository UUID"
              aria-invalid={
                Boolean(repositoryIdError)
              }
              onChange={(event) => {
                setRepositoryId(
                  event.target.value,
                );

                if (repositoryIdError) {
                  setRepositoryIdError("");
                }
              }}
            />

            {repositoryIdError ? (
              <p className="text-sm text-destructive">
                {repositoryIdError}
              </p>
            ) : (
              <p className="text-xs leading-5 text-muted-foreground">
                Use the internal ArcHive repository ID, not the GitHub
                repository ID.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={handleClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !repositoryId.trim()
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Attaching...
                </>
              ) : (
                <>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Attach Repository
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
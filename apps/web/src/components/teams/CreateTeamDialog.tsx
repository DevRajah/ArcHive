"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Loader2,
  Plus,
  UsersRound,
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
import { Textarea } from "@/components/ui/textarea";

import { useCreateTeam } from "@/hooks/useTeams";

interface CreateTeamDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (
    open: boolean,
  ) => void;
}

export function CreateTeamDialog({
  userId,
  open,
  onOpenChange,
}: CreateTeamDialogProps) {
  const createTeamMutation =
    useCreateTeam(userId);

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [nameError, setNameError] =
    useState("");

  const isSubmitting =
    createTeamMutation.isPending;

  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setNameError("");
      createTeamMutation.reset();
    }
  }, [open, createTeamMutation]);

  function handleOpenChange(
    nextOpen: boolean,
  ) {
    if (isSubmitting) {
      return;
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanedName =
      name.trim();

    const cleanedDescription =
      description.trim();

    if (!cleanedName) {
      setNameError(
        "A team name is required.",
      );

      return;
    }

    if (!userId) {
      toast.error(
        "Your ArcHive session could not be found.",
      );

      return;
    }

    setNameError("");

    try {
      const response =
        await createTeamMutation.mutateAsync(
          {
            userId,
            name: cleanedName,
            description:
              cleanedDescription ||
              undefined,
          },
        );

      onOpenChange(false);

      toast.success(
        response.message ||
          "Team Workspace created successfully.",
      );
    } catch {
      toast.error(
        "The Team Workspace could not be created. Please try again.",
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={
        handleOpenChange
      }
    >
      <DialogContent className="sm:max-w-lg">
        <form
          onSubmit={handleSubmit}
        >
          <DialogHeader>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border bg-muted/50">
              <UsersRound className="h-5 w-5 text-muted-foreground" />
            </div>

            <DialogTitle>
              Create Team Workspace
            </DialogTitle>

            <DialogDescription>
              Create a shared engineering intelligence workspace for your team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="team-name">
                Team Name
                <span className="ml-1 text-destructive">
                  *
                </span>
              </Label>

              <Input
                id="team-name"
                value={name}
                disabled={isSubmitting}
                maxLength={100}
                placeholder="Platform Engineering"
                aria-invalid={
                  Boolean(nameError)
                }
                aria-describedby={
                  nameError
                    ? "team-name-error"
                    : undefined
                }
                onChange={(event) => {
                  setName(
                    event.target.value,
                  );

                  if (nameError) {
                    setNameError("");
                  }
                }}
              />

              <div className="flex items-center justify-between gap-4">
                {nameError ? (
                  <p
                    id="team-name-error"
                    className="text-sm text-destructive"
                  >
                    {nameError}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Choose a clear name your team will recognise.
                  </p>
                )}

                <span className="text-xs text-muted-foreground">
                  {name.length}/100
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-description">
                Description
                <span className="ml-1 font-normal text-muted-foreground">
                  Optional
                </span>
              </Label>

              <Textarea
                id="team-description"
                value={description}
                disabled={isSubmitting}
                maxLength={500}
                rows={5}
                placeholder="Describe the engineering group or purpose of this workspace."
                className="resize-none"
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
              />

              <div className="flex justify-end">
                <span className="text-xs text-muted-foreground">
                  {description.length}/500
                </span>
              </div>
            </div>

            {createTeamMutation.isError ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                Team creation failed. Review the form and try again.
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() =>
                onOpenChange(false)
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !name.trim()
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Team
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
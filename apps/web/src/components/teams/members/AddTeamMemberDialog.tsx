"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Loader2,
  UserPlus,
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAddTeamMember } from "@/hooks/useTeams";

import type {
  AddTeamMemberRole,
} from "@/types/team.types";

interface AddTeamMemberDialogProps {
  teamId: string;
  actorUserId: string;
  open: boolean;
  onOpenChange: (
    open: boolean,
  ) => void;
}

export function AddTeamMemberDialog({
  teamId,
  actorUserId,
  open,
  onOpenChange,
}: AddTeamMemberDialogProps) {
  const addMemberMutation =
    useAddTeamMember(
      teamId,
      actorUserId,
    );

  const [username, setUsername] =
    useState("");

  const [role, setRole] =
    useState<AddTeamMemberRole>(
      "MEMBER",
    );

  const [
    usernameError,
    setUsernameError,
  ] = useState("");

  const isSubmitting =
    addMemberMutation.isPending;

  useEffect(() => {
    if (!open) {
      setUsername("");
      setRole("MEMBER");
      setUsernameError("");
    }
  }, [open]);

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setUsername("");
    setRole("MEMBER");
    setUsernameError("");

    addMemberMutation.reset();

    onOpenChange(false);
  }

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    /*
     * Keep the user's casing and optional @ intact.
     *
     * The backend is the source of truth for username
     * normalization and performs case-insensitive matching.
     * We only remove accidental surrounding whitespace.
     */
    const cleanedUsername =
      username.trim();

    if (!cleanedUsername) {
      setUsernameError(
        "A GitHub username is required.",
      );

      return;
    }

    try {
      const response =
        await addMemberMutation.mutateAsync(
          {
            actorUserId,
            username:
              cleanedUsername,
            role,
          },
        );

      handleClose();

      const addedUsername =
        response.data?.username;

      toast.success(
        addedUsername
          ? `${addedUsername} was added to the team.`
          : response.message ||
              "Team member added successfully.",
      );
    } catch (error) {
      /*
       * The backend now returns useful validation messages for
       * unknown usernames, duplicate members and permission errors.
       *
       * Our API client may expose that message differently depending
       * on the error shape, so we fall back to a useful generic message.
       */
      let message =
        "The member could not be added. Check the GitHub username and try again.";

      if (
        error &&
        typeof error === "object" &&
        "response" in error
      ) {
        const responseError =
          error as {
            response?: {
              data?: {
                message?: string;
              };
            };
          };

        if (
          responseError.response?.data
            ?.message
        ) {
          message =
            responseError.response.data
              .message;
        }
      } else if (
        error instanceof Error &&
        error.message
      ) {
        message = error.message;
      }

      toast.error(message);
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
        onPointerDownOutside={(
          event,
        ) => {
          if (isSubmitting) {
            event.preventDefault();
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              Add Team Member
            </DialogTitle>

            <DialogDescription>
              Add an existing ArcHive user
              by GitHub username and assign
              their workspace role.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="team-member-username">
                GitHub Username
              </Label>

              <Input
                id="team-member-username"
                value={username}
                disabled={isSubmitting}
                placeholder="e.g. DevRajah or @DevRajah"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={Boolean(
                  usernameError,
                )}
                onChange={(event) => {
                  setUsername(
                    event.target.value,
                  );

                  if (usernameError) {
                    setUsernameError(
                      "",
                    );
                  }
                }}
              />

              {usernameError ? (
                <p className="text-sm text-destructive">
                  {usernameError}
                </p>
              ) : (
                <p className="text-xs leading-5 text-muted-foreground">
                  Enter the GitHub username
                  of an existing ArcHive
                  user. You can include the
                  @ symbol.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Role
              </Label>

              <Select
                value={role}
                disabled={isSubmitting}
                onValueChange={(
                  value,
                ) =>
                  setRole(
                    value as AddTeamMemberRole,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ADMIN">
                    Admin
                  </SelectItem>

                  <SelectItem value="MEMBER">
                    Member
                  </SelectItem>

                  <SelectItem value="VIEWER">
                    Viewer
                  </SelectItem>
                </SelectContent>
              </Select>

              <p className="text-xs leading-5 text-muted-foreground">
                Ownership cannot be assigned
                through this form.
              </p>
            </div>
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
                !username.trim()
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Loader2,
  Send,
  UserPlus,
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

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCreateTeamInvitation } from "@/hooks/useTeams";

import type {
  TeamInvitationRole,
} from "@/types/team.types";

interface InviteTeamUserDialogProps {
  teamId: string;
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

  return "The invitation could not be sent.";
}

export function InviteTeamUserDialog({
  teamId,
  actorUserId,
  open,
  onOpenChange,
}: InviteTeamUserDialogProps) {
  const invitationMutation =
    useCreateTeamInvitation(
      teamId,
      actorUserId,
    );

  const [
    username,
    setUsername,
  ] = useState("");

  const [role, setRole] =
    useState<TeamInvitationRole>(
      "MEMBER",
    );

  const [
    usernameError,
    setUsernameError,
  ] = useState("");

  const isSubmitting =
    invitationMutation.isPending;

  useEffect(() => {
    if (!open) {
      setUsername("");
      setRole("MEMBER");
      setUsernameError("");
    }
  }, [open]);

  function resetForm() {
    setUsername("");
    setRole("MEMBER");
    setUsernameError("");
    invitationMutation.reset();
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    resetForm();
    onOpenChange(false);
  }

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    // We only clean surrounding whitespace here.
    // The backend remains responsible for removing an optional
    // leading @ and performing case-insensitive username matching.
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
        await invitationMutation.mutateAsync(
          {
            actorUserId,
            username: cleanedUsername,
            role,
          },
        );

      resetForm();
      onOpenChange(false);

      toast.success(
        response.message ||
          `Invitation sent to ${response.data.invitee.username}.`,
      );
    } catch (error) {
      // Backend validation messages are intentionally surfaced
      // so the user knows whether the account was not found,
      // is already a member, or already has a pending invitation.
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
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted/40">
              <UserPlus className="h-5 w-5" />
            </div>

            <DialogTitle>
              Invite Team Member
            </DialogTitle>

            <DialogDescription>
              Invite an existing ArcHive user and assign their
              workspace role.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="invitee-username">
                GitHub Username
              </Label>

              <Input
                id="invitee-username"
                value={username}
                disabled={isSubmitting}
                placeholder="Enter GitHub username"
                autoComplete="off"
                aria-invalid={
                  Boolean(usernameError)
                }
                onChange={(event) => {
                  setUsername(
                    event.target.value,
                  );

                  if (usernameError) {
                    setUsernameError("");
                  }
                }}
              />

              {usernameError ? (
                <p className="text-sm text-destructive">
                  {usernameError}
                </p>
              ) : (
                <p className="text-xs leading-5 text-muted-foreground">
                  Enter the GitHub username of an existing ArcHive
                  user. You can use DevRajah or @DevRajah.
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
                onValueChange={(value) =>
                  setRole(
                    value as TeamInvitationRole,
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
                Team ownership cannot be assigned through invitations.
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
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
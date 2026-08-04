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
    inviteeUserId,
    setInviteeUserId,
  ] = useState("");

  const [role, setRole] =
    useState<TeamInvitationRole>(
      "MEMBER",
    );

  const [userError, setUserError] =
    useState("");

  const isSubmitting =
    invitationMutation.isPending;

  useEffect(() => {
    if (!open) {
      setInviteeUserId("");
      setRole("MEMBER");
      setUserError("");
    }
  }, [open]);

  function resetForm() {
    setInviteeUserId("");
    setRole("MEMBER");
    setUserError("");
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
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanedUserId =
      inviteeUserId.trim();

    if (!cleanedUserId) {
      setUserError(
        "Select or enter an ArcHive user.",
      );

      return;
    }

    try {
      const response =
        await invitationMutation.mutateAsync(
          {
            actorUserId,
            inviteeUserId:
              cleanedUserId,
            role,
          },
        );

      resetForm();
      onOpenChange(false);

      toast.success(
        response.message ||
          "Team invitation sent successfully.",
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
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border bg-muted/40">
              <UserPlus className="h-5 w-5 text-muted-foreground" />
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
              <Label htmlFor="invitee-user-id">
                ArcHive User
              </Label>

              <Input
                id="invitee-user-id"
                value={inviteeUserId}
                disabled={isSubmitting}
                placeholder="ArcHive user UUID"
                aria-invalid={
                  Boolean(userError)
                }
                onChange={(event) => {
                  setInviteeUserId(
                    event.target.value,
                  );

                  if (userError) {
                    setUserError("");
                  }
                }}
              />

              {userError ? (
                <p className="text-sm text-destructive">
                  {userError}
                </p>
              ) : (
                <p className="text-xs leading-5 text-muted-foreground">
                  Enter the existing ArcHive user ID. Username search
                  requires a separate user-search backend endpoint.
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
                !inviteeUserId.trim()
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
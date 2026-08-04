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

  const [userId, setUserId] =
    useState("");

  const [role, setRole] =
    useState<AddTeamMemberRole>(
      "MEMBER",
    );

  const [userIdError, setUserIdError] =
    useState("");

  const isSubmitting =
    addMemberMutation.isPending;

  useEffect(() => {
    if (!open) {
      setUserId("");
      setRole("MEMBER");
      setUserIdError("");
    }
  }, [open]);

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setUserId("");
    setRole("MEMBER");
    setUserIdError("");
    addMemberMutation.reset();
    onOpenChange(false);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanedUserId =
      userId.trim();

    if (!cleanedUserId) {
      setUserIdError(
        "A user ID is required.",
      );

      return;
    }

    try {
      const response =
        await addMemberMutation.mutateAsync(
          {
            actorUserId,
            userId: cleanedUserId,
            role,
          },
        );

      handleClose();

      toast.success(
        response.message ||
          "Team member added successfully.",
      );
    } catch {
      toast.error(
        "The member could not be added. Confirm the user ID and try again.",
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
              <UserPlus className="h-5 w-5 text-muted-foreground" />
            </div>

            <DialogTitle>
              Add Team Member
            </DialogTitle>

            <DialogDescription>
              Add an existing ArcHive user and assign their workspace role.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="team-member-user-id">
                ArcHive User ID
              </Label>

              <Input
                id="team-member-user-id"
                value={userId}
                disabled={isSubmitting}
                placeholder="User UUID"
                aria-invalid={
                  Boolean(userIdError)
                }
                onChange={(event) => {
                  setUserId(
                    event.target.value,
                  );

                  if (userIdError) {
                    setUserIdError("");
                  }
                }}
              />

              {userIdError ? (
                <p className="text-sm text-destructive">
                  {userIdError}
                </p>
              ) : (
                <p className="text-xs leading-5 text-muted-foreground">
                  The backend currently requires the existing ArcHive user ID.
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
                Ownership cannot be assigned through this form.
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
                !userId.trim()
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
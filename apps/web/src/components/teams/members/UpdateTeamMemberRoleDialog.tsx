"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Loader2,
  ShieldCheck,
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

import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useUpdateTeamMemberRole } from "@/hooks/useTeams";

import type {
  AddTeamMemberRole,
  TeamMember,
} from "@/types/team.types";

interface UpdateTeamMemberRoleDialogProps {
  teamId: string;
  actorUserId: string;
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (
    open: boolean,
  ) => void;
}

export function UpdateTeamMemberRoleDialog({
  teamId,
  actorUserId,
  member,
  open,
  onOpenChange,
}: UpdateTeamMemberRoleDialogProps) {
  const updateRoleMutation =
    useUpdateTeamMemberRole(
      teamId,
      actorUserId,
    );

  const [role, setRole] =
    useState<AddTeamMemberRole>(
      "MEMBER",
    );

  const isSubmitting =
    updateRoleMutation.isPending;

  useEffect(() => {
    if (
      member &&
      member.role !== "OWNER"
    ) {
      setRole(
        member.role as AddTeamMemberRole,
      );
    }
  }, [member]);

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    updateRoleMutation.reset();
    onOpenChange(false);
  }

  async function handleUpdate() {
    if (!member) {
      return;
    }

    try {
      const response =
        await updateRoleMutation.mutateAsync(
          {
            memberId: member.id,
            payload: {
              actorUserId,
              role,
            },
          },
        );

      handleClose();

      toast.success(
        response.message ||
          "Member role updated successfully.",
      );
    } catch {
      toast.error(
        "The member role could not be updated.",
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
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border bg-muted/50">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          </div>

          <DialogTitle>
            Update Member Role
          </DialogTitle>

          <DialogDescription>
            Change the workspace permissions for {member?.username ?? "this member"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-6">
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={isSubmitting}
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button
            disabled={
              isSubmitting ||
              !member ||
              member.role === "OWNER"
            }
            onClick={handleUpdate}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Role"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
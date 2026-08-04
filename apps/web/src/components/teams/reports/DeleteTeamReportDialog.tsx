"use client";

import {
  AlertTriangle,
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

import { useDeleteTeamReport } from "@/hooks/useTeams";

import type {
  TeamReportListItem,
} from "@/types/team.types";

interface DeleteTeamReportDialogProps {
  teamId: string;
  actorUserId: string;
  report: TeamReportListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTeamReportDialog({
  teamId,
  actorUserId,
  report,
  open,
  onOpenChange,
}: DeleteTeamReportDialogProps) {
  const deleteMutation =
    useDeleteTeamReport(
      teamId,
      actorUserId,
    );

  const isDeleting =
    deleteMutation.isPending;

  function handleClose() {
    if (isDeleting) {
      return;
    }

    deleteMutation.reset();
    onOpenChange(false);
  }

  async function handleDelete() {
    if (!report) {
      return;
    }

    try {
      const response =
        await deleteMutation.mutateAsync({
          reportId: report.id,
          actorUserId,
        });

      handleClose();

      toast.success(
        response.message ||
          "Team Report deleted successfully.",
      );
    } catch {
      toast.error(
        "The Team Report could not be deleted.",
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
            Delete Team Report?
          </DialogTitle>

          <DialogDescription>
            This action cannot be undone. Generated PDF and CSV files will also be removed.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="font-medium">
            {report?.title}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {report?.description ||
              "No report description."}
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={isDeleting}
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            disabled={
              isDeleting ||
              !report
            }
            onClick={handleDelete}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  FilePlus2,
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
import { Textarea } from "@/components/ui/textarea";

import { useGenerateTeamReport } from "@/hooks/useTeams";

interface GenerateTeamReportDialogProps {
  teamId: string;
  actorUserId: string;
  open: boolean;
  onOpenChange: (
    open: boolean,
  ) => void;
}

export function GenerateTeamReportDialog({
  teamId,
  actorUserId,
  open,
  onOpenChange,
}: GenerateTeamReportDialogProps) {
  const generateMutation =
    useGenerateTeamReport(
      teamId,
      actorUserId,
    );

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [titleError, setTitleError] =
    useState("");

  const isSubmitting =
    generateMutation.isPending;

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setTitleError("");
    }
  }, [open]);

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setTitle("");
    setDescription("");
    setTitleError("");
    generateMutation.reset();
    onOpenChange(false);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanedTitle =
      title.trim();

    const cleanedDescription =
      description.trim();

    if (!cleanedTitle) {
      setTitleError(
        "A report title is required.",
      );

      return;
    }

    try {
      const response =
        await generateMutation.mutateAsync(
          {
            actorUserId,
            title: cleanedTitle,
            description:
              cleanedDescription ||
              undefined,
          },
        );

      handleClose();

      toast.success(
        response.message ||
          "Team Executive Report queued successfully.",
      );
    } catch {
      toast.error(
        "The Team Executive Report could not be queued.",
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
              <FilePlus2 className="h-5 w-5 text-muted-foreground" />
            </div>

            <DialogTitle>
              Generate Team Executive Report
            </DialogTitle>

            <DialogDescription>
              Capture a leadership-ready snapshot of this workspace&apos;s
              engineering intelligence.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="team-report-title">
                Title
                <span className="ml-1 text-destructive">
                  *
                </span>
              </Label>

              <Input
                id="team-report-title"
                value={title}
                disabled={isSubmitting}
                maxLength={120}
                placeholder="Platform Engineering Executive Report"
                aria-invalid={
                  Boolean(titleError)
                }
                onChange={(event) => {
                  setTitle(
                    event.target.value,
                  );

                  if (titleError) {
                    setTitleError("");
                  }
                }}
              />

              {titleError ? (
                <p className="text-sm text-destructive">
                  {titleError}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Use a title leadership will recognise.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-report-description">
                Description
                <span className="ml-1 font-normal text-muted-foreground">
                  Optional
                </span>
              </Label>

              <Textarea
                id="team-report-description"
                value={description}
                disabled={isSubmitting}
                maxLength={500}
                rows={5}
                placeholder="Shared engineering intelligence summary."
                className="resize-none"
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
              />
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
                !title.trim()
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FilePlus2 className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
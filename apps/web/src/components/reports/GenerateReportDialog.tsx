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

import { useGenerateReport } from "@/hooks/useReports";

interface GenerateReportDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export function GenerateReportDialog({
  userId,
  open,
  onOpenChange,
  onSuccess,
  onError,
}: GenerateReportDialogProps) {
  const generateReportMutation =
    useGenerateReport(userId);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [titleError, setTitleError] =
    useState("");

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setTitleError("");
    }
  }, [open]);

  function handleOpenChange(
    nextOpen: boolean,
  ) {
    if (
      generateReportMutation.isPending
    ) {
      return;
    }

    onOpenChange(nextOpen);
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

    setTitleError("");

    try {
      await generateReportMutation.mutateAsync(
        {
          userId,
          title: cleanedTitle,
          description:
            cleanedDescription ||
            undefined,
        },
      );

      onOpenChange(false);
      onSuccess?.();
    } catch {
      onError?.(
        "The report could not be generated. Please try again.",
      );
    }
  }

  const isGenerating =
    generateReportMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={
        handleOpenChange
      }
    >
      <DialogContent
        className="sm:max-w-lg"
        onEscapeKeyDown={(event) => {
          if (isGenerating) {
            event.preventDefault();
          }
        }}
        onPointerDownOutside={(
          event,
        ) => {
          if (isGenerating) {
            event.preventDefault();
          }
        }}
      >
        <form
          onSubmit={handleSubmit}
        >
          <DialogHeader>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border bg-muted/50">
              <FilePlus2 className="h-5 w-5 text-muted-foreground" />
            </div>

            <DialogTitle>
              Generate Executive Report
            </DialogTitle>

            <DialogDescription>
              Create a leadership-ready
              snapshot of your
              organisation&apos;s
              engineering intelligence.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="report-title">
                Title
                <span className="ml-1 text-destructive">
                  *
                </span>
              </Label>

              <Input
                id="report-title"
                value={title}
                disabled={isGenerating}
                maxLength={120}
                placeholder="Executive Portfolio Report"
                aria-invalid={
                  Boolean(titleError)
                }
                aria-describedby={
                  titleError
                    ? "report-title-error"
                    : undefined
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

              <div className="flex items-center justify-between gap-4">
                {titleError ? (
                  <p
                    id="report-title-error"
                    className="text-sm text-destructive"
                  >
                    {titleError}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Give the report a
                    recognisable name.
                  </p>
                )}

                <span className="text-xs text-muted-foreground">
                  {title.length}/120
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-description">
                Description
                <span className="ml-1 font-normal text-muted-foreground">
                  Optional
                </span>
              </Label>

              <Textarea
                id="report-description"
                value={description}
                disabled={isGenerating}
                maxLength={500}
                rows={5}
                placeholder="Summarise the purpose or audience for this report."
                className="resize-none"
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
              />

              <div className="flex justify-end">
                <span className="text-xs text-muted-foreground">
                  {description.length}
                  /500
                </span>
              </div>
            </div>

            {generateReportMutation.isError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                Report generation could
                not be started. Review
                your details and try
                again.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isGenerating}
              onClick={() =>
                onOpenChange(false)
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                isGenerating ||
                !title.trim()
              }
            >
              {isGenerating ? (
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
"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
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

import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAddTeamRepository } from "@/hooks/useTeams";
import { useTrackedRepositories } from "@/hooks/useRepositories";

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

  const {
    data: repositoryData,
    isLoading: isRepositoriesLoading,
    isError: isRepositoriesError,
  } = useTrackedRepositories();

  const [
    repositoryId,
    setRepositoryId,
  ] = useState("");

  const [
    repositoryError,
    setRepositoryError,
  ] = useState("");

  const isSubmitting =
    addRepositoryMutation.isPending;

  /*
   * The tracked repository query may return either the raw repository array
   * or an API envelope depending on how the repository service normalises
   * responses.
   *
   * We keep this defensive so the dialog remains compatible with both shapes.
   */
  const repositories = useMemo(() => {
    if (Array.isArray(repositoryData)) {
      return repositoryData;
    }

    if (
      repositoryData &&
      typeof repositoryData === "object" &&
      "data" in repositoryData &&
      Array.isArray(
        (
          repositoryData as {
            data?: unknown;
          }
        ).data,
      )
    ) {
      return (
        repositoryData as {
          data: Array<{
            id: string;
            name: string;
            fullName: string;
            language?: string | null;
            isTracked?: boolean;
          }>;
        }
      ).data;
    }

    return [];
  }, [repositoryData]);

  /*
   * This dialog is specifically attaching one of the repositories
   * already available in ArcHive.
   *
   * Prefer tracked repositories where that field is available.
   */
  const selectableRepositories =
    useMemo(
      () =>
        repositories.filter(
          (repository) =>
            repository.isTracked !== false,
        ),
      [repositories],
    );

  useEffect(() => {
    if (!open) {
      setRepositoryId("");
      setRepositoryError("");
    }
  }, [open]);

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setRepositoryId("");
    setRepositoryError("");

    addRepositoryMutation.reset();

    onOpenChange(false);
  }

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!repositoryId) {
      setRepositoryError(
        "Select a repository to attach.",
      );

      return;
    }

    try {
      const response =
        await addRepositoryMutation.mutateAsync(
          {
            actorUserId,

            /*
             * The user selects by repository name.
             * The internal ArcHive repository ID is submitted behind
             * the scenes because that remains the backend contract.
             */
            repositoryId,
          },
        );

      handleClose();

      toast.success(
        response.message ||
          "Repository attached successfully.",
      );
    } catch (error) {
      let message =
        "The repository could not be attached.";

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
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted/40">
              <FolderPlus className="h-5 w-5" />
            </div>

            <DialogTitle>
              Attach Team Repository
            </DialogTitle>

            <DialogDescription>
              Select one of your existing
              ArcHive repositories to attach
              to this shared workspace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-6">
            <Label>
              Repository
            </Label>

            {isRepositoriesLoading ? (
              <div className="flex h-10 items-center gap-2 rounded-md border border-input px-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading repositories...
              </div>
            ) : isRepositoriesError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
                <p className="text-sm text-destructive">
                  ArcHive could not load your repositories.
                </p>
              </div>
            ) : selectableRepositories.length === 0 ? (
              <div className="rounded-md border border-border bg-muted/20 p-4">
                <p className="text-sm font-medium">
                  No repositories available
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Import and track a repository
                  in ArcHive before attaching it
                  to a Team Workspace.
                </p>
              </div>
            ) : (
              <Select
                value={repositoryId}
                disabled={isSubmitting}
                onValueChange={(value) => {
                  setRepositoryId(value);

                  if (repositoryError) {
                    setRepositoryError("");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a repository" />
                </SelectTrigger>

                <SelectContent>
                  {selectableRepositories.map(
                    (repository) => (
                      <SelectItem
                        key={repository.id}
                        value={repository.id}
                      >
                        {repository.fullName ||
                          repository.name}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            )}

            {repositoryError ? (
              <p className="text-sm text-destructive">
                {repositoryError}
              </p>
            ) : (
              <p className="text-xs leading-5 text-muted-foreground">
                Choose one of the repositories
                already connected to your
                ArcHive account.
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
                isRepositoriesLoading ||
                !repositoryId
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
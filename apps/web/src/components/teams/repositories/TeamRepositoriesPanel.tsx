"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  FolderPlus,
  LockKeyhole,
  Search,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { AddTeamRepositoryDialog } from "@/components/teams/repositories/AddTeamRepositoryDialog";
import { RemoveTeamRepositoryDialog } from "@/components/teams/repositories/RemoveTeamRepositoryDialog";
import { TeamRepositoriesEmptyState } from "@/components/teams/repositories/TeamRepositoriesEmptyState";
import { TeamRepositoriesError } from "@/components/teams/repositories/TeamRepositoriesError";
import { TeamRepositoriesGrid } from "@/components/teams/repositories/TeamRepositoriesGrid";
import { TeamRepositoriesSkeleton } from "@/components/teams/repositories/TeamRepositoriesSkeleton";

import { useTeamRepositories } from "@/hooks/useTeams";

import type {
  TeamRepository,
} from "@/types/team.types";

interface TeamRepositoriesPanelProps {
  teamId: string;
  userId: string;
  canManageRepositories: boolean;
}

export function TeamRepositoriesPanel({
  teamId,
  userId,
  canManageRepositories,
}: TeamRepositoriesPanelProps) {
  const repositoriesQuery =
    useTeamRepositories(
      teamId,
      userId,
    );

  const [
    isAddRepositoryOpen,
    setIsAddRepositoryOpen,
  ] = useState(false);

  const [
    repositoryToRemove,
    setRepositoryToRemove,
  ] =
    useState<TeamRepository | null>(
      null,
    );

  const [search, setSearch] =
    useState("");

  const repositories =
    repositoriesQuery.data?.data ?? [];

  const visibleRepositories =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      if (!normalizedSearch) {
        return repositories;
      }

      return repositories.filter(
        (repository) =>
          repository.name
            .toLowerCase()
            .includes(normalizedSearch) ||
          repository.fullName
            .toLowerCase()
            .includes(normalizedSearch) ||
          repository.owner
            .toLowerCase()
            .includes(normalizedSearch) ||
          repository.language
            ?.toLowerCase()
            .includes(normalizedSearch),
      );
    }, [
      repositories,
      search,
    ]);

  if (repositoriesQuery.isLoading) {
    return (
      <TeamRepositoriesSkeleton />
    );
  }

  if (
    repositoriesQuery.isError ||
    !repositoriesQuery.data
  ) {
    return (
      <TeamRepositoriesError
        isRetrying={
          repositoriesQuery.isFetching
        }
        onRetry={() =>
          repositoriesQuery.refetch()
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            Team Repositories
          </h2>

          <p className="mt-2 text-muted-foreground">
            Manage repositories shared with this Team Workspace.
          </p>
        </div>

        {canManageRepositories ? (
          <Button
            onClick={() =>
              setIsAddRepositoryOpen(true)
            }
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            Attach Repository
          </Button>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            <LockKeyhole className="h-4 w-4" />
            Read-only access
          </div>
        )}
      </div>

      {repositories.length > 0 ? (
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            placeholder="Search team repositories..."
            className="pl-9 pr-9"
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
          />

          {search ? (
            <button
              type="button"
              aria-label="Clear repository search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              onClick={() =>
                setSearch("")
              }
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : null}

      {!repositories.length ? (
        <TeamRepositoriesEmptyState
          canManageRepositories={
            canManageRepositories
          }
          onAddRepository={() =>
            setIsAddRepositoryOpen(true)
          }
        />
      ) : !visibleRepositories.length ? (
        <div className="rounded-xl border border-dashed bg-card px-6 py-16 text-center">
          <h3 className="text-lg font-semibold">
            No matching repositories
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Try changing your repository search.
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-5"
            onClick={() =>
              setSearch("")
            }
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <TeamRepositoriesGrid
          repositories={
            visibleRepositories
          }
          canManageRepositories={
            canManageRepositories
          }
          onRemove={
            setRepositoryToRemove
          }
        />
      )}

      <AddTeamRepositoryDialog
        teamId={teamId}
        actorUserId={userId}
        open={isAddRepositoryOpen}
        onOpenChange={
          setIsAddRepositoryOpen
        }
      />

      <RemoveTeamRepositoryDialog
        teamId={teamId}
        actorUserId={userId}
        repository={
          repositoryToRemove
        }
        open={Boolean(
          repositoryToRemove,
        )}
        onOpenChange={(open) => {
          if (!open) {
            setRepositoryToRemove(null);
          }
        }}
      />
    </div>
  );
}
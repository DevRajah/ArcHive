import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  FolderGit2,
  Settings,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { TeamRoleBadge } from "@/components/teams/TeamRoleBadge";

import type {
  TeamDetails,
} from "@/types/team.types";

interface TeamWorkspaceHeaderProps {
  team: TeamDetails;
  canManageSettings: boolean;
  onOpenSettings: () => void;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

export function TeamWorkspaceHeader({
  team,
  canManageSettings,
  onOpenSettings,
}: TeamWorkspaceHeaderProps) {
  return (
    <div className="space-y-5">
      <Button
        asChild
        variant="ghost"
        className="px-0"
      >
        <Link href="/teams">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to teams
        </Link>
      </Button>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-muted/40">
              <span className="text-xl font-bold text-primary">
                {team.name
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="truncate text-3xl font-bold tracking-tight">
                  {team.name}
                </h1>

                <TeamRoleBadge
                  role={team.currentUserRole}
                />
              </div>

              <p className="mt-2 max-w-3xl leading-7 text-muted-foreground">
                {team.description ||
                  "A shared ArcHive engineering intelligence workspace."}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline">
                  <Users className="mr-1.5 h-3.5 w-3.5" />
                  {team.memberCount} members
                </Badge>

                <Badge variant="outline">
                  <FolderGit2 className="mr-1.5 h-3.5 w-3.5" />
                  {team.repositoryCount} repositories
                </Badge>

                <Badge variant="outline">
                  <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                  Updated {formatDate(team.updatedAt)}
                </Badge>
              </div>
            </div>
          </div>

          {canManageSettings ? (
            <Button
              variant="outline"
              onClick={onOpenSettings}
            >
              <Settings className="mr-2 h-4 w-4" />
              Workspace Settings
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
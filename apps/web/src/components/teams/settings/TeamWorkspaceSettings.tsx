"use client";

import { useState } from "react";

import {
  CalendarDays,
  Crown,
  FolderGit2,
  KeyRound,
  LockKeyhole,
  Settings,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

import {
  DeleteTeamWorkspaceDialog,
} from "@/components/teams/settings/DeleteTeamWorkspaceDialog";

import { TeamRoleBadge } from "@/components/teams/TeamRoleBadge";

import type {
  TeamDetails,
} from "@/types/team.types";

interface TeamWorkspaceSettingsProps {
  team: TeamDetails;

  /**
   * The currently authenticated ArcHive user.
   *
   * This remains a UUID because the backend uses it to verify
   * that the actor is allowed to perform privileged Team actions.
   */
  actorUserId: string;

  /**
   * The frontend permission model controls whether the destructive
   * action should be visible.
   *
   * The backend still performs its own authorization check when
   * deletion is requested.
   */
  canDeleteTeam: boolean;
}

function formatDate(
  value: string,
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}

export function TeamWorkspaceSettings({
  team,
  actorUserId,
  canDeleteTeam,
}: TeamWorkspaceSettingsProps) {
  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Workspace Settings
        </h2>

        <p className="mt-2 text-muted-foreground">
          Review workspace identity, ownership, access, and administrative
          information.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Workspace Information
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Core information associated with this Team Workspace.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Workspace Name
              </p>

              <p className="mt-2 text-lg font-semibold">
                {team.name}
              </p>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Description
              </p>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {team.description ||
                  "No workspace description has been provided."}
              </p>
            </div>

            <Separator />

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Workspace Slug
                </p>

                <Badge
                  variant="outline"
                  className="mt-2 font-mono normal-case"
                >
                  {team.slug}
                </Badge>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Your Role
                </p>

                <div className="mt-2">
                  <TeamRoleBadge
                    role={
                      team.currentUserRole
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />

                <div>
                  <p className="font-medium">
                    {team.memberCount} members
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    People with workspace access.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FolderGit2 className="mt-0.5 h-4 w-4 text-muted-foreground" />

                <div>
                  <p className="font-medium">
                    {team.repositoryCount} repositories
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Shared engineering systems.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />

                <div>
                  <p className="font-medium">
                    Created{" "}
                    {formatDate(
                      team.createdAt,
                    )}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Original workspace creation date.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />

                <div>
                  <p className="font-medium">
                    Updated{" "}
                    {formatDate(
                      team.updatedAt,
                    )}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Most recent workspace update.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Workspace Owner
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border bg-muted/40">
                  {team.createdBy.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        team.createdBy
                          .avatarUrl
                      }
                      alt={
                        team.createdBy
                          .username
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div>
                  <p className="font-semibold">
                    {
                      team.createdBy
                        .username
                    }
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Original workspace creator
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Permission Summary
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <KeyRound className="mt-0.5 h-4 w-4 text-muted-foreground" />

                <div>
                  <p className="font-medium">
                    Role-based controls
                  </p>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Workspace actions are controlled by your current Team role.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-0.5 h-4 w-4 text-muted-foreground" />

                <div>
                  <p className="font-medium">
                    Protected owner account
                  </p>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    The workspace owner cannot be removed or downgraded through
                    member management.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {canDeleteTeam ? (
        <>
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                Destructive workspace actions require owner access.
              </p>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold">
                    Delete Team Workspace
                  </p>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Permanently delete this Team Workspace and its associated
                    workspace data. This action cannot be undone.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  className="shrink-0"
                  onClick={() =>
                    setDeleteDialogOpen(
                      true,
                    )
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Workspace
                </Button>
              </div>
            </CardContent>
          </Card>

          <DeleteTeamWorkspaceDialog
            teamId={team.id}
            teamName={team.name}
            actorUserId={
              actorUserId
            }
            open={
              deleteDialogOpen
            }
            onOpenChange={
              setDeleteDialogOpen
            }
          />
        </>
      ) : null}
    </div>
  );
}
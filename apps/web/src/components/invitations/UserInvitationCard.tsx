"use client";

import Link from "next/link";

import {
  CalendarDays,
  Check,
  Clock3,
  ExternalLink,
  UserRound,
  X,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { InvitationRoleBadge } from "@/components/teams/invitations/InvitationRoleBadge";
import { InvitationStatusBadge } from "@/components/teams/invitations/InvitationStatusBadge";

import type {
  TeamInvitation,
} from "@/types/team.types";

interface UserInvitationCardProps {
  invitation: TeamInvitation;
  isAccepting: boolean;
  isRejecting: boolean;
  onAccept: (
    invitation: TeamInvitation,
  ) => void;
  onReject: (
    invitation: TeamInvitation,
  ) => void;
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
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function getInitials(
  username: string,
) {
  return username
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase(),
    )
    .join("");
}

export function UserInvitationCard({
  invitation,
  isAccepting,
  isRejecting,
  onAccept,
  onReject,
}: UserInvitationCardProps) {
  const isPending =
    invitation.status === "PENDING";

  const isWorking =
    isAccepting || isRejecting;

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition hover:border-primary/40 hover:shadow-md">
      <CardHeader className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-muted/40">
            <span className="text-lg font-bold text-primary">
              {invitation.team.name
                .trim()
                .charAt(0)
                .toUpperCase()}
            </span>
          </div>

          <InvitationStatusBadge
            status={invitation.status}
          />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-xl">
              {invitation.team.name}
            </CardTitle>

            <InvitationRoleBadge
              role={invitation.role}
            />
          </div>

          <p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">
            {invitation.team.description ||
              "You have been invited to join this ArcHive Team Workspace."}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-5">
        <div className="rounded-xl border bg-muted/20 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Invited by
          </p>

          <div className="mt-3 flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={
                  invitation.invitedBy
                    .avatarUrl ??
                  undefined
                }
                alt={
                  invitation.invitedBy
                    .username
                }
              />

              <AvatarFallback>
                {getInitials(
                  invitation.invitedBy
                    .username,
                )}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="text-sm font-semibold">
                {
                  invitation.invitedBy
                    .username
                }
              </p>

              <p className="text-xs text-muted-foreground">
                Workspace administrator
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Invited
            </div>

            <p className="mt-2 text-sm font-medium">
              {formatDate(
                invitation.createdAt,
              )}
            </p>
          </div>

          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              Expires
            </div>

            <p className="mt-2 text-sm font-medium">
              {formatDate(
                invitation.expiresAt,
              )}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 border-t bg-muted/10 p-4">
        {isPending ? (
          <>
            <Button
              className="flex-1"
              disabled={isWorking}
              onClick={() =>
                onAccept(invitation)
              }
            >
              <Check className="mr-2 h-4 w-4" />

              {isAccepting
                ? "Accepting..."
                : "Accept Invitation"}
            </Button>

            <Button
              variant="outline"
              disabled={isWorking}
              onClick={() =>
                onReject(invitation)
              }
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </>
        ) : invitation.status ===
          "ACCEPTED" ? (
          <Button
            asChild
            variant="outline"
            className="w-full"
          >
            <Link
              href={`/teams/${invitation.teamId}`}
            >
              Open Workspace
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div className="flex w-full items-center gap-2 text-sm text-muted-foreground">
            <UserRound className="h-4 w-4" />
            This invitation is no longer actionable.
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
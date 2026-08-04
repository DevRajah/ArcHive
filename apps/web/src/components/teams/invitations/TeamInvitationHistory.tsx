"use client";

import {
  CalendarDays,
  Clock3,
  Mail,
  Trash2,
  UserRound,
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
} from "@/components/ui/card";

import { InvitationRoleBadge } from "@/components/teams/invitations/InvitationRoleBadge";
import { InvitationStatusBadge } from "@/components/teams/invitations/InvitationStatusBadge";

import type {
  TeamInvitation,
} from "@/types/team.types";

interface TeamInvitationHistoryProps {
  invitations: TeamInvitation[];
  canManageInvitations: boolean;
  onCancel: (
    invitation: TeamInvitation,
  ) => void;
}

function formatDate(
  value: string,
) {
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

export function TeamInvitationHistory({
  invitations,
  canManageInvitations,
  onCancel,
}: TeamInvitationHistoryProps) {
  const orderedInvitations =
    [...invitations].sort(
      (first, second) =>
        new Date(
          second.createdAt,
        ).getTime() -
        new Date(
          first.createdAt,
        ).getTime(),
    );

  return (
    <div className="space-y-4">
      {orderedInvitations.map(
        (invitation) => (
          <Card
            key={invitation.id}
            className="transition hover:border-primary/30"
          >
            <CardContent className="p-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <Avatar className="h-11 w-11">
                    <AvatarImage
                      src={
                        invitation.invitee
                          .avatarUrl ??
                        undefined
                      }
                      alt={
                        invitation.invitee
                          .username
                      }
                    />

                    <AvatarFallback>
                      {getInitials(
                        invitation.invitee
                          .username,
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">
                        {
                          invitation.invitee
                            .username
                        }
                      </h3>

                      <InvitationRoleBadge
                        role={invitation.role}
                      />

                      <InvitationStatusBadge
                        status={
                          invitation.status
                        }
                      />
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />

                      {invitation.invitee.email ||
                        invitation.invitee.id}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[470px]">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Invited By
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                      <UserRound className="h-3.5 w-3.5" />

                      {
                        invitation.invitedBy
                          .username
                      }
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Created
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                      <CalendarDays className="h-3.5 w-3.5" />

                      {formatDate(
                        invitation.createdAt,
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Expires
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                      <Clock3 className="h-3.5 w-3.5" />

                      {formatDate(
                        invitation.expiresAt,
                      )}
                    </div>
                  </div>
                </div>

                {canManageInvitations &&
                invitation.status ===
                  "PENDING" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() =>
                      onCancel(invitation)
                    }
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ),
      )}
    </div>
  );
}
"use client";

import {
  CalendarDays,
  MoreHorizontal,
  ShieldCheck,
  Trash2,
  UserCog,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { TeamRoleBadge } from "@/components/teams/TeamRoleBadge";

import type {
  TeamMember,
} from "@/types/team.types";

interface TeamMembersTableProps {
  members: TeamMember[];
  canManageMembers: boolean;
  currentUserId: string;
  onEditRole: (
    member: TeamMember,
  ) => void;
  onRemove: (
    member: TeamMember,
  ) => void;
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

function formatJoinedDate(
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

export function TeamMembersTable({
  members,
  canManageMembers,
  currentUserId,
  onEditRole,
  onRemove,
}: TeamMembersTableProps) {
  const orderedMembers =
    [...members].sort(
      (first, second) => {
        const roleOrder = {
          OWNER: 0,
          ADMIN: 1,
          MEMBER: 2,
          VIEWER: 3,
        };

        return (
          roleOrder[first.role] -
          roleOrder[second.role]
        );
      },
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Workspace Members
        </CardTitle>

        <p className="text-sm text-muted-foreground">
          Review members and manage workspace permissions.
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {orderedMembers.map((member) => {
          const isOwner =
            member.role === "OWNER";

          const isCurrentUser =
            member.userId ===
            currentUserId;

          const canManageThisMember =
            canManageMembers &&
            !isOwner &&
            !isCurrentUser;

          return (
            <div
              key={member.id}
              className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarImage
                    src={
                      member.avatarUrl ??
                      undefined
                    }
                    alt={member.username}
                  />

                  <AvatarFallback>
                    {getInitials(
                      member.username,
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold">
                      {member.username}
                    </p>

                    <TeamRoleBadge
                      role={member.role}
                    />

                    {isCurrentUser ? (
                      <span className="text-xs text-muted-foreground">
                        You
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {member.email ||
                      member.userId}
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Joined{" "}
                    {formatJoinedDate(
                      member.joinedAt,
                    )}
                  </div>
                </div>
              </div>

              {canManageThisMember ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Actions for ${member.username}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        onEditRole(member)
                      }
                    >
                      <UserCog className="mr-2 h-4 w-4" />
                      Update role
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      disabled
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Current role: {member.role}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() =>
                        onRemove(member)
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
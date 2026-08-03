import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  FolderGit2,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { TeamRoleBadge } from "@/components/teams/TeamRoleBadge";

import type {
  TeamSummary,
} from "@/types/team.types";

interface TeamCardProps {
  team: TeamSummary;
}

function formatUpdatedDate(
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

export function TeamCard({
  team,
}: TeamCardProps) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition hover:border-primary/40 hover:shadow-md">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-muted/40">
            <span className="text-lg font-bold text-primary">
              {team.name
                .trim()
                .charAt(0)
                .toUpperCase()}
            </span>
          </div>

          <TeamRoleBadge
            role={team.role}
          />
        </div>

        <div>
          <CardTitle className="line-clamp-1 text-xl">
            {team.name}
          </CardTitle>

          <p className="mt-2 min-h-12 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {team.description ||
              "A shared ArcHive engineering intelligence workspace."}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-muted/20 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Members
            </div>

            <p className="mt-2 text-xl font-bold">
              {team.memberCount}
            </p>
          </div>

          <div className="rounded-lg border bg-muted/20 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FolderGit2 className="h-3.5 w-3.5" />
              Repositories
            </div>

            <p className="mt-2 text-xl font-bold">
              {team.repositoryCount}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          Updated{" "}
          {formatUpdatedDate(
            team.updatedAt,
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t bg-muted/10 p-4">
        <Button
          asChild
          variant="ghost"
          className="w-full justify-between"
        >
          <Link
            href={`/teams/${team.id}`}
          >
            Open Workspace

            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
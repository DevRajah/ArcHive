import Link from "next/link";

import {
  CalendarDays,
  ExternalLink,
  FolderGit2,
  Trash2,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type {
  TeamRepository,
} from "@/types/team.types";

interface TeamRepositoryCardProps {
  repository: TeamRepository;
  canManageRepositories: boolean;
  onRemove: (
    repository: TeamRepository,
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
    },
  ).format(date);
}

export function TeamRepositoryCard({
  repository,
  canManageRepositories,
  onRemove,
}: TeamRepositoryCardProps) {
  return (
    <Card className="group flex h-full flex-col transition hover:border-primary/40 hover:shadow-md">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border bg-muted/40">
            <FolderGit2 className="h-5 w-5 text-muted-foreground" />
          </div>

          <Badge
            variant={
              repository.isTracked
                ? "secondary"
                : "outline"
            }
          >
            {repository.isTracked
              ? "Tracked"
              : "Untracked"}
          </Badge>
        </div>

        <div>
          <CardTitle className="line-clamp-1 text-lg">
            {repository.name}
          </CardTitle>

          <p className="mt-1 truncate text-sm text-muted-foreground">
            {repository.fullName}
          </p>

          <p className="mt-3 min-h-12 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {repository.description ||
              "No repository description is available."}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="flex flex-wrap gap-2">
          {repository.language ? (
            <Badge variant="outline">
              {repository.language}
            </Badge>
          ) : (
            <Badge variant="outline">
              Language unknown
            </Badge>
          )}

          <Badge variant="outline">
            {repository.owner}
          </Badge>
        </div>

        <div className="space-y-2 border-t pt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <UserRound className="h-3.5 w-3.5" />
            Added by {repository.addedBy.username}
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5" />
            Added {formatDate(repository.addedAt)}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 border-t bg-muted/10 p-4">
        <Button
          asChild
          variant="outline"
          className="flex-1"
        >
          <Link
            href={`/repositories/${repository.repositoryId}`}
          >
            Open Repository
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        {canManageRepositories ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remove ${repository.name}`}
            onClick={() =>
              onRemove(repository)
            }
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
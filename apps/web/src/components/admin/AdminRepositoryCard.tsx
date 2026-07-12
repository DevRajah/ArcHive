"use client";

import Link from "next/link";
import {
  ArrowRight,
  GitFork,
  RefreshCcw,
  Star,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminRepository } from "@/types/admin.types";
import { formatIntelligenceLabel } from "@/lib/intelligence-labels";

interface AdminRepositoryCardProps {
  repository: AdminRepository;
  isReprocessing?: boolean;
  isDeleting?: boolean;
  onReprocess: (repository: AdminRepository) => void;
  onDelete: (repository: AdminRepository) => void;
}

function formatDate(value?: string | null) {
  if (!value) return "Never";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString();
}

export function AdminRepositoryCard({
  repository,
  isReprocessing = false,
  isDeleting = false,
  onReprocess,
  onDelete,
}: AdminRepositoryCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">
            {repository.fullName || repository.name}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Owner: {repository.owner || "Unknown"}
          </p>
        </div>

        {repository.isTracked && <Badge>Tracked</Badge>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {repository.language && (
          <Badge variant="secondary">{repository.language}</Badge>
        )}

        {repository.repositoryType && (
          <Badge variant="outline">
            {formatIntelligenceLabel(repository.repositoryType)}
          </Badge>
        )}

        {repository.architectureDomain && (
          <Badge variant="outline">
            {formatIntelligenceLabel(repository.architectureDomain)}
          </Badge>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Star className="h-3.5 w-3.5" />
          {repository.stars ?? 0}
        </span>

        <span className="inline-flex items-center gap-1">
          <GitFork className="h-3.5 w-3.5" />
          {repository.forks ?? 0}
        </span>

        <span>Timeline {repository.timelineCount ?? 0}</span>
        <span>Events {repository.eventCount ?? 0}</span>

        <span>
          Architecture {repository.architectureChangeCount ?? 0}
        </span>

        <span>
          Recommendations {repository.recommendationCount ?? 0}
        </span>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-background p-3">
        <p className="text-xs text-muted-foreground">
          Last intelligence refresh
        </p>

        <p className="mt-1 text-sm font-medium">
          {formatDate(repository.lastIntelligenceRefreshAt)}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/repositories/${repository.id}`}>
            View
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={() => onReprocess(repository)}
          disabled={isReprocessing || isDeleting}
        >
          <RefreshCcw
            className={`mr-2 h-4 w-4 ${
              isReprocessing ? "animate-spin" : ""
            }`}
          />

          {isReprocessing ? "Reprocessing..." : "Reprocess"}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => onDelete(repository)}
          disabled={isDeleting || isReprocessing}
        >
          <Trash2 className="mr-2 h-4 w-4" />

          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
}
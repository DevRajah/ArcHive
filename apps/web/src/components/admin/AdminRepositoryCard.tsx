import Link from "next/link";
import { ArrowRight, GitFork, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { AdminRepository } from "@/types/admin.types";
import { formatIntelligenceLabel } from "@/lib/intelligence-labels";

interface AdminRepositoryCardProps {
  repository: AdminRepository;
}

export function AdminRepositoryCard({ repository }: AdminRepositoryCardProps) {
  return (
    <Link
      href={`/admin/repositories/${repository.id}`}
      className="group rounded-xl border border-border bg-card p-5 transition hover:border-primary/50 hover:bg-accent"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">
            {repository.fullName || repository.name}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Owner: {repository.owner || "Unknown"}
          </p>
        </div>

        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
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

        {repository.isTracked && <Badge>Tracked</Badge>}
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
        <span>Architecture {repository.architectureChangeCount ?? 0}</span>
      </div>
    </Link>
  );
}
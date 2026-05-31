import Link from "next/link";
import { GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimelineEntry {
  id: string;
  title: string;
  summary?: string;
  createdAt: string;
}

interface RepositoryTimelinePreviewProps {
  repositoryId: string;
  entries?: TimelineEntry[];
}

export function RepositoryTimelinePreview({
  repositoryId,
  entries = [],
}: RepositoryTimelinePreviewProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Timeline Preview</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Recent engineering memory generated for this repository.
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href={`/repositories/${repositoryId}/timeline`}>
            View Timeline
          </Link>
        </Button>
      </div>

      {entries.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          No timeline entries available yet.
        </p>
      )}

      {entries.length > 0 && (
        <div className="mt-6 space-y-5">
          {entries.slice(0, 4).map((entry) => (
            <div key={entry.id} className="flex gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <GitBranch className="h-4 w-4 text-primary" />
              </div>

              <div>
                <h3 className="text-sm font-medium">{entry.title}</h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {entry.summary || "No timeline summary available."}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
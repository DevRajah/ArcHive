import Link from "next/link";
import { Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ArchitectureChange {
  id: string;
  title?: string;
  description?: string;
  severity?: string;
  changeType?: string;
  detectedTechnology?: string | null;
  fileAffected?: string | null;
  summary?: string | null;
  createdAt: string;
}

interface RepositoryArchitecturePreviewProps {
  repositoryId: string;
  changes?: ArchitectureChange[];
}

function formatLabel(value?: string | null) {
  if (!value || value === "UNKNOWN") return "Architecture Change";

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function dedupeArchitectureChanges(changes: ArchitectureChange[]) {
  const seen = new Set<string>();

  return changes.filter((change) => {
    const key = [
      change.changeType || change.title || "",
      change.summary || change.description || "",
      change.detectedTechnology || "",
      change.fileAffected || "",
    ]
      .join("|")
      .toLowerCase();

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

export function RepositoryArchitecturePreview({
  repositoryId,
  changes = [],
}: RepositoryArchitecturePreviewProps) {
  const uniqueChanges = dedupeArchitectureChanges(changes);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Architecture Preview</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Recent system-level changes detected in this repository.
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href={`/repositories/${repositoryId}/architecture`}>
            View Architecture
          </Link>
        </Button>
      </div>

      {uniqueChanges.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          No architecture changes detected yet.
        </p>
      )}

      {uniqueChanges.length > 0 && (
        <div className="mt-6 space-y-5">
          {uniqueChanges.slice(0, 4).map((change) => {
            const title =
              change.changeType || change.title || "Architecture Change";

            const description =
              change.summary ||
              change.description ||
              "ArcHive detected a repository architecture change.";

            return (
              <div key={change.id} className="flex gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Network className="h-4 w-4 text-primary" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-medium">
                      {formatLabel(title)}
                    </h3>

                    <Badge variant="secondary">
                      {formatLabel(change.severity || change.changeType)}
                    </Badge>
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </p>

                  {change.detectedTechnology && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Technology: {change.detectedTechnology}
                    </p>
                  )}

                  {change.fileAffected && (
                    <p className="mt-1 break-all text-xs text-muted-foreground">
                      File: {change.fileAffected}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(change.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
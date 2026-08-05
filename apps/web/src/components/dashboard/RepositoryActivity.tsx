import {
  Activity,
  Boxes,
  GitBranch,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RepositoryActivityItem {
  name: string;
  fullName?: string;
  events: number;
  architectureChanges: number;
}

interface RepositoryActivityProps {
  repositories: RepositoryActivityItem[];
}

export function RepositoryActivity({
  repositories,
}: RepositoryActivityProps) {
  const orderedRepositories = [...repositories].sort(
    (first, second) =>
      second.events - first.events,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Repository Activity
        </CardTitle>

        <p className="text-sm text-muted-foreground">
          Engineering events and architecture changes across tracked
          repositories.
        </p>
      </CardHeader>

      <CardContent>
        {!orderedRepositories.length ? (
          <div className="rounded-xl border border-dashed px-6 py-14 text-center">
            <GitBranch className="mx-auto h-9 w-9 text-muted-foreground" />

            <h3 className="mt-4 font-semibold">
              No repository activity yet
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Activity will appear after ArcHive processes repository events.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orderedRepositories.map(
              (repository) => (
                <div
                  key={
                    repository.fullName ??
                    repository.name
                  }
                  className="flex flex-col gap-4 rounded-xl border p-4 transition hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {repository.name}
                      </p>

                      {repository.fullName ? (
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {repository.fullName}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:min-w-72">
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Activity className="h-3.5 w-3.5" />
                        Engineering Events
                      </div>

                      <p className="mt-2 text-xl font-bold">
                        {repository.events ?? 0}
                      </p>
                    </div>

                    <div className="rounded-lg border bg-muted/20 p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Boxes className="h-3.5 w-3.5" />
                        Architecture Changes
                      </div>

                      <p className="mt-2 text-xl font-bold">
                        {repository.architectureChanges ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
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
  const orderedRepositories = [
    ...repositories,
  ].sort(
    (first, second) =>
      second.events - first.events,
  );

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="min-w-0">
        <CardTitle>
          Repository Activity
        </CardTitle>

        <p className="break-words text-sm text-muted-foreground">
          Engineering events and architecture changes across tracked
          repositories.
        </p>
      </CardHeader>

      <CardContent className="min-w-0">
        {!orderedRepositories.length ? (
          <div className="min-w-0 rounded-xl border border-dashed px-6 py-14 text-center">
            <GitBranch className="mx-auto h-9 w-9 text-muted-foreground" />

            <h3 className="mt-4 font-semibold">
              No repository activity yet
            </h3>

            <p className="mt-2 break-words text-sm text-muted-foreground">
              Activity will appear after ArcHive processes repository
              events.
            </p>
          </div>
        ) : (
          <div className="min-w-0 space-y-3">
            {orderedRepositories.map(
              (repository) => (
                <div
                  key={
                    repository.fullName ??
                    repository.name
                  }
                  className="flex min-w-0 flex-col gap-4 overflow-hidden rounded-xl border p-4 transition hover:border-primary/30 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="min-w-0 flex-1">
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

                  <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[18rem]">
                    <div className="min-w-0 rounded-lg border bg-muted/20 p-3">
                      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                        <Activity className="h-3.5 w-3.5 shrink-0" />

                        <span className="truncate">
                          Engineering Events
                        </span>
                      </div>

                      <p className="mt-2 text-xl font-bold">
                        {repository.events ?? 0}
                      </p>
                    </div>

                    <div className="min-w-0 rounded-lg border bg-muted/20 p-3">
                      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                        <Boxes className="h-3.5 w-3.5 shrink-0" />

                        <span className="truncate">
                          Architecture Changes
                        </span>
                      </div>

                      <p className="mt-2 text-xl font-bold">
                        {repository.architectureChanges ??
                          0}
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
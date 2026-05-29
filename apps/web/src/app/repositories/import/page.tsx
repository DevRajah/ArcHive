import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const githubRepos = [
  {
    name: "ledgerflow",
    description: "Event-driven financial reconciliation platform.",
    language: "TypeScript",
    private: false,
  },
  {
    name: "queuescope",
    description: "BullMQ and Redis queue observability platform.",
    language: "TypeScript",
    private: false,
  },
  {
    name: "archive-api",
    description: "ArcHive backend API and GitHub intelligence engine.",
    language: "TypeScript",
    private: true,
  },
];

export default function ImportRepositoryPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Import Repository
          </h1>

          <p className="mt-2 text-muted-foreground">
            Select GitHub repositories to track and analyze with ArcHive.
          </p>
        </div>

        <div className="space-y-4">
          {githubRepos.map((repo) => (
            <div
              key={repo.name}
              className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-6 md:flex-row md:items-center"
            >
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold">{repo.name}</h2>
                  <Badge variant="secondary">
                    {repo.private ? "Private" : "Public"}
                  </Badge>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {repo.description}
                </p>

                <p className="mt-3 text-sm text-muted-foreground">
                  {repo.language}
                </p>
              </div>

              <Button>Import</Button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
import { AppShell } from "@/components/layout/AppShell";
import { RepositoryCard } from "@/components/repositories/RepositoryCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const repositories = [
  {
    id: "archive-api",
    name: "archive-api",
    description: "Fastify backend powering GitHub ingestion and engineering intelligence.",
    language: "TypeScript",
    stars: 12,
    forks: 3,
    status: "TRACKED" as const,
  },
  {
    id: "archive-web",
    name: "archive-web",
    description: "Next.js SaaS frontend for repository intelligence dashboards.",
    language: "TypeScript",
    stars: 8,
    forks: 2,
    status: "TRACKED" as const,
  },
  {
    id: "archive-worker",
    name: "archive-worker",
    description: "BullMQ worker service for processing GitHub events and timelines.",
    language: "TypeScript",
    stars: 5,
    forks: 1,
    status: "TRACKED" as const,
  },
];

export default function RepositoriesPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
            <p className="mt-2 text-muted-foreground">
              Manage tracked repositories and inspect engineering intelligence.
            </p>
          </div>

          <Button asChild>
            <Link href="/repositories/import">Import Repository</Link>
          </Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {repositories.map((repo) => (
            <RepositoryCard key={repo.id} {...repo} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function RepositoryDetailPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{repoId}</h1>
              <Badge>TRACKED</Badge>
            </div>

            <p className="text-muted-foreground">
              Repository intelligence overview, architecture activity, and
              timeline summary.
            </p>
          </div>

          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href={`/repositories/${repoId}/timeline`}>Timeline</Link>
            </Button>

            <Button asChild>
              <Link href={`/repositories/${repoId}/architecture`}>
                Architecture
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Events Processed", "1,284"],
            ["Architecture Changes", "34"],
            ["Timeline Entries", "211"],
            ["Webhook Status", "Active"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">{label}</p>
              <h2 className="mt-3 text-2xl font-bold">{value}</h2>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Repository Summary</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            ArcHive has detected backend API modules, queue workers, GitHub
            webhook processing, Prisma database access, and timeline generation
            patterns in this repository.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
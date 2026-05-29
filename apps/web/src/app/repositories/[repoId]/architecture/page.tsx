import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";

const insights = [
  {
    title: "Asynchronous processing layer detected",
    severity: "High impact",
    description:
      "BullMQ and Redis indicate repository intelligence is processed outside request-response lifecycle.",
  },
  {
    title: "GitHub OAuth boundary introduced",
    severity: "Security",
    description:
      "OAuth login creates a secure integration boundary between ArcHive and GitHub accounts.",
  },
  {
    title: "Prisma data access layer detected",
    severity: "Data layer",
    description:
      "Repository uses Prisma to manage PostgreSQL-backed repository and event metadata.",
  },
  {
    title: "Webhook ingestion pathway detected",
    severity: "Integration",
    description:
      "GitHub webhook events are accepted, normalized, and pushed into background processing.",
  },
];

export default async function ArchitecturePage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Architecture Intelligence
          </h1>
          <p className="mt-2 text-muted-foreground">
            Detected architecture patterns and system evolution for {repoId}.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {insights.map((insight) => (
            <div
              key={insight.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="font-semibold">{insight.title}</h2>
                <Badge variant="secondary">{insight.severity}</Badge>
              </div>

              <p className="text-sm leading-6 text-muted-foreground">
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
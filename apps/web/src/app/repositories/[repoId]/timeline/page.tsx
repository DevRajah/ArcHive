import { AppShell } from "@/components/layout/AppShell";
import { GitCommit, GitPullRequest, Network, Webhook } from "lucide-react";

const events = [
  {
    title: "GitHub webhook ingestion added",
    type: "Webhook",
    description: "Repository started receiving live GitHub push and PR events.",
    icon: Webhook,
  },
  {
    title: "Queue worker introduced",
    type: "Architecture",
    description: "BullMQ worker added to process repository intelligence asynchronously.",
    icon: Network,
  },
  {
    title: "Repository import flow completed",
    type: "Pull Request",
    description: "Authenticated GitHub import endpoint added.",
    icon: GitPullRequest,
  },
  {
    title: "Timeline generator refactored",
    type: "Commit",
    description: "Engineering events are now normalized into timeline entries.",
    icon: GitCommit,
  },
];

export default async function TimelinePage({
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
            Engineering Timeline
          </h1>
          <p className="mt-2 text-muted-foreground">
            Architecture and engineering memory for {repoId}.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="space-y-6">
            {events.map((event) => {
              const Icon = event.icon;

              return (
                <div key={event.title} className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm text-primary">{event.type}</p>
                    <h3 className="mt-1 font-semibold">{event.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
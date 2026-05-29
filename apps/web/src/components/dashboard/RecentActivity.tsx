import { GitCommit, GitPullRequest, Network, Webhook } from "lucide-react";

const activities = [
  {
    title: "Webhook event processed",
    description: "GitHub push event ingested for archive-api",
    time: "2 minutes ago",
    icon: Webhook,
  },
  {
    title: "Architecture change detected",
    description: "Redis queue worker introduced in repository structure",
    time: "18 minutes ago",
    icon: Network,
  },
  {
    title: "Pull request analyzed",
    description: "PR #42 added repository intelligence endpoints",
    time: "1 hour ago",
    icon: GitPullRequest,
  },
  {
    title: "Commit indexed",
    description: "Fastify service layer refactor added to engineering timeline",
    time: "3 hours ago",
    icon: GitCommit,
  },
];

export function RecentActivity() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Recent Engineering Activity</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Latest repository events processed by ArcHive.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {activities.map((activity) => {
          const Icon = activity.icon;

          return (
            <div key={activity.title} className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  {activity.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
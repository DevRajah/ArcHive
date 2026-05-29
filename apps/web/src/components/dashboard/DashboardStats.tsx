import { Activity, FolderGit2, GitBranch, Network } from "lucide-react";
import { DashboardSummary } from "@/types/dashboard.types";

interface DashboardStatsProps {
  summary?: DashboardSummary;
}

export function DashboardStats({ summary }: DashboardStatsProps) {
  const stats = [
    {
      label: "Tracked Repositories",
      value: summary?.repositories ?? 0,
      description: "Repositories connected to ArcHive",
      icon: FolderGit2,
    },
    {
      label: "Engineering Events",
      value: summary?.engineeringEvents ?? 0,
      description: "Commits, PRs, imports and webhooks processed",
      icon: Activity,
    },
    {
      label: "Architecture Changes",
      value: summary?.architectureChanges ?? 0,
      description: "Detected structural and system-level changes",
      icon: Network,
    },
    {
      label: "Timeline Insights",
      value: summary?.timelineEntries ?? 0,
      description: "Generated repository intelligence events",
      icon: GitBranch,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>

              <div className="rounded-lg bg-primary/10 p-2">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            </div>

            <h2 className="mt-4 text-3xl font-bold">
              {stat.value.toLocaleString()}
            </h2>

            <p className="mt-2 text-xs text-muted-foreground">
              {stat.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
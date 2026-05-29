import { GitBranch, FolderGit2, Network, Activity } from "lucide-react";

const stats = [
    {
        label: "Tracked Repositories",
        value: "12",
        description: "Repositories connected to ArcHive",
        icon: FolderGit2,
    },
    {
        label: "Engineering Events",
        value: "8,421",
        description: "Commits, PRs, imports and webhooks processed",
        icon: Activity,
    },
    {
        label: "Architecture Changes",
        value: "214",
        description: "Detected structural and system-level changes",
        icon: Network,
    },
    {
        label: "Timeline Insights",
        value: "1,204",
        description: "Generated repository intelligence events",
        icon: GitBranch,
    },
];

export function DashboardStats() {
    return (
        <div className="grid min-w-0 gap-6 xl:grid-cols-[1.4fr_1fr]">      {stats.map((stat) => {
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

                    <h2 className="mt-4 text-3xl font-bold">{stat.value}</h2>

                    <p className="mt-2 text-xs text-muted-foreground">
                        {stat.description}
                    </p>
                </div>
            );
        })}
        </div>
    );
}
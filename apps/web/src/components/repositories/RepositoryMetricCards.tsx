import { Activity, GitBranch, Network } from "lucide-react";

interface RepositoryMetricCardsProps {
  totalEvents: number;
  totalTimelineEntries: number;
  totalArchitectureChanges: number;
}

export function RepositoryMetricCards({
  totalEvents,
  totalTimelineEntries,
  totalArchitectureChanges,
}: RepositoryMetricCardsProps) {
  const cards = [
    {
      label: "Engineering Events",
      value: totalEvents,
      description: "Repository events processed by ArcHive",
      icon: Activity,
    },
    {
      label: "Timeline Entries",
      value: totalTimelineEntries,
      description: "Generated engineering memory entries",
      icon: GitBranch,
    },
    {
      label: "Architecture Changes",
      value: totalArchitectureChanges,
      description: "Detected system-level evolution signals",
      icon: Network,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>

              <div className="rounded-lg bg-primary/10 p-2">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            </div>

            <h2 className="mt-4 text-3xl font-bold">
              {card.value.toLocaleString()}
            </h2>

            <p className="mt-2 text-xs text-muted-foreground">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
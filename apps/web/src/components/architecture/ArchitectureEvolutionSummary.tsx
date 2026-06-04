import { Boxes, GitBranch, Network } from "lucide-react";
import { ArchitectureEvolutionResponse } from "@/types/architecture-evolution.types";
import { formatFilterLabel } from "@/lib/filters";

interface ArchitectureEvolutionSummaryProps {
  summary: ArchitectureEvolutionResponse["summary"];
}

export function ArchitectureEvolutionSummary({
  summary,
}: ArchitectureEvolutionSummaryProps) {
  const cards = [
    {
      label: "Total Architecture Changes",
      value: summary.totalArchitectureChanges,
      description: "Architecture-level changes detected by ArcHive",
      icon: Network,
    },
    {
      label: "Total Domains",
      value: summary.totalDomains,
      description: "Architecture domains affected over time",
      icon: Boxes,
    },
    {
      label: "Most Active Domain",
      value: summary.mostActiveDomain
        ? formatFilterLabel(summary.mostActiveDomain)
        : "Unknown",
      description: "Architecture area with the most detected evolution",
      icon: GitBranch,
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

            <h2 className="mt-4 text-2xl font-bold">
              {typeof card.value === "number"
                ? card.value.toLocaleString()
                : card.value}
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
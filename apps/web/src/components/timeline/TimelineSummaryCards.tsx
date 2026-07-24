import {
  Activity,
  BrainCircuit,
  CalendarClock,
  Lightbulb,
  Network,
} from "lucide-react";

import { TimelineSummary } from "@/types/timeline.types";

interface TimelineSummaryCardsProps {
  summary: TimelineSummary;
}

/**
 * Converts an API date into a readable date for the user.
 */
function formatSummaryDate(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not recorded";
  }

  return date.toLocaleString();
}

export function TimelineSummaryCards({
  summary,
}: TimelineSummaryCardsProps) {
  const cards = [
    {
      label: "Total Events",
      value: summary.totalEvents.toLocaleString(),
      description: "All recorded timeline events",
      icon: Activity,
    },
    {
      label: "Architecture Changes",
      value: summary.architectureChanges.toLocaleString(),
      description: "Detected structural changes",
      icon: Network,
    },
    {
      label: "Intelligence Snapshots",
      value: summary.intelligenceSnapshots.toLocaleString(),
      description: "Repository intelligence records",
      icon: BrainCircuit,
    },
    {
      label: "Advisor Snapshots",
      value: summary.advisorSnapshots.toLocaleString(),
      description: "Architecture advisor analyses",
      icon: Lightbulb,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {card.label}
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {card.value}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-background p-2">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-0.5 h-4 w-4 text-primary" />

            <div>
              <p className="text-sm font-medium">First recorded activity</p>

              <p className="mt-1 text-sm text-muted-foreground">
                {formatSummaryDate(summary.firstRecordedAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-0.5 h-4 w-4 text-primary" />

            <div>
              <p className="text-sm font-medium">Latest recorded activity</p>

              <p className="mt-1 text-sm text-muted-foreground">
                {formatSummaryDate(summary.lastRecordedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
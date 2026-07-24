import Link from "next/link";
import {
  Activity,
  BrainCircuit,
  GitBranch,
  HeartPulse,
  Lightbulb,
  Network,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  TimelineEvent,
  TimelineEventType,
  TimelineSeverity,
} from "@/types/timeline.types";

interface TimelineEventCardProps {
  event: TimelineEvent;
  repositoryId: string;
}

/**
 * Converts values such as ARCHITECTURE_CHANGE into Architecture Change.
 */
function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Selects an icon that visually represents each normalized event type.
 */
function getEventIcon(type: TimelineEventType) {
  switch (type) {
    case "ARCHITECTURE_CHANGE":
      return Network;

    case "INTELLIGENCE_SNAPSHOT":
      return BrainCircuit;

    case "ARCHITECTURE_ADVISOR":
      return Lightbulb;

    case "HEALTH_TREND":
      return HeartPulse;

    case "ENGINEERING_EVENT":
    default:
      return GitBranch;
  }
}

/**
 * Gives each severity a clear badge treatment.
 *
 * These use existing Tailwind theme colours instead of hard-coded custom
 * colour values.
 */
function getSeverityClassName(severity: TimelineSeverity) {
  switch (severity) {
    case "LOW":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";

    case "MEDIUM":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";

    case "HIGH":
      return "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400";

    case "CRITICAL":
      return "border-destructive/30 bg-destructive/10 text-destructive";

    default:
      return "";
  }
}

/**
 * Decides which ArcHive page should open when the user wants more details.
 */
function getEventDrillDownHref(
  type: TimelineEventType,
  repositoryId: string,
) {
  switch (type) {
    case "ARCHITECTURE_CHANGE":
    case "ARCHITECTURE_ADVISOR":
      return `/repositories/${repositoryId}/architecture`;

    case "HEALTH_TREND":
      return `/repositories/${repositoryId}/health-trends`;

    case "INTELLIGENCE_SNAPSHOT":
      return `/repositories/${repositoryId}`;

    case "ENGINEERING_EVENT":
    default:
      return null;
  }
}

/**
 * Safely turns metadata into readable rows.
 *
 * We only show simple values here because deeply nested objects can make
 * the timeline card difficult to read.
 */
function getReadableMetadata(metadata: Record<string, unknown>) {
  return Object.entries(metadata)
    .filter(([, value]) => {
      return (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      );
    })
    .slice(0, 6);
}

export function TimelineEventCard({
  event,
  repositoryId,
}: TimelineEventCardProps) {
  const Icon = getEventIcon(event.type);

  const drillDownHref = getEventDrillDownHref(
    event.type,
    repositoryId,
  );

  const readableMetadata = getReadableMetadata(event.metadata);

  const eventDate = new Date(event.timestamp);

  const formattedDate = Number.isNaN(eventDate.getTime())
    ? "Unknown date"
    : eventDate.toLocaleString();

  return (
    <div className="relative flex gap-4 sm:gap-5">
      <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
        <Icon className="h-4 w-4 text-primary" />
      </div>

      <article className="min-w-0 flex-1 rounded-xl border border-border bg-background p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {formatEnumLabel(event.type)}
              </Badge>

              <Badge
                variant="outline"
                className={getSeverityClassName(event.severity)}
              >
                {formatEnumLabel(event.severity)}
              </Badge>
            </div>

            <h2 className="mt-3 break-words text-base font-semibold">
              {event.title || formatEnumLabel(event.type)}
            </h2>

            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
              {event.description || "No event description available."}
            </p>
          </div>

          <div className="shrink-0 text-xs text-muted-foreground">
            {formattedDate}
          </div>
        </div>

        {readableMetadata.length > 0 && (
          <div className="mt-5 grid gap-3 border-t border-border pt-4 sm:grid-cols-2 xl:grid-cols-3">
            {readableMetadata.map(([key, value]) => (
              <div key={key} className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {formatEnumLabel(key)}
                </p>

                <p className="mt-1 truncate text-sm font-medium">
                  {String(value)}
                </p>
              </div>
            ))}
          </div>
        )}

        {drillDownHref && (
          <div className="mt-5 border-t border-border pt-4">
            <Link
              href={drillDownHref}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Activity className="h-4 w-4" />
              View related intelligence
            </Link>
          </div>
        )}
      </article>
    </div>
  );
}
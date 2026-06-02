import { Activity, GitCommit, GitPullRequest, Network, Webhook } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RepositoryRecentEvent {
  id: string;
  eventType: string;
  title?: string;
  summary?: string;
  source?: string;
  createdAt: string;
}

interface RepositoryRecentEventsProps {
  events?: RepositoryRecentEvent[];
}

function formatEventType(eventType?: string) {
  if (!eventType || eventType === "UNKNOWN") return "Engineering Event";

  return eventType
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getEventIcon(eventType?: string) {
  if (!eventType || eventType === "UNKNOWN") return Activity;
  if (eventType.includes("WEBHOOK")) return Webhook;
  if (eventType.includes("PULL") || eventType.includes("PR")) return GitPullRequest;
  if (eventType.includes("COMMIT")) return GitCommit;
  if (
    eventType.includes("ARCHITECTURE") ||
    eventType.includes("QUEUE") ||
    eventType.includes("REDIS") ||
    eventType.includes("API")
  ) {
    return Network;
  }

  return Activity;
}

export function RepositoryRecentEvents({
  events = [],
}: RepositoryRecentEventsProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Recent Engineering Events</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Latest repository-level activity detected by ArcHive.
        </p>
      </div>

      {events.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          No recent engineering events found for this repository.
        </p>
      )}

      {events.length > 0 && (
        <div className="mt-6 space-y-5">
          {events.slice(0, 6).map((event) => {
            const Icon = getEventIcon(event.eventType);

            return (
              <div
                key={event.id}
                className="flex gap-4 border-b border-border pb-5 last:border-0"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-medium">
                        {event.title || formatEventType(event.eventType)}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.summary ||
                          "ArcHive recorded engineering activity for this repository."}
                      </p>
                    </div>

                    <Badge variant="secondary">
                      {formatEventType(event.eventType)}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {event.source && <span>{event.source}</span>}
                    <span>{new Date(event.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
import { Activity, GitCommit, GitPullRequest, Network, Webhook } from "lucide-react";
import { RecentEngineeringEvent } from "@/types/dashboard.types";

interface RecentActivityProps {
  events?: RecentEngineeringEvent[];
}

function formatEventType(eventType?: string) {
  if (!eventType) return "Engineering Event";

  if (eventType === "UNKNOWN") {
    return "Engineering Event";
  }

  return eventType
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getEventIcon(eventType?: string) {
  if (!eventType || eventType === "UNKNOWN") {
    return Activity;
  }

  if (
    eventType.includes("WEBHOOK")
  ) {
    return Webhook;
  }

  if (
    eventType.includes("PULL") ||
    eventType.includes("PR")
  ) {
    return GitPullRequest;
  }

  if (
    eventType.includes("COMMIT")
  ) {
    return GitCommit;
  }

  if (
    eventType.includes("ARCHITECTURE") ||
    eventType.includes("QUEUE") ||
    eventType.includes("REDIS")
  ) {
    return Network;
  }

  return Activity;
}

export function RecentActivity({ events = [] }: RecentActivityProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Recent Engineering Activity</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Latest repository events processed by ArcHive.
        </p>
      </div>

      {events.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          No recent engineering activity yet.
        </p>
      )}

      {events.length > 0 && (
        <div className="mt-6 space-y-5">
          {events.slice(0, 6).map((event) => {

            const Icon = getEventIcon(event.eventType);

            return (
              <div key={event.id} className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium">
                      {event.title || formatEventType(event.eventType)}                    </p>

                    <p className="text-xs text-muted-foreground">
                      {new Date(event.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-1 text-sm text-muted-foreground">
                    <p>
                      {event.repositoryFullName ||
                        event.repositoryName ||
                        "Repository activity"}
                      {event.source ? ` · ${event.source}` : ""}
                    </p>

                    <p className="mt-1">
                      {event.summary ||
                        "ArcHive recorded engineering activity for this repository."}
                    </p>
                    
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
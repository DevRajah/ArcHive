"use client";

import { X, Activity, GitBranch, Network, CheckCircle2 } from "lucide-react";
import { LiveNotification } from "@/types/live-event.types";

interface LiveNotificationStackProps {
  notifications: LiveNotification[];
  onDismiss: (id: string) => void;
}

function getIcon(type: LiveNotification["type"]) {
  if (type === "architecture-change:detected") return Network;
  if (type === "queue-job:completed") return CheckCircle2;
  if (type === "repository:updated") return GitBranch;

  return Activity;
}

function formatTime(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) return "Just now";

  return "Just now";
}

export function LiveNotificationStack({
  notifications,
  onDismiss,
}: LiveNotificationStackProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] space-y-3">
      {notifications.map((notification) => {
        const Icon = getIcon(notification.type);

        return (
          <div
            key={notification.id}
            className="rounded-xl border border-border bg-card p-4 shadow-lg"
          >
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      {notification.title}
                    </p>

                    {notification.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onDismiss(notification.id)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  {formatTime(notification.createdAt)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
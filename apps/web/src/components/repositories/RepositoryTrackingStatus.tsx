"use client";

import { Radio, Webhook, Activity, CheckCircle2 } from "lucide-react";

interface RepositoryTrackingStatusProps {
  isRealtimeConnected: boolean;
  lastLiveUpdatedAt: string | null;
  trackingStatus?: {
    isTracked?: boolean;
    webhookStatus?: "CONNECTED" | "MISSING" | "UNKNOWN";
    lastEngineeringEventAt?: string | null;
    lastQueueStatus?: string | null;
  };
}

function getStatusDot(status: "healthy" | "warning" | "danger") {
  if (status === "healthy") return "bg-emerald-500";
  if (status === "warning") return "bg-yellow-500";
  return "bg-red-500";
}

function formatDate(value?: string | null) {
  if (!value) return "No recent activity";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No recent activity";

  return date.toLocaleString();
}

function formatQueueStatus(status?: string | null) {
  if (!status) return "No recent queue status";

  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function RepositoryTrackingStatus({
  isRealtimeConnected,
  lastLiveUpdatedAt,
  trackingStatus,
}: RepositoryTrackingStatusProps) {
  const isTracked = trackingStatus?.isTracked ?? true;
  const webhookStatus = trackingStatus?.webhookStatus || "UNKNOWN";

  const items = [
    {
      label: "Live Repository Monitoring",
      value: isTracked ? "Active" : "Inactive",
      icon: Activity,
      status: isTracked ? "healthy" : "danger",
    },
    {
      label: "Webhook Activity",
      value:
        webhookStatus === "CONNECTED"
          ? "Connected"
          : webhookStatus === "MISSING"
            ? "Missing"
            : "Unknown",
      icon: Webhook,
      status:
        webhookStatus === "CONNECTED"
          ? "healthy"
          : webhookStatus === "MISSING"
            ? "danger"
            : "warning",
    },
    {
      label: "Realtime Connection",
      value: isRealtimeConnected ? "Connected" : "Disconnected",
      icon: Radio,
      status: isRealtimeConnected ? "healthy" : "danger",
    },
    {
      label: "Processing Pipeline",
      value: formatQueueStatus(trackingStatus?.lastQueueStatus),
      icon: CheckCircle2,
      status:
        trackingStatus?.lastQueueStatus?.toLowerCase() === "failed"
          ? "danger"
          : trackingStatus?.lastQueueStatus
            ? "healthy"
            : "warning",
    },
  ] as const;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Repository Tracking Status</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitoring health for GitHub webhooks, realtime updates, and
          repository intelligence processing.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-xl border border-border bg-background p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-primary" />

                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.value}
                    </p>
                  </div>
                </div>

                <span
                  className={`h-2.5 w-2.5 rounded-full ${getStatusDot(
                    item.status
                  )}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
        <p>
          Last Engineering Event:{" "}
          {formatDate(trackingStatus?.lastEngineeringEventAt)}
        </p>

        <p className="mt-2">
          Realtime Page Update:{" "}
          {lastLiveUpdatedAt ? "Updated just now" : "Waiting for activity"}
        </p>
      </div>
    </div>
  );
}
"use client";

import { Activity, CheckCircle2, Radio, Webhook } from "lucide-react";

interface RepositoryTrackingStatusProps {
  trackingStatus?: {
    isTracked?: boolean;
    webhookStatus?: "CONNECTED" | "MISSING" | "UNKNOWN";
    lastEngineeringEventAt?: string | null;
    lastQueueStatus?: string | null;
    realtimeStatus?: "CONNECTED" | "DISCONNECTED" | "UNKNOWN";
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

function formatStatus(value?: string | null) {
  if (!value) return "Unknown";

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getWebhookHealth(status?: string) {
  if (status === "CONNECTED") return "healthy";
  if (status === "MISSING") return "danger";
  return "warning";
}

function getRealtimeHealth(status?: string) {
  if (status === "CONNECTED") return "healthy";
  if (status === "DISCONNECTED") return "danger";
  return "warning";
}

function getQueueHealth(status?: string | null) {
  const normalized = status?.toLowerCase();

  if (!normalized) return "warning";
  if (normalized === "failed") return "danger";

  return "healthy";
}

export function RepositoryTrackingStatus({
  trackingStatus,
}: RepositoryTrackingStatusProps) {
  const isTracked = trackingStatus?.isTracked ?? false;
  const webhookStatus = trackingStatus?.webhookStatus || "UNKNOWN";
  const realtimeStatus = trackingStatus?.realtimeStatus || "UNKNOWN";
  const queueStatus = trackingStatus?.lastQueueStatus;

  const items = [
    {
      label: "Live Repository Monitoring",
      value: isTracked ? "Active" : "Inactive",
      icon: Activity,
      status: isTracked ? "healthy" : "danger",
    },
    {
      label: "Webhook Activity",
      value: formatStatus(webhookStatus),
      icon: Webhook,
      status: getWebhookHealth(webhookStatus),
    },
    {
      label: "Realtime Connection",
      value: formatStatus(realtimeStatus),
      icon: Radio,
      status: getRealtimeHealth(realtimeStatus),
    },
    {
      label: "Processing Pipeline",
      value: queueStatus ? formatStatus(queueStatus) : "No recent queue status",
      icon: CheckCircle2,
      status: getQueueHealth(queueStatus),
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
      </div>
    </div>
  );
}
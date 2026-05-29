"use client";

import { Activity, CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueueMetrics } from "@/hooks/useQueue";

export function QueueHealthPanel() {
  const { data, isLoading, isError, error } = useQueueMetrics();

  const metrics = [
    {
      label: "Waiting",
      value: data?.waiting ?? 0,
      icon: Clock,
    },
    {
      label: "Active",
      value: data?.active ?? 0,
      icon: Loader2,
    },
    {
      label: "Completed",
      value: data?.completed ?? 0,
      icon: CheckCircle2,
    },
    {
      label: "Failed",
      value: data?.failed ?? 0,
      icon: XCircle,
    },
    {
      label: "Delayed",
      value: data?.delayed ?? 0,
      icon: Activity,
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Queue Health</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          BullMQ background processing status for repository intelligence jobs.
        </p>
      </div>

      {isLoading && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-20 rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">
            Failed to load queue metrics
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Please check backend queue endpoint."}
          </p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <div
                key={metric.label}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {metric.label}
                  </p>

                  <Icon className="h-4 w-4 text-primary" />
                </div>

                <p className="mt-3 text-2xl font-bold">
                  {metric.value.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
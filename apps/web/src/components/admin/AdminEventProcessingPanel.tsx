import {
  AlertTriangle,
  CheckCircle2,
  CircleGauge,
} from "lucide-react";

interface AdminEventProcessingPanelProps {
  completed?: number;
  failed?: number;
}

export function AdminEventProcessingPanel({
  completed = 0,
  failed = 0,
}: AdminEventProcessingPanelProps) {
  const total = completed + failed;

  const successRate =
    total > 0 ? Math.round((completed / total) * 100) : 100;

  const isHealthy = failed === 0 || successRate >= 95;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <CircleGauge className="h-5 w-5 text-primary" />

            <h2 className="text-lg font-semibold">
              Event Processing
            </h2>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            Platform-wide engineering event processing health.
          </p>
        </div>

        <div
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isHealthy
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {isHealthy ? "Healthy" : "Attention required"}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">
            Success Rate
          </p>

          <p className="mt-2 text-3xl font-bold">
            {successRate}%
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />

            <p className="text-sm text-muted-foreground">
              Completed
            </p>
          </div>

          <p className="mt-2 text-3xl font-bold">
            {completed.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />

            <p className="text-sm text-muted-foreground">
              Failed
            </p>
          </div>

          <p className="mt-2 text-3xl font-bold">
            {failed.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
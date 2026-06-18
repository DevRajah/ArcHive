import { Badge } from "@/components/ui/badge";

interface ScoreCardProps {
  label: string;
  score?: number | null;
  level?: string | null;
  description?: string;
  lowerIsBetter?: boolean;
}

export function ScoreCard({
  label,
  score,
  level,
  description,
  lowerIsBetter,
}: ScoreCardProps) {
  const safeScore = typeof score === "number" ? score : null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>

          <h3 className="mt-3 text-3xl font-bold">
            {safeScore !== null ? `${safeScore}%` : "—"}
          </h3>
        </div>

        {level && <Badge variant="secondary">{level}</Badge>}
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{
            width: `${safeScore ?? 0}%`,
          }}
        />
      </div>

      {description && (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      )}

      {lowerIsBetter && (
        <p className="mt-2 text-xs text-muted-foreground">
          Lower score is better for this metric.
        </p>
      )}
    </div>
  );
}
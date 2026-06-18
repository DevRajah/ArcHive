import { Badge } from "@/components/ui/badge";

interface ComparisonScoreCardProps {
  label: string;
  leftName: string;
  rightName: string;
  leftScore?: number | null;
  rightScore?: number | null;
  leftLevel?: string | null;
  rightLevel?: string | null;
  lowerIsBetter?: boolean;
}

function getWinner(
  left?: number | null,
  right?: number | null,
  lowerIsBetter?: boolean
) {
  if (typeof left !== "number" || typeof right !== "number") return "tie";
  if (left === right) return "tie";

  if (lowerIsBetter) {
    return left < right ? "left" : "right";
  }

  return left > right ? "left" : "right";
}

function formatScore(score?: number | null) {
  return typeof score === "number" ? `${score}%` : "—";
}

export function ComparisonScoreCard({
  label,
  leftName,
  rightName,
  leftScore,
  rightScore,
  leftLevel,
  rightLevel,
  lowerIsBetter,
}: ComparisonScoreCardProps) {
  const winner = getWinner(leftScore, rightScore, lowerIsBetter);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{label}</h3>

        {winner !== "tie" && (
          <Badge variant="secondary">
            {winner === "left" ? leftName : rightName} leads
          </Badge>
        )}

        {winner === "tie" && <Badge variant="outline">Balanced</Badge>}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="truncate text-sm text-muted-foreground">{leftName}</p>
          <p className="mt-2 text-3xl font-bold">{formatScore(leftScore)}</p>
          {leftLevel && (
            <Badge className="mt-3" variant="secondary">
              {leftLevel}
            </Badge>
          )}
        </div>

        <div className="rounded-xl border border-border bg-background p-4">
          <p className="truncate text-sm text-muted-foreground">{rightName}</p>
          <p className="mt-2 text-3xl font-bold">{formatScore(rightScore)}</p>
          {rightLevel && (
            <Badge className="mt-3" variant="secondary">
              {rightLevel}
            </Badge>
          )}
        </div>
      </div>

      {lowerIsBetter && (
        <p className="mt-3 text-xs text-muted-foreground">
          Lower score is better for this metric.
        </p>
      )}
    </div>
  );
}
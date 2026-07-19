function normalizePercentage(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value <= 1 ? value * 100 : value));
}

export function RelationshipStrength({
  value,
  label = "Strength",
}: {
  value?: number | null;
  label?: string;
}) {
  const percentage = normalizePercentage(value);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {Math.round(percentage)}%
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function formatRelationshipPercentage(
  value?: number | null
) {
  return `${Math.round(normalizePercentage(value))}%`;
}
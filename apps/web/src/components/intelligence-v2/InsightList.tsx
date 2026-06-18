function getText(item: unknown) {
  if (typeof item === "string") return item;

  if (typeof item === "number") return String(item);

  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;

    return String(
      record.title ||
        record.reason ||
        record.description ||
        record.summary ||
        record.action ||
        JSON.stringify(record)
    );
  }

  return "Unknown signal";
}

interface InsightListProps {
  items?: unknown[];
  empty?: string;
  tone?: "neutral" | "success" | "warning";
  limit?: number;
}

export function InsightList({
  items,
  empty = "No insights available yet.",
  tone = "neutral",
  limit = 5,
}: InsightListProps) {
  const visibleItems = items?.slice(0, limit) || [];

  if (visibleItems.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <div className="space-y-2">
      {visibleItems.map((item, index) => {
        const text = getText(item);

        return (
          <div
            key={`${text}-${index}`}
            className={`rounded-lg border p-3 text-sm leading-6 ${
              tone === "warning"
                ? "border-yellow-500/30 bg-yellow-500/10"
                : tone === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-border bg-background"
            }`}
          >
            {text}
          </div>
        );
      })}

      {items && items.length > limit && (
        <p className="text-xs text-muted-foreground">
          +{items.length - limit} more hidden for readability
        </p>
      )}
    </div>
  );
}
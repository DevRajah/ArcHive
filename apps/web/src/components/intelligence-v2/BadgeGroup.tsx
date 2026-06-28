import { Badge } from "@/components/ui/badge";
//import { formatFilterLabel } from "@/lib/filters";
import { formatIntelligenceLabel } from "@/lib/intelligence-labels";

interface BadgeGroupProps {
  items?: unknown[];
  empty?: string;
  variant?: "default" | "secondary" | "outline";
  humanize?: boolean;
  limit?: number;
}

function normalizeBadgeItems(items?: unknown[]): string[] {
  if (!Array.isArray(items)) return [];

  return items
    .flatMap((item) => {
      if (typeof item === "string") {
        return item
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);
      }

      if (typeof item === "number" || typeof item === "boolean") {
        return [String(item)];
      }

      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;

        const value =
          record.type ||
          record.name ||
          record.label ||
          record.title ||
          record.domain ||
          record.technology ||
          record.capability ||
          record.value;

        if (typeof value === "string") {
          return value
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean);
        }

        return [JSON.stringify(item)];
      }

      return [];
    })
    .filter(Boolean);
}

export function BadgeGroup({
  items,
  empty = "No signals detected yet.",
  variant = "secondary",
  humanize = true,
  limit = 12,
}: BadgeGroupProps) {
  const normalizedItems = normalizeBadgeItems(items);
  const visibleItems = normalizedItems.slice(0, limit);

  if (visibleItems.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {visibleItems.map((item, index) => (
        <Badge key={`${item}-${index}`} variant={variant}>
          {humanize ? formatIntelligenceLabel(item) : item}
        </Badge>
      ))}

      {normalizedItems.length > limit && (
        <Badge variant="outline">+{normalizedItems.length - limit} more</Badge>
      )}
    </div>
  );
} 
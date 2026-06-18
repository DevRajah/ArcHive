import { Badge } from "@/components/ui/badge";
import { formatFilterLabel } from "@/lib/filters";

interface BadgeGroupProps {
  items?: string[];
  empty?: string;
  variant?: "default" | "secondary" | "outline";
  humanize?: boolean;
  limit?: number;
}

export function BadgeGroup({
  items,
  empty = "No signals detected yet.",
  variant = "secondary",
  humanize = true,
  limit = 12,
}: BadgeGroupProps) {
  const visibleItems = items?.slice(0, limit) || [];

  if (visibleItems.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {visibleItems.map((item, index) => (
        <Badge key={`${item}-${index}`} variant={variant}>
          {humanize ? formatFilterLabel(item) : item}
        </Badge>
      ))}

      {items && items.length > limit && (
        <Badge variant="outline">+{items.length - limit} more</Badge>
      )}
    </div>
  );
}
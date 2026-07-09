import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { AdminActivityItem } from "@/types/admin.types";
import { formatIntelligenceLabel } from "@/lib/intelligence-labels";

interface AdminActivityTimelineProps {
  activities?: AdminActivityItem[];
}

function formatDate(value?: string | null) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleString();
}

function groupByDay(items: AdminActivityItem[]) {
  return items.reduce<Record<string, AdminActivityItem[]>>((groups, item) => {
    const key = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString()
      : "Unknown date";

    groups[key] = groups[key] || [];
    groups[key].push(item);

    return groups;
  }, {});
}

export function AdminActivityTimeline({
  activities = [],
}: AdminActivityTimelineProps) {
  const grouped = groupByDay(activities);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([day, items]) => (
        <div key={day} className="rounded-xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">{day}</h2>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {item.type && (
                    <Badge variant="secondary">
                      {formatIntelligenceLabel(item.type)}
                    </Badge>
                  )}

                  {item.repositoryName && item.repositoryId && (
                    <Badge variant="outline">
                      <Link href={`/admin/repositories/${item.repositoryId}`}>
                        {item.repositoryName}
                      </Link>
                    </Badge>
                  )}
                </div>

                <p className="mt-3 font-medium">
                  {item.title || "Admin activity"}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description || "No description available."}
                </p>

                <p className="mt-3 text-xs text-muted-foreground">
                  {formatDate(item.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
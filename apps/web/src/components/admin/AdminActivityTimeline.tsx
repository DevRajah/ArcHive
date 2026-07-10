import Link from "next/link";
import {
  CalendarDays,
  FileClock,
  GitBranch,
  Network,
  ShieldAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { AdminActivityItem } from "@/types/admin.types";
import { formatIntelligenceLabel } from "@/lib/intelligence-labels";

interface AdminActivityTimelineProps {
  activities?: AdminActivityItem[];
}

function formatDate(value?: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString();
}

function groupByDay(items: AdminActivityItem[]) {
  return items.reduce<Record<string, AdminActivityItem[]>>((groups, item) => {
    const date = item.createdAt ? new Date(item.createdAt) : null;

    const key =
      date && !Number.isNaN(date.getTime())
        ? date.toLocaleDateString()
        : "Unknown date";

    groups[key] = groups[key] || [];
    groups[key].push(item);

    return groups;
  }, {});
}

function getActivityIcon(type?: string | null) {
  switch (type) {
    case "ADMIN_AUDIT":
      return ShieldAlert;

    case "TIMELINE":
      return FileClock;

    case "ENGINEERING_EVENT":
      return GitBranch;

    case "ARCHITECTURE_CHANGE":
      return Network;

    default:
      return FileClock;
  }
}

function getActivityTitle(item: AdminActivityItem) {
  if (item.title) {
    return item.title;
  }

  if (item.action) {
    return formatIntelligenceLabel(item.action);
  }

  return "Admin Activity";
}

export function AdminActivityTimeline({
  activities = [],
}: AdminActivityTimelineProps) {
  const sortedActivities = [...activities].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    return bTime - aTime;
  });

  const grouped = groupByDay(sortedActivities);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([day, items]) => (
        <div key={day} className="rounded-xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">{day}</h2>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const Icon = getActivityIcon(item.type);
              const isDeletedRepository =
                item.type === "ADMIN_AUDIT" &&
                item.action === "REPOSITORY_DELETED";

              const repositoryLabel =
                item.repository?.fullName ||
                item.repository?.name ||
                "Unknown repository";

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">
                          {formatIntelligenceLabel(item.type)}
                        </Badge>

                        {item.action && (
                          <Badge
                            variant={
                              item.action === "REPOSITORY_DELETED"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {formatIntelligenceLabel(item.action)}
                          </Badge>
                        )}

                        {isDeletedRepository && (
                          <Badge variant="destructive">Deleted</Badge>
                        )}
                      </div>

                      <p className="mt-3 font-medium">
                        {getActivityTitle(item)}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {item.description || "No description available."}
                      </p>

                      {item.actor?.username && (
                        <p className="mt-3 text-sm text-muted-foreground">
                          Actor:{" "}
                          <span className="font-medium text-foreground">
                            {item.actor.username}
                          </span>
                        </p>
                      )}

                      {item.repository && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span>Repository: </span>

                          {isDeletedRepository || item.repository.deleted ? (
                            <span className="font-medium text-foreground">
                              {repositoryLabel}
                            </span>
                          ) : (
                            <Link
                              href={`/admin/repositories/${item.repository.id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {repositoryLabel}
                            </Link>
                          )}
                        </div>
                      )}

                      <p className="mt-3 text-xs text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
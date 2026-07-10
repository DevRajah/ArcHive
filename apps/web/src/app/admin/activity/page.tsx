"use client";

import { AppShell } from "@/components/layout/AppShell";
import { AdminActivityTimeline } from "@/components/admin/AdminActivityTimeline";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStateCard } from "@/components/admin/AdminStateCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminActivity } from "@/hooks/useAdmin";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { isAdminForbidden } from "@/lib/admin-errors";

export default function AdminActivityPage() {
  const { data, isLoading, isError, error, refetch } = useAdminActivity();

  const activities = Array.isArray(data)
    ? data
    : data && typeof data === "object" && "activities" in data
      ? data.activities
      : [];

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminPageHeader
          title="Admin Activity"
          description="Timeline of repository events, engineering activity, architecture changes, and admin-visible operational activity."
        />

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))}
          </div>
        )}
        {isError && isAdminForbidden(error) && <AdminAccessRequired />}

        {isError && !isAdminForbidden(error) && (
          <AdminStateCard
            title="Failed to load activity"
            description={
              error instanceof Error
                ? error.message
                : "Please check backend connection."
            }
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && activities.length === 0 && (
          <AdminStateCard
            title="No admin activity found"
            description="No activity has been recorded yet."
          />
        )}

        {!isLoading && !isError && activities.length > 0 && (
          <AdminActivityTimeline activities={activities} />
        )}
      </div>
    </AppShell>
  );
}
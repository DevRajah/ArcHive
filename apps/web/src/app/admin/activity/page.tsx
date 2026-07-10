"use client";

import { AppShell } from "@/components/layout/AppShell";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminActivityTimeline } from "@/components/admin/AdminActivityTimeline";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStateCard } from "@/components/admin/AdminStateCard";
import { Skeleton } from "@/components/ui/skeleton";

import { useAdminActivity } from "@/hooks/useAdmin";
import { isAdminForbidden } from "@/lib/admin-errors";
import { AdminActivityItem } from "@/types/admin.types";

export default function AdminActivityPage() {
  const { data, isLoading, isError, error, refetch } = useAdminActivity();

  const activities: AdminActivityItem[] = Array.isArray(data)
    ? data
    : data?.activity || [];

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminPageHeader
          title="Admin Activity"
          description="Platform-wide audit trail covering administrator actions, repository events, engineering activity, and architecture changes."
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
            title="Failed to load admin activity"
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
            description="No platform activity has been recorded yet."
          />
        )}

        {!isLoading && !isError && activities.length > 0 && (
          <AdminActivityTimeline activities={activities} />
        )}
      </div>
    </AppShell>
  );
}
"use client";

import { useMemo, useState } from "react";
import { RefreshCcw } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { AdminActivityFilters } from "@/components/admin/AdminActivityFilters";
import { AdminActivityTimeline } from "@/components/admin/AdminActivityTimeline";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminQueryError } from "@/components/admin/AdminQueryError";
import { AdminStateCard } from "@/components/admin/AdminStateCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useAdminActivity } from "@/hooks/useAdmin";
import { AdminActivityItem } from "@/types/admin.types";

function includesSearch(value: unknown, query: string) {
  if (!query) return true;

  return String(value ?? "")
    .toLowerCase()
    .includes(query.toLowerCase());
}

export default function AdminActivityPage() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedAction, setSelectedAction] = useState("ALL");

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useAdminActivity();

  const activities: AdminActivityItem[] = useMemo(() => {
    if (Array.isArray(data)) {
      return data;
    }

    return data?.activity ?? [];
  }, [data]);

  const activityTypes = useMemo(() => {
    return Array.from(
      new Set(
        activities
          .map((item) => item.type)
          .filter((value): value is string => Boolean(value))
      )
    ).sort();
  }, [activities]);

  const activityActions = useMemo(() => {
    return Array.from(
      new Set(
        activities
          .map((item) => item.action)
          .filter((value): value is string => Boolean(value))
      )
    ).sort();
  }, [activities]);

  const filteredActivities = useMemo(() => {
    const query = search.trim();

    return [...activities]
      .filter((item) => {
        const matchesType =
          selectedType === "ALL" || item.type === selectedType;

        const matchesAction =
          selectedAction === "ALL" || item.action === selectedAction;

        const matchesQuery =
          !query ||
          includesSearch(item.title, query) ||
          includesSearch(item.description, query) ||
          includesSearch(item.type, query) ||
          includesSearch(item.action, query) ||
          includesSearch(item.actor?.username, query) ||
          includesSearch(item.repository?.name, query) ||
          includesSearch(item.repository?.fullName, query);

        return matchesType && matchesAction && matchesQuery;
      })
      .sort((a, b) => {
        const aTime = a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;

        const bTime = b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;

        return bTime - aTime;
      });
  }, [activities, search, selectedType, selectedAction]);

  function clearFilters() {
    setSearch("");
    setSelectedType("ALL");
    setSelectedAction("ALL");
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminPageHeader
          title="Admin Activity"
          description="Platform-wide audit trail covering administrator actions, repository events, engineering activity, and architecture changes."
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCcw
                className={`mr-2 h-4 w-4 ${
                  isRefetching ? "animate-spin" : ""
                }`}
              />

              {isRefetching ? "Refreshing..." : "Refresh Activity"}
            </Button>
          }
        />

        {!isLoading && !isError && (
          <AdminActivityFilters
            search={search}
            onSearchChange={setSearch}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedAction={selectedAction}
            onActionChange={setSelectedAction}
            types={activityTypes}
            actions={activityActions}
            resultCount={filteredActivities.length}
            totalCount={activities.length}
            onClear={clearFilters}
          />
        )}

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-40 rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <AdminQueryError
            error={error}
            title="Failed to load admin activity"
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && activities.length === 0 && (
          <AdminStateCard
            title="No admin activity found"
            description="No administrator or platform activity has been recorded yet."
          />
        )}

        {!isLoading &&
          !isError &&
          activities.length > 0 &&
          filteredActivities.length === 0 && (
            <AdminStateCard
              title="No matching activity"
              description="No activity records match the current search and filters."
            />
          )}

        {!isLoading &&
          !isError &&
          filteredActivities.length > 0 && (
            <AdminActivityTimeline activities={filteredActivities} />
          )}
      </div>
    </AppShell>
  );
}
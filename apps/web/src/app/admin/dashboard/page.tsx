"use client";

import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Database,
    FileText,
    GitBranch,
    History,
    Layers3,
    RefreshCcw,
    Users,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStateCard } from "@/components/admin/AdminStateCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDashboard } from "@/hooks/useAdmin";

import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { isAdminForbidden } from "@/lib/admin-errors";

export default function AdminDashboardPage() {
    const { data, isLoading, isError, error, refetch } = useAdminDashboard();

    return (
        <AppShell>
            <div className="space-y-6">
                <AdminPageHeader
                    title="Admin Operations Dashboard"
                    description="Operational overview of ArcHive users, repositories, engineering intelligence, event processing, and system activity."
                />

                {isLoading && (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 12 }).map((_, index) => (
                            <Skeleton key={index} className="h-36 rounded-xl" />
                        ))}
                    </div>
                )}

                {isError && isAdminForbidden(error) && <AdminAccessRequired />}

                {isError && !isAdminForbidden(error) && (
                    <AdminStateCard
                        title="Failed to load admin dashboard"
                        description={
                            error instanceof Error
                                ? error.message
                                : "Please check the backend connection."
                        }
                        onRetry={() => refetch()}
                    />
                )}

                {!isLoading && !isError && data && (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                            <AdminStatCard label="Total Users" value={data.totalUsers} icon={Users} />
                            <AdminStatCard label="Total Repositories" value={data.totalRepositories} icon={Database} />
                            <AdminStatCard label="Tracked Repositories" value={data.trackedRepositories} icon={GitBranch} />
                            <AdminStatCard label="Engineering Reports" value={data.engineeringReports} icon={FileText} />
                            <AdminStatCard label="Architecture Changes" value={data.architectureChanges} icon={Layers3} />
                            <AdminStatCard label="Timeline Entries" value={data.timelineEntries} icon={History} />
                            <AdminStatCard label="Engineering Recommendations" value={data.engineeringRecommendations} icon={Activity} />
                            <AdminStatCard label="Imported Today" value={data.repositoriesImportedToday} icon={Clock} />
                            <AdminStatCard label="Reprocessed Today" value={data.repositoriesReprocessedToday} icon={RefreshCcw} />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <AdminStatCard
                                label="Completed Event Processing"
                                value={data.eventProcessing?.completed ?? 0}
                                description="Successfully processed engineering events."
                                icon={CheckCircle2}
                            />

                            <AdminStatCard
                                label="Failed Event Processing"
                                value={data.eventProcessing?.failed ?? 0}
                                description="Engineering events that failed processing."
                                icon={AlertTriangle}
                            />
                        </div>
                    </>
                )}
            </div>
        </AppShell>
    );
}
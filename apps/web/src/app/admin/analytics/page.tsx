"use client";

import { AppShell } from "@/components/layout/AppShell";
import { AdminAnalyticsChartCard } from "@/components/admin/AdminAnalyticsChartCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminQueryError } from "@/components/admin/AdminQueryError";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAnalytics } from "@/hooks/useAdmin";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { isAdminForbidden } from "@/lib/admin-errors";

export default function AdminAnalyticsPage() {
    const { data, isLoading, isError, error, refetch } = useAdminAnalytics();

    return (
        <AppShell>
            <div className="space-y-6">
                <AdminPageHeader
                    title="Engineering Analytics"
                    description="Portfolio-wide repository classifications, languages, technologies, architecture domains, and engineering profiles."
                />

                {isLoading && (
                    <div className="grid gap-6 xl:grid-cols-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton key={index} className="h-96 rounded-xl" />
                        ))}
                    </div>
                )}

                {isError && isAdminForbidden(error) && <AdminAccessRequired />}

                {isError && (
                    <AdminQueryError
                        error={error}
                        title="Failed to load admin analytics"
                        onRetry={() => refetch()}
                    />
                )}

                {!isLoading && !isError && data && (
                    <div className="grid min-w-0 gap-6 xl:grid-cols-2">
                        <AdminAnalyticsChartCard
                            title="Repository Types"
                            description="Most common repository classifications across ArcHive."
                            data={data.repositoryTypes}
                        />

                        <AdminAnalyticsChartCard
                            title="Languages"
                            description="Primary repository languages across the platform."
                            data={data.languages}
                            humanizeLabels={false}
                        />

                        <AdminAnalyticsChartCard
                            title="Architecture Domains"
                            description="Most frequently detected architecture domains."
                            data={data.architectureDomains}
                        />

                        <AdminAnalyticsChartCard
                            title="Technologies"
                            description="Technology adoption across imported repositories."
                            data={data.technologies}
                            humanizeLabels={false}
                        />

                        <AdminAnalyticsChartCard
                            title="Engineering Profiles"
                            description="Engineering DNA profiles detected across repositories."
                            data={data.engineeringProfiles}
                        />
                    </div>
                )}
            </div>
        </AppShell>
    );
}
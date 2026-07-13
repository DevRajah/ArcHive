"use client";

import {
  BarChart3,
  Boxes,
  Code2,
  Layers3,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { AdminAnalyticsChartCard } from "@/components/admin/AdminAnalyticsChartCard";
import { AdminAnalyticsSummaryCard } from "@/components/admin/AdminAnalyticsSummaryCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminQueryError } from "@/components/admin/AdminQueryError";
import { AdminStateCard } from "@/components/admin/AdminStateCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useAdminAnalytics } from "@/hooks/useAdmin";
import { AdminAnalyticsDatum } from "@/types/admin.types";
import { formatIntelligenceLabel } from "@/lib/intelligence-labels";

function getTotal(items?: AdminAnalyticsDatum[]) {
  return (items ?? []).reduce(
    (total, item) => total + item.value,
    0
  );
}

function getTopItem(items?: AdminAnalyticsDatum[]) {
  if (!items || items.length === 0) return null;

  return [...items].sort(
    (a, b) => b.value - a.value
  )[0];
}

export default function AdminAnalyticsPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    dataUpdatedAt,
  } = useAdminAnalytics();

  const topRepositoryType = getTopItem(data?.repositoryTypes);
  const topLanguage = getTopItem(data?.languages);
  const topArchitectureDomain = getTopItem(
    data?.architectureDomains
  );
  const topTechnology = getTopItem(data?.technologies);

  const hasData =
    Boolean(data?.repositoryTypes.length) ||
    Boolean(data?.languages.length) ||
    Boolean(data?.architectureDomains.length) ||
    Boolean(data?.technologies.length) ||
    Boolean(data?.engineeringProfiles.length);

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminPageHeader
          title="Engineering Analytics"
          description="Portfolio-wide repository classifications, languages, technologies, architecture domains, and engineering profiles."
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

              {isRefetching
                ? "Refreshing..."
                : "Refresh Analytics"}
            </Button>
          }
        />

        {!isLoading && dataUpdatedAt > 0 && (
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Last updated:{" "}
              <span className="font-medium text-foreground">
                {new Date(dataUpdatedAt).toLocaleTimeString()}
              </span>
              . Analytics automatically refresh every 60 seconds.
            </p>
          </div>
        )}

        {isLoading && (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-32 rounded-xl"
                />
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-96 rounded-xl"
                />
              ))}
            </div>
          </>
        )}

        {isError && (
          <AdminQueryError
            error={error}
            title="Failed to load admin analytics"
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && !hasData && (
          <AdminStateCard
            title="No analytics available"
            description="ArcHive has not generated enough repository intelligence to populate platform analytics yet."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && data && hasData && (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <AdminAnalyticsSummaryCard
                label="Repository Classifications"
                value={getTotal(data.repositoryTypes)}
                description={
                  topRepositoryType
                    ? `Most common: ${formatIntelligenceLabel(
                        topRepositoryType.name
                      )}`
                    : "No repository classifications detected."
                }
                icon={Boxes}
              />

              <AdminAnalyticsSummaryCard
                label="Language Records"
                value={getTotal(data.languages)}
                description={
                  topLanguage
                    ? `Most common: ${topLanguage.name}`
                    : "No language data detected."
                }
                icon={Code2}
              />

              <AdminAnalyticsSummaryCard
                label="Architecture Signals"
                value={getTotal(data.architectureDomains)}
                description={
                  topArchitectureDomain
                    ? `Most common: ${formatIntelligenceLabel(
                        topArchitectureDomain.name
                      )}`
                    : "No architecture domains detected."
                }
                icon={Layers3}
              />

              <AdminAnalyticsSummaryCard
                label="Technology Signals"
                value={getTotal(data.technologies)}
                description={
                  topTechnology
                    ? `Most common: ${topTechnology.name}`
                    : "No technologies detected."
                }
                icon={Sparkles}
              />
            </div>

            <div className="grid min-w-0 gap-6 xl:grid-cols-2">
              <AdminAnalyticsChartCard
                title="Repository Types"
                description="Most common backend-ranked repository classifications."
                data={data.repositoryTypes}
                chartType="donut"
              />

              <AdminAnalyticsChartCard
                title="Languages"
                description="Primary languages used across imported repositories."
                data={data.languages}
                humanizeLabels={false}
                chartType="bar"
              />

              <AdminAnalyticsChartCard
                title="Architecture Domains"
                description="Architecture domains detected across platform repositories."
                data={data.architectureDomains}
                chartType="bar"
              />

              <AdminAnalyticsChartCard
                title="Technologies"
                description="Most frequently detected technologies and infrastructure."
                data={data.technologies}
                humanizeLabels={false}
                chartType="bar"
              />

              <AdminAnalyticsChartCard
                title="Engineering Profiles"
                description="Engineering DNA profiles generated by repository analysis."
                data={data.engineeringProfiles}
                chartType="donut"
              />

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />

                  <h2 className="text-lg font-semibold">
                    Analytics Notes
                  </h2>
                </div>

                <div className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
                  <p>
                    Repository type and engineering-profile labels are
                    formatted for display, while the original API values
                    remain unchanged.
                  </p>

                  <p>
                    Charts show the ten highest-frequency values to keep
                    the dashboard readable on desktop and mobile.
                  </p>

                  <p>
                    Reprocessing or deleting repositories may change these
                    distributions after the next refresh.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
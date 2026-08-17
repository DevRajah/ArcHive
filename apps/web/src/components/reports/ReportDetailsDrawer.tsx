"use client";

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CalendarDays,
  CheckCircle2,
  Code2,
  FileBarChart2,
  GitBranch,
  History,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";

import type {
  NormalizedExecutiveReport,
  ReportTrendDirection,
  RepositoryHighlight,
  TechnologyInsight,
} from "@/types/report.types";

import type {
  ReportListItem,
} from "@/types/report.types";

interface ReportDetailsDrawerProps {
  report: NormalizedExecutiveReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  helper?: string;
}

interface RiskCardProps {
  label: string;
  value: number | null | undefined;
  dotClassName: string;
}

interface RepositoryHighlightCardProps {
  repository: RepositoryHighlight;
  variant: "strong" | "attention";
}

function formatDate(
  value: string | null | undefined,
) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatNumber(
  value: number | null | undefined,
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "0";
  }

  return new Intl.NumberFormat(
    "en-GB",
  ).format(value);
}

function formatScore(
  value: number | null | undefined,
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "N/A";
  }

  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(1);
}

function normaliseProgressValue(
  value: number | null | undefined,
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.min(
    Math.max(value, 0),
    100,
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  helper,
}: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {label}
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight">
              {value}
            </p>

            {helper ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {helper}
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border bg-muted/40 p-2.5">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RiskCard({
  label,
  value,
  dotClassName,
}: RiskCardProps) {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          {label}
        </span>

        <span
          className={`h-2.5 w-2.5 rounded-full ${dotClassName}`}
        />
      </div>

      <p className="mt-3 text-2xl font-bold">
        {formatNumber(value)}
      </p>
    </div>
  );
}

function getTrendDetails(
  direction: ReportTrendDirection,
) {
  switch (direction) {
    case "IMPROVING":
      return {
        label: "Improving",
        icon: ArrowUpRight,
        className:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      };

    case "DECLINING":
      return {
        label: "Declining",
        icon: ArrowDownRight,
        className:
          "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
      };

    case "STABLE":
      return {
        label: "Stable",
        icon: ArrowRight,
        className:
          "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
      };

    case "UNKNOWN":
    default:
      return {
        label: "Unknown",
        icon: Activity,
        className:
          "border-border bg-muted text-muted-foreground",
      };
  }
}

function RepositoryHighlightCard({
  repository,
  variant,
}: RepositoryHighlightCardProps) {
  const isStrong = variant === "strong";

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {isStrong ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
              )}

              <h4 className="truncate font-semibold">
                {repository.name}
              </h4>
            </div>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {isStrong
                ? "This repository is one of the strongest performers in the current organization snapshot."
                : "This repository has been identified as requiring additional engineering attention."}
            </p>
          </div>

          <Badge variant="outline">
            {formatScore(repository.score)}
          </Badge>
        </div>

        {repository.riskLevel ? (
          <div className="mt-4">
            <Badge
              variant="secondary"
              className="capitalize"
            >
              {repository.riskLevel.toLowerCase()} risk
            </Badge>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ReportNotReady({
  report,
}: {
  report: NormalizedExecutiveReport;
}) {
  if (report.status === "FAILED") {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex flex-col items-center px-6 py-12 text-center">
          <ShieldAlert className="h-10 w-10 text-destructive" />

          <h3 className="mt-4 text-lg font-semibold">
            Report generation failed
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {report.error ||
              "ArcHive could not complete this report. Generate a new report or try again later."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-500/20 bg-blue-500/5">
      <CardContent className="flex flex-col items-center px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
          <FileBarChart2 className="h-7 w-7 animate-pulse text-blue-500" />
        </div>

        <h3 className="mt-4 text-lg font-semibold">
          Report analytics are being prepared
        </h3>

        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          ArcHive is analysing the organisation&apos;s engineering
          intelligence. This drawer will update when generation completes.
        </p>
      </CardContent>
    </Card>
  );
}

function LegacyReportNotice({
  report,
}: {
  report: NormalizedExecutiveReport;
}) {
  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardContent className="flex flex-col items-center px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
          <History className="h-7 w-7 text-amber-600 dark:text-amber-400" />
        </div>

        <h3 className="mt-4 text-lg font-semibold">
          Legacy Executive Report
        </h3>

        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          This report was generated using Schema Version 1, before
          ArcHive introduced the executive analytics available in later
          Executive Report schemas. Historical reports remain immutable,
          so generate a new report to use the current reporting experience.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Badge variant="outline">
            Schema Version {report.schemaVersion ?? 1}
          </Badge>

          <Badge variant="secondary">
            Historical snapshot
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function UnsupportedReportNotice({
  report,
}: {
  report: NormalizedExecutiveReport;
}) {
  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardContent className="flex flex-col items-center px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
          <AlertTriangle className="h-7 w-7 text-amber-600 dark:text-amber-400" />
        </div>

        <h3 className="mt-4 text-lg font-semibold">
          Unsupported Executive Report Version
        </h3>

        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          This report was generated using Schema Version{" "}
          {report.schemaVersion ?? "unknown"}, which this version of
          ArcHive does not understand yet.
        </p>

        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          The report has not been treated as legacy or converted into an
          older schema. Update ArcHive to a version that supports this
          report contract before rendering its analytics.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {report.schemaVersion !== null ? (
            <Badge variant="outline">
              Schema Version {report.schemaVersion}
            </Badge>
          ) : null}

          <Badge variant="secondary">
            Unsupported schema
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReportDetailsDrawer({
  report,
  open,
  onOpenChange,
}: ReportDetailsDrawerProps) {
  if (!report) {
    return null;
  }

  const analytics = report.analytics;

  const strongestRepositories =
    analytics?.repositoryHighlights.strongest ?? [];

  const repositoriesRequiringAttention =
    analytics?.repositoryHighlights.needsAttention ?? [];

  /*
   * Keep the technology collection explicitly typed.
   *
   * Future me:
   * Do not rely on workspace/build-environment inference here. Vercel
   * performs a clean TypeScript build and must be able to determine the
   * callback element type without depending on previously built artifacts.
   */
  const topTechnologies: TechnologyInsight[] =
    analytics?.technologyAnalysis.topTechnologies ?? [];

  const generatedDate =
    report.generatedAt || report.createdAt;

  const maximumTechnologyUsage = Math.max(
    ...topTechnologies.map(
      (technology) => technology.usageCount,
    ),
    1,
  );

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent className="w-full p-0 sm:max-w-2xl lg:max-w-4xl">
        <ScrollArea className="h-screen">
          <div className="px-6 py-6 sm:px-8">
            <SheetHeader className="text-left">
              <div className="flex flex-wrap items-center gap-2">
                <ReportStatusBadge status={report.status} />

                <Badge variant="outline">
                  Executive Report
                </Badge>

                {report.schemaVersion ? (
                  <Badge variant="secondary">
                    Schema v{report.schemaVersion}
                  </Badge>
                ) : null}
              </div>

              <SheetTitle className="pt-2 text-2xl">
                {report.title}
              </SheetTitle>

              <SheetDescription className="max-w-2xl leading-6">
                {report.description ||
                  "Leadership-ready engineering intelligence generated by ArcHive."}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {formatDate(generatedDate)}
              </div>

              <div className="flex items-center gap-2">
                <FileBarChart2 className="h-4 w-4" />
                Report ID: {report.id.slice(0, 8)}
              </div>
            </div>

            <Separator className="my-7" />

            {report.compatibility === "LEGACY" ? (
              <LegacyReportNotice report={report} />
            ) : report.compatibility === "UNSUPPORTED" ? (
              <UnsupportedReportNotice report={report} />
            ) : !analytics ? (
              <ReportNotReady report={report} />
            ) : (
              <div className="space-y-10 pb-10">
                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-muted-foreground" />

                    <h2 className="text-xl font-semibold">
                      Executive Summary
                    </h2>
                  </div>

                  <Card>
                    <CardContent className="space-y-6 p-6">
                      {analytics.executiveSummary.headline ? (
                        <div>
                          <p className="text-lg font-semibold leading-7">
                            {analytics.executiveSummary.headline}
                          </p>
                        </div>
                      ) : null}

                      {analytics.executiveSummary.overallHealth ? (
                        <p className="leading-7 text-muted-foreground">
                          {analytics.executiveSummary.overallHealth}
                        </p>
                      ) : null}

                      {analytics.executiveSummary.strengths.length > 0 ? (
                        <div>
                          <div className="mb-3 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />

                            <h3 className="font-semibold">
                              Strengths
                            </h3>
                          </div>

                          <ul className="space-y-2">
                            {analytics.executiveSummary.strengths.map(
                              (strength, index) => (
                                <li
                                  key={`${report.id}-strength-${index}`}
                                  className="flex gap-3 text-sm leading-6 text-muted-foreground"
                                >
                                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                  {strength}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      ) : null}

                      {analytics.executiveSummary.concerns.length > 0 ? (
                        <div>
                          <div className="mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />

                            <h3 className="font-semibold">
                              Concerns
                            </h3>
                          </div>

                          <ul className="space-y-2">
                            {analytics.executiveSummary.concerns.map(
                              (concern, index) => (
                                <li
                                  key={`${report.id}-concern-${index}`}
                                  className="flex gap-3 text-sm leading-6 text-muted-foreground"
                                >
                                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                                  {concern}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      ) : null}

                      {analytics.executiveSummary.recommendations.length >
                        0 ? (
                        <div>
                          <div className="mb-3 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-primary" />

                            <h3 className="font-semibold">
                              Executive Recommendations
                            </h3>
                          </div>

                          <ul className="space-y-2">
                            {analytics.executiveSummary.recommendations.map(
                              (recommendation, index) => (
                                <li
                                  key={`${report.id}-recommendation-${index}`}
                                  className="flex gap-3 text-sm leading-6 text-muted-foreground"
                                >
                                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                  {recommendation}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      ) : null}

                      {!analytics.executiveSummary.headline &&
                        !analytics.executiveSummary.overallHealth &&
                        analytics.executiveSummary.strengths.length === 0 &&
                        analytics.executiveSummary.concerns.length === 0 &&
                        analytics.executiveSummary.recommendations.length ===
                        0 ? (
                        <p className="text-sm text-muted-foreground">
                          No executive summary was stored for this report.
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                </section>

                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />

                    <h2 className="text-xl font-semibold">
                      Executive KPIs
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <KpiCard
                      label="Repositories"
                      value={formatNumber(
                        analytics.executiveKpis.repositories,
                      )}
                      icon={GitBranch}
                    />

                    <KpiCard
                      label="Average Architecture Score"
                      value={formatScore(
                        analytics.executiveKpis
                          .averageArchitectureScore,
                      )}
                      helper="Across analysed repositories"
                      icon={Boxes}
                    />

                    <KpiCard
                      label="Engineering Events"
                      value={formatNumber(
                        analytics.executiveKpis.engineeringEvents,
                      )}
                      icon={Activity}
                    />

                    <KpiCard
                      label="Recommendations"
                      value={formatNumber(
                        analytics.executiveKpis.recommendations,
                      )}
                      icon={Lightbulb}
                    />

                    <KpiCard
                      label="Technologies"
                      value={formatNumber(
                        analytics.executiveKpis.technologies,
                      )}
                      icon={Code2}
                    />

                    <KpiCard
                      label="High Risk Repositories"
                      value={formatNumber(
                        analytics.executiveKpis
                          .highRiskRepositories,
                      )}
                      icon={ShieldAlert}
                    />
                  </div>
                </section>

                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-muted-foreground" />

                    <h2 className="text-xl font-semibold">
                      Risk Breakdown
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <RiskCard
                      label="Critical"
                      value={analytics.riskBreakdown.critical}
                      dotClassName="bg-red-600"
                    />

                    <RiskCard
                      label="High"
                      value={analytics.riskBreakdown.high}
                      dotClassName="bg-orange-500"
                    />

                    <RiskCard
                      label="Medium"
                      value={analytics.riskBreakdown.medium}
                      dotClassName="bg-amber-500"
                    />

                    <RiskCard
                      label="Low"
                      value={analytics.riskBreakdown.low}
                      dotClassName="bg-emerald-500"
                    />

                    <RiskCard
                      label="Unknown"
                      value={analytics.riskBreakdown.unknown}
                      dotClassName="bg-slate-400"
                    />

                    <RiskCard
                      label="Total Risks"
                      value={analytics.riskBreakdown.total}
                      dotClassName="bg-primary"
                    />
                  </div>

                  {analytics.riskBreakdown.highestSeverity ? (
                    <div className="mt-4 rounded-xl border bg-muted/20 p-4">
                      <p className="text-sm text-muted-foreground">
                        Highest severity
                      </p>

                      <Badge
                        variant="destructive"
                        className="mt-2"
                      >
                        {analytics.riskBreakdown.highestSeverity}
                      </Badge>
                    </div>
                  ) : null}
                </section>

                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-muted-foreground" />

                    <h2 className="text-xl font-semibold">
                      Technology Analysis
                    </h2>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Technology Overview
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-5">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Dominant technology
                          </p>

                          <p className="mt-1 text-xl font-semibold">
                            {analytics.technologyAnalysis
                              .dominantTechnology || "Not available"}
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <p className="text-sm text-muted-foreground">
                            Total technologies
                          </p>

                          <p className="mt-1 text-3xl font-bold">
                            {formatNumber(
                              analytics.technologyAnalysis
                                .totalTechnologies,
                            )}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Top Technologies
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-5">
                        {topTechnologies.length > 0 ? (
                          topTechnologies.map((technology) => {
                            const progress =
                              (technology.usageCount /
                                maximumTechnologyUsage) *
                              100;

                            return (
                              <div
                                key={`${technology.name}-${technology.category ?? "uncategorised"}`}
                                className="space-y-2"
                              >
                                <div className="flex items-center justify-between gap-4">
                                  <div>
                                    <span className="font-medium">
                                      {technology.name}
                                    </span>

                                    {technology.category ? (
                                      <p className="mt-0.5 text-xs text-muted-foreground">
                                        {technology.category}
                                      </p>
                                    ) : null}
                                  </div>

                                  <div className="text-right">
                                    <span className="text-sm font-medium">
                                      {formatNumber(
                                        technology.usageCount,
                                      )}
                                    </span>

                                    {technology.percentage !== null ? (
                                      <p className="mt-0.5 text-xs text-muted-foreground">
                                        {formatScore(
                                          technology.percentage,
                                        )}
                                        %
                                      </p>
                                    ) : null}
                                  </div>
                                </div>

                                <Progress
                                  value={normaliseProgressValue(progress)}
                                />
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No technology analysis was stored.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />

                    <h2 className="text-xl font-semibold">
                      Engineering Trend
                    </h2>
                  </div>

                  {(() => {
                    const trend = getTrendDetails(
                      analytics.trendAnalysis.direction,
                    );

                    const TrendIcon = trend.icon;

                    const percentageChange =
                      analytics.trendAnalysis.percentageChange;

                    return (
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Direction
                              </p>

                              <Badge
                                variant="outline"
                                className={`mt-2 ${trend.className}`}
                              >
                                <TrendIcon className="mr-1 h-3.5 w-3.5" />
                                {trend.label}
                              </Badge>
                            </div>

                            <div className="grid flex-1 gap-4 sm:grid-cols-3">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Latest value
                                </p>

                                <p className="mt-1 text-2xl font-bold">
                                  {formatScore(
                                    analytics.trendAnalysis.latestValue,
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Previous value
                                </p>

                                <p className="mt-1 text-2xl font-bold">
                                  {formatScore(
                                    analytics.trendAnalysis.previousValue,
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Percentage change
                                </p>

                                <p className="mt-1 text-2xl font-bold">
                                  {percentageChange !== null &&
                                    percentageChange > 0
                                    ? "+"
                                    : ""}
                                  {formatScore(percentageChange)}
                                  {percentageChange !== null ? "%" : ""}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </section>

                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-muted-foreground" />

                    <h2 className="text-xl font-semibold">
                      Repository Highlights
                    </h2>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-2">
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />

                        <h3 className="font-semibold">
                          Strongest Repositories
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {strongestRepositories.length > 0 ? (
                          strongestRepositories.map(
                            (repository, index) => (
                              <RepositoryHighlightCard
                                key={
                                  repository.repositoryId ??
                                  `${repository.name}-strong-${index}`
                                }
                                repository={repository}
                                variant="strong"
                              />
                            ),
                          )
                        ) : (
                          <Card>
                            <CardContent className="p-5 text-sm text-muted-foreground">
                              No strongest repositories were stored.
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />

                        <h3 className="font-semibold">
                          Repositories Requiring Attention
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {repositoriesRequiringAttention.length > 0 ? (
                          repositoriesRequiringAttention.map(
                            (repository, index) => (
                              <RepositoryHighlightCard
                                key={
                                  repository.repositoryId ??
                                  `${repository.name}-attention-${index}`
                                }
                                repository={repository}
                                variant="attention"
                              />
                            ),
                          )
                        ) : (
                          <Card>
                            <CardContent className="p-5 text-sm text-muted-foreground">
                              No repositories currently require attention.
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
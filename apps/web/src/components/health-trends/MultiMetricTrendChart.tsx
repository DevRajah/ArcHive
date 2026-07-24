"use client";

import { useMemo, useState } from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Award,
  Blocks,
  Code2,
  Gauge,
  Layers3,
  Rocket,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  formatCompactHealthDate,
  getSnapshotDate,
  normalizeHealthScore,
} from "@/utils/repository-health-trends";

import type {
  RepositoryHealthMetricKey,
  RepositoryHealthSnapshot,
} from "@/types/repository-health-trends.types";
import type { LucideIcon } from "lucide-react";

interface MultiMetricTrendChartProps {
  history: RepositoryHealthSnapshot[];
}

interface MetricOption {
  key: RepositoryHealthMetricKey;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  snapshotField: keyof RepositoryHealthSnapshot;
  inverse?: boolean;
}

const metricOptions: MetricOption[] = [
  {
    key: "overallHealth",
    label: "Overall Health",
    shortLabel: "Health",
    icon: Activity,
    snapshotField: "health",
  },
  {
    key: "architecture",
    label: "Architecture",
    shortLabel: "Architecture",
    icon: Layers3,
    snapshotField: "architecture",
  },
  {
    key: "engineeringQuality",
    label: "Engineering Quality",
    shortLabel: "Quality",
    icon: Code2,
    snapshotField: "engineeringQuality",
  },
  {
    key: "productionReadiness",
    label: "Production Readiness",
    shortLabel: "Readiness",
    icon: Rocket,
    snapshotField: "productionReadiness",
  },
  {
    key: "capability",
    label: "Capability",
    shortLabel: "Capability",
    icon: Blocks,
    snapshotField: "capability",
  },
  {
    key: "maturity",
    label: "Maturity",
    shortLabel: "Maturity",
    icon: Award,
    snapshotField: "maturity",
  },
  {
    key: "confidence",
    label: "Confidence",
    shortLabel: "Confidence",
    icon: Gauge,
    snapshotField: "confidence",
  },
  {
    key: "risk",
    label: "Risk",
    shortLabel: "Risk",
    icon: ShieldAlert,
    snapshotField: "risk",
    inverse: true,
  },
];

export function MultiMetricTrendChart({
  history,
}: MultiMetricTrendChartProps) {
  const [activeMetric, setActiveMetric] =
    useState<RepositoryHealthMetricKey>(
      "overallHealth",
    );

  const selectedMetric =
    metricOptions.find(
      (metric) => metric.key === activeMetric,
    ) ?? metricOptions[0];

  const chartData = useMemo(
    () =>
      [...history]
        .sort(
          (first, second) =>
            new Date(getSnapshotDate(first)).getTime() -
            new Date(getSnapshotDate(second)).getTime(),
        )
        .map((snapshot, index) => {
          const rawValue =
            snapshot[selectedMetric.snapshotField];

          return {
            index: index + 1,
            displayDate: formatCompactHealthDate(
              getSnapshotDate(snapshot),
            ),
            value:
              typeof rawValue === "number"
                ? normalizeHealthScore(rawValue)
                : 0,
          };
        }),
    [history, selectedMetric.snapshotField],
  );


  const SelectedIcon = selectedMetric.icon;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div>
          <div className="flex items-center gap-2">
            <SelectedIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">
              Multi-Metric Trend Explorer
            </h3>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Switch between engineering metrics to understand which areas are
            improving, stable, or losing health.
          </p>
        </div>

        <div className="flex max-w-full flex-wrap gap-2">
          {metricOptions.map((metric) => {
            const Icon = metric.icon;
            const isActive =
              metric.key === activeMetric;

            return (
              <Button
                key={metric.key}
                type="button"
                size="sm"
                variant={
                  isActive ? "default" : "outline"
                }
                onClick={() =>
                  setActiveMetric(metric.key)
                }
                className="h-9"
              >
                <Icon className="mr-1.5 h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {metric.label}
                </span>
                <span className="sm:hidden">
                  {metric.shortLabel}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {chartData.length < 2 ? (
        <div className="mt-6 grid min-h-72 place-items-center rounded-xl border border-dashed border-border p-8 text-center">
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            More historical snapshots are required before the selected metric
            can be compared over time.
          </p>
        </div>
      ) : (
        <div className="mt-6 h-[340px] w-full sm:h-[390px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 12, left: -12, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />

              <XAxis
                dataKey="displayDate"
                minTickGap={36}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 12,
                }}
              />

              <YAxis
                domain={[0, 100]}
                width={42}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 12,
                }}
              />

              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "var(--primary)",
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 3,
                  fill: "var(--background)",
                  stroke: "var(--primary)",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-border bg-background/70 p-4">
        <p className="text-sm font-semibold">
          {selectedMetric.label}
        </p>

        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {selectedMetric.inverse
            ? "Lower risk scores indicate a healthier repository. A downward movement is therefore positive."
            : "Higher scores indicate stronger repository health for this engineering metric."}
        </p>
      </div>
    </div>
  );
}

function MetricTrendTooltip({
  active,
  payload,
  label,
  inverse = false,
}: {
  active?: boolean;
  payload?: Array<{
    payload: {
      displayDate: string;
      value: number;
      index: number;
    };
  }>;
  label: string;
  inverse?: boolean;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-xl">
      <p className="text-xs font-medium text-muted-foreground">
        Snapshot {point.index}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {point.displayDate}
      </p>

      <p className="mt-2 text-sm">
        {label}:{" "}
        <span className="font-bold">
          {point.value}/100
        </span>
      </p>

      {inverse && (
        <p className="mt-1 text-xs text-muted-foreground">
          Lower is healthier.
        </p>
      )}
    </div>
  );
}

"use client";

import { useMemo } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Gauge,
  Medal,
  Minus,
  TrendingUp,
} from "lucide-react";

import { normalizeHealthScore } from "@/utils/repository-health-trends";

import type {
  RepositoryHealthMetricKey,
  RepositoryHealthSnapshot,
} from "@/types/repository-health-trends.types";
import type { LucideIcon } from "lucide-react";

interface HealthTrendSummaryProps {
  history: RepositoryHealthSnapshot[];
}

interface MetricDefinition {
  key: RepositoryHealthMetricKey;
  label: string;
  field: keyof RepositoryHealthSnapshot;
  inverse?: boolean;
}

const metricDefinitions: MetricDefinition[] = [
  { key: "overallHealth", label: "Overall Health", field: "health" },
  { key: "architecture", label: "Architecture", field: "architecture" },
  { key: "engineeringQuality", label: "Engineering Quality", field: "engineeringQuality" },
  { key: "productionReadiness", label: "Production Readiness", field: "productionReadiness" },
  { key: "capability", label: "Capability", field: "capability" },
  { key: "maturity", label: "Maturity", field: "maturity" },
  { key: "confidence", label: "Confidence", field: "confidence" },
  { key: "risk", label: "Risk", field: "risk", inverse: true },
];

export function HealthTrendSummary({
  history,
}: HealthTrendSummaryProps) {
  const summary = useMemo(
    () => calculateTrendSummary(history),
    [history],
  );

  if (!summary) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <SummaryCard
        icon={Gauge}
        label="Average Health"
        value={`${summary.averageHealth}/100`}
        description="Average overall health across all snapshots."
      />

      <SummaryCard
        icon={Medal}
        label="Best Snapshot"
        value={`${summary.bestHealth}/100`}
        description="The strongest overall health score recorded."
      />

      <SummaryCard
        icon={BarChart3}
        label="Lowest Snapshot"
        value={`${summary.worstHealth}/100`}
        description="The weakest overall health score recorded."
      />

      <SummaryCard
        icon={ArrowUpRight}
        label="Largest Improvement"
        value={summary.largestImprovement.label}
        description={`${formatSignedValue(
          summary.largestImprovement.delta,
        )} point movement.`}
      />

      <SummaryCard
        icon={ArrowDownRight}
        label="Largest Regression"
        value={summary.largestRegression.label}
        description={`${formatSignedValue(
          summary.largestRegression.delta,
        )} point movement.`}
      />

      <SummaryCard
        icon={Minus}
        label="Most Stable Metric"
        value={summary.mostStable.label}
        description={`${summary.mostStable.range} point total range across snapshots.`}
      />

      <SummaryCard
        icon={TrendingUp}
        label="Overall Improvement"
        value={formatSignedValue(
          summary.overallImprovement,
        )}
        description="Difference between the first and latest overall health score."
      />

      <SummaryCard
        icon={BarChart3}
        label="Total Snapshots"
        value={String(history.length)}
        description="Health snapshots currently available for trend analysis."
      />

      <SummaryCard
        icon={Gauge}
        label="Trend Consistency"
        value={`${summary.consistency}%`}
        description="How consistently overall health moved in its dominant direction."
      />
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>

      <p className="mt-4 text-sm font-medium text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 break-words text-2xl font-bold tracking-tight">
        {value}
      </p>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </article>
  );
}

function calculateTrendSummary(
  history: RepositoryHealthSnapshot[],
) {
  if (history.length === 0) {
    return null;
  }

  const metricMovements = metricDefinitions.map(
    (metric) => {
      const values = history.map((snapshot) => {
        const raw = snapshot[metric.field];

        return typeof raw === "number"
          ? normalizeHealthScore(raw)
          : 0;
      });

      const first = values[0] ?? 0;
      const latest =
        values[values.length - 1] ?? 0;

      const rawDelta = latest - first;

      return {
        label: metric.label,
        delta: metric.inverse
          ? rawDelta * -1
          : rawDelta,
        range:
          Math.max(...values) -
          Math.min(...values),
      };
    },
  );

 const healthValues = history.map((snapshot) =>
  normalizeHealthScore(snapshot.health),
);

  const averageHealth = Math.round(
    healthValues.reduce(
      (total, score) => total + score,
      0,
    ) / healthValues.length,
  );

  const stepMovements = healthValues
    .slice(1)
    .map(
      (score, index) =>
        Math.sign(
          score - healthValues[index],
        ),
    );

  const improvingSteps = stepMovements.filter(
    (movement) => movement > 0,
  ).length;

  const decliningSteps = stepMovements.filter(
    (movement) => movement < 0,
  ).length;

  const dominantCount = Math.max(
    improvingSteps,
    decliningSteps,
  );

  const consistency =
    stepMovements.length === 0
      ? 100
      : Math.round(
          (dominantCount /
            stepMovements.length) *
            100,
        );

  return {
    averageHealth,
    bestHealth: Math.max(...healthValues),
    worstHealth: Math.min(...healthValues),
    overallImprovement:
      (healthValues[healthValues.length - 1] ??
        0) - (healthValues[0] ?? 0),
    largestImprovement: [...metricMovements].sort(
      (first, second) =>
        second.delta - first.delta,
    )[0],
    largestRegression: [...metricMovements].sort(
      (first, second) =>
        first.delta - second.delta,
    )[0],
    mostStable: [...metricMovements].sort(
      (first, second) =>
        first.range - second.range,
    )[0],
    consistency,
  };
}

function formatSignedValue(value: number) {
  return `${value > 0 ? "+" : ""}${value}`;
}

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

import {
  normalizeHealthScore,
} from "@/utils/repository-health-trends";

import type {
  RepositoryHealthMetricKey,
  RepositoryHealthSnapshot,
} from "@/types/repository-health-trends.types";

import type {
  LucideIcon,
} from "lucide-react";

interface HealthTrendSummaryProps {
  history: RepositoryHealthSnapshot[];
}

interface MetricDefinition {
  key: RepositoryHealthMetricKey;
  label: string;
  field: keyof RepositoryHealthSnapshot;
  inverse?: boolean;
}

interface MetricMovement {
  label: string;
  delta: number;
  range: number;
}

const metricDefinitions: MetricDefinition[] = [
  {
    key: "overallHealth",
    label: "Overall Health",
    field: "health",
  },
  {
    key: "architecture",
    label: "Architecture",
    field: "architecture",
  },
  {
    key: "engineeringQuality",
    label: "Engineering Quality",
    field: "engineeringQuality",
  },
  {
    key: "productionReadiness",
    label: "Production Readiness",
    field: "productionReadiness",
  },
  {
    key: "capability",
    label: "Capability",
    field: "capability",
  },
  {
    key: "maturity",
    label: "Maturity",
    field: "maturity",
  },
  {
    key: "confidence",
    label: "Confidence",
    field: "confidence",
  },
  {
    key: "risk",
    label: "Risk",
    field: "risk",
    inverse: true,
  },
];

export function HealthTrendSummary({
  history,
}: HealthTrendSummaryProps) {
  const summary = useMemo(
    () =>
      calculateTrendSummary(
        history,
      ),
    [history],
  );

  if (!summary) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <p className="font-medium">
          Health trend summary not available
        </p>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          ArcHive does not yet have enough
          assessed health data to calculate
          a reliable trend summary.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <SummaryCard
        icon={Gauge}
        label="Average Health"
        value={`${summary.averageHealth}/100`}
        description="Average overall health across snapshots with an available health assessment."
      />

      <SummaryCard
        icon={Medal}
        label="Best Snapshot"
        value={`${summary.bestHealth}/100`}
        description="The strongest available overall health score recorded."
      />

      <SummaryCard
        icon={BarChart3}
        label="Lowest Snapshot"
        value={`${summary.worstHealth}/100`}
        description="The lowest available overall health score recorded."
      />

      <SummaryCard
        icon={ArrowUpRight}
        label="Largest Improvement"
        value={
          summary.largestImprovement
            ?.label ??
          "Not available"
        }
        description={
          summary.largestImprovement
            ? `${formatSignedValue(
                summary
                  .largestImprovement
                  .delta,
              )} point movement.`
            : "At least two assessed values are required to calculate improvement."
        }
      />

      <SummaryCard
        icon={ArrowDownRight}
        label="Largest Regression"
        value={
          summary.largestRegression
            ?.label ??
          "Not available"
        }
        description={
          summary.largestRegression
            ? `${formatSignedValue(
                summary
                  .largestRegression
                  .delta,
              )} point movement.`
            : "At least two assessed values are required to calculate regression."
        }
      />

      <SummaryCard
        icon={Minus}
        label="Most Stable Metric"
        value={
          summary.mostStable
            ?.label ??
          "Not available"
        }
        description={
          summary.mostStable
            ? `${summary.mostStable.range} point total range across available snapshots.`
            : "At least two assessed values are required to calculate stability."
        }
      />

      <SummaryCard
        icon={TrendingUp}
        label="Overall Improvement"
        value={formatSignedValue(
          summary.overallImprovement,
        )}
        description="Difference between the first and latest available overall health score."
      />

      <SummaryCard
        icon={BarChart3}
        label="Assessed Health Snapshots"
        value={String(
          summary.healthSnapshotCount,
        )}
        description={`${history.length} total snapshots exist; only snapshots with available health scores contribute to health calculations.`}
      />

      <SummaryCard
        icon={Gauge}
        label="Trend Consistency"
        value={`${summary.consistency}%`}
        description="How consistently available overall health scores moved in their dominant direction."
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

  /*
   * Only snapshots containing a real health score participate
   * in overall-health calculations.
   *
   * null means unavailable, not zero.
   */
  const healthValues = history
    .map(
      (snapshot) =>
        normalizeHealthScore(
          snapshot.health,
        ),
    )
    .filter(
      (
        value,
      ): value is number =>
        value !== null,
    );

  if (healthValues.length === 0) {
    return null;
  }

  /*
   * Calculate movements independently for every metric.
   *
   * Missing values are removed rather than replaced by zero.
   * This is particularly important for risk and overall health.
   */
  const metricMovements =
    metricDefinitions
      .map(
        (
          metric,
        ): MetricMovement | null => {
          const values = history
            .map((snapshot) => {
              const raw =
                snapshot[
                  metric.field
                ];

              if (
                typeof raw !==
                  "number" ||
                !Number.isFinite(raw)
              ) {
                return null;
              }

              return normalizeHealthScore(
                raw,
              );
            })
            .filter(
              (
                value,
              ): value is number =>
                value !== null,
            );

          /*
           * A movement requires at least two real values.
           */
          if (values.length < 2) {
            return null;
          }

          const first =
            values[0];

          const latest =
            values[
              values.length - 1
            ];

          const rawDelta =
            latest - first;

          return {
            label: metric.label,

            delta: metric.inverse
              ? rawDelta * -1
              : rawDelta,

            range:
              Math.max(
                ...values,
              ) -
              Math.min(
                ...values,
              ),
          };
        },
      )
      .filter(
        (
          movement,
        ): movement is MetricMovement =>
          movement !== null,
      );

  const averageHealth =
    Math.round(
      healthValues.reduce(
        (
          total,
          score,
        ) =>
          total + score,
        0,
      ) /
        healthValues.length,
    );

  const stepMovements =
    healthValues
      .slice(1)
      .map(
        (
          score,
          index,
        ) =>
          Math.sign(
            score -
              healthValues[
                index
              ],
          ),
      );

  const improvingSteps =
    stepMovements.filter(
      (movement) =>
        movement > 0,
    ).length;

  const decliningSteps =
    stepMovements.filter(
      (movement) =>
        movement < 0,
    ).length;

  const dominantCount =
    Math.max(
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

  const sortedImprovement =
    [...metricMovements].sort(
      (
        first,
        second,
      ) =>
        second.delta -
        first.delta,
    );

  const sortedRegression =
    [...metricMovements].sort(
      (
        first,
        second,
      ) =>
        first.delta -
        second.delta,
    );

  const sortedStability =
    [...metricMovements].sort(
      (
        first,
        second,
      ) =>
        first.range -
        second.range,
    );

  const firstHealth =
    healthValues[0];

  const latestHealth =
    healthValues[
      healthValues.length - 1
    ];

  return {
    averageHealth,

    bestHealth:
      Math.max(
        ...healthValues,
      ),

    worstHealth:
      Math.min(
        ...healthValues,
      ),

    overallImprovement:
      latestHealth -
      firstHealth,

    largestImprovement:
      sortedImprovement[0] ??
      null,

    largestRegression:
      sortedRegression[0] ??
      null,

    mostStable:
      sortedStability[0] ??
      null,

    consistency,

    healthSnapshotCount:
      healthValues.length,
  };
}

function formatSignedValue(
  value: number,
) {
  return `${
    value > 0
      ? "+"
      : ""
  }${value}`;
}
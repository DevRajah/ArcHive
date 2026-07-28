"use client";

import {
  Activity,
  BrainCircuit,
  GitBranch,
  Layers3,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import OrganizationEmptyState from "@/components/organization/OrganizationEmptyState";

import type {
  OrganizationTrendPoint,
} from "@/types/organization.types";

interface OrganizationTrendsProps {
  points: OrganizationTrendPoint[];
}

type TrendKey =
  | "averageArchitectureScore"
  | "averageEngineeringQualityScore"
  | "averageProductionReadinessScore"
  | "averageMaturityScore"
  | "averageRiskScore";

const charts: {
  title: string;
  description: string;
  icon: typeof Activity;
  key: TrendKey;
  reverseTrend?: boolean;
}[] = [
  {
    title: "Architecture",
    description:
      "Architecture quality across the organization",
    icon: GitBranch,
    key: "averageArchitectureScore",
  },
  {
    title: "Engineering Quality",
    description:
      "Engineering practices and maintainability",
    icon: BrainCircuit,
    key: "averageEngineeringQualityScore",
  },
  {
    title: "Production Readiness",
    description:
      "Deployment, reliability, and operational readiness",
    icon: ShieldCheck,
    key: "averageProductionReadinessScore",
  },
  {
    title: "Maturity",
    description:
      "Repository maturity across the portfolio",
    icon: Layers3,
    key: "averageMaturityScore",
  },
  {
    title: "Risk",
    description:
      "Average engineering risk across repositories",
    icon: ShieldAlert,
    key: "averageRiskScore",
    reverseTrend: true,
  },
];

function getPointValue(
  point: OrganizationTrendPoint,
  key: TrendKey,
) {
  const value = point[key];

  return typeof value === "number"
    ? value
    : null;
}

function calculateChange(
  points: OrganizationTrendPoint[],
  key: TrendKey,
) {
  if (points.length < 2) {
    return null;
  }

  const firstValue =
    getPointValue(
      points[0],
      key,
    );

  const lastValue =
    getPointValue(
      points[
        points.length - 1
      ],
      key,
    );

  if (
    firstValue === null ||
    lastValue === null
  ) {
    return null;
  }

  return lastValue - firstValue;
}

function formatPeriod(
  value: string,
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
    },
  );
}

export default function OrganizationTrends({
  points,
}: OrganizationTrendsProps) {
  if (!points.length) {
    return (
      <OrganizationEmptyState
        icon={TrendingUp}
        title="No organization trends yet"
        description="Trend charts will appear after ArcHive has collected multiple repository analysis snapshots."
      />
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Organization Trends
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Portfolio-level score movement
            across the selected period.
          </p>
        </div>

        <Badge variant="secondary">
          {points.length} data points
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {charts.map((chart) => {
          const Icon = chart.icon;

          const change =
            calculateChange(
              points,
              chart.key,
            );

          const isPositive =
            change !== null &&
            (chart.reverseTrend
              ? change < 0
              : change > 0);

          const isNegative =
            change !== null &&
            (chart.reverseTrend
              ? change > 0
              : change < 0);

          return (
            <Card
              key={chart.key}
              className="overflow-hidden"
            >
              <CardHeader className="border-b bg-muted/20">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Icon className="h-5 w-5" />
                      {chart.title}
                    </CardTitle>

                    <p className="mt-2 text-xs text-muted-foreground">
                      {
                        chart.description
                      }
                    </p>
                  </div>

                  {change !== null ? (
                    <Badge
                      variant={
                        isNegative
                          ? "destructive"
                          : isPositive
                            ? "default"
                            : "secondary"
                      }
                    >
                      {change > 0
                        ? "+"
                        : ""}
                      {change.toFixed(
                        1,
                      )}
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>

              <CardContent className="p-5">
                <div className="h-72">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart
                      data={points}
                      margin={{
                        top: 10,
                        right: 15,
                        left: -15,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="period"
                        tickFormatter={
                          formatPeriod
                        }
                        tick={{
                          fontSize: 11,
                        }}
                        minTickGap={30}
                      />

                      <YAxis
                        domain={[
                          0,
                          100,
                        ]}
                        tick={{
                          fontSize: 11,
                        }}
                      />

                      <Tooltip
                        labelFormatter={(
                          value,
                        ) =>
                          formatPeriod(
                            String(value),
                          )
                        }
                        formatter={(
                          value,
                        ) => [
                          typeof value ===
                          "number"
                            ? value.toFixed(
                                1,
                              )
                            : value,
                          chart.title,
                        ]}
                      />

                      <Line
                        type="monotone"
                        dataKey={
                          chart.key
                        }
                        strokeWidth={3}
                        dot={{
                          r: 3,
                        }}
                        activeDot={{
                          r: 5,
                        }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
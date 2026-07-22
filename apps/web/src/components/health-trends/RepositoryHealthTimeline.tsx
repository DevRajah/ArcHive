"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, History } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  formatCompactHealthDate,
  getSnapshotDate,
  normalizeHealthScore,
} from "@/utils/repository-health-trends";

import type { RepositoryHealthSnapshot } from "@/types/repository-health-trends.types";

interface RepositoryHealthTimelineProps {
  history: RepositoryHealthSnapshot[];
}

export function RepositoryHealthTimeline({
  history,
}: RepositoryHealthTimelineProps) {
  const chartData = useMemo(
    () =>
      [...history]
        .sort(
          (first, second) =>
            new Date(getSnapshotDate(first)).getTime() -
            new Date(getSnapshotDate(second)).getTime(),
        )
        .map((snapshot, index) => ({
          index: index + 1,
          displayDate: formatCompactHealthDate(
            getSnapshotDate(snapshot),
          ),
          health: normalizeHealthScore(
            snapshot.overallHealthScore,
          ),
        })),
    [history],
  );

  if (chartData.length < 2) {
    return (
      <div className="grid min-h-80 place-items-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <div className="max-w-xl">
          <History className="mx-auto h-10 w-10 text-muted-foreground" />

          <h3 className="mt-4 text-lg font-semibold">
            More historical snapshots are required
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            More historical snapshots are required before trends can be
            generated. Refresh repository health after meaningful engineering
            activity to build this timeline.
          </p>
        </div>
      </div>
    );
  }

  const firstScore = chartData[0]?.health ?? 0;
  const latestScore =
    chartData[chartData.length - 1]?.health ?? 0;
  const delta = latestScore - firstScore;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">
              Health Score Over Time
            </h3>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Follow the repository&apos;s overall engineering health across
            every recorded ArcHive snapshot.
          </p>
        </div>

        <Badge variant="secondary" className="w-fit">
          {delta > 0 ? "+" : ""}
          {delta} points since first snapshot
        </Badge>
      </div>

      <div className="mt-6 h-[340px] w-full sm:h-[390px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 12, left: -12, bottom: 4 }}
          >
            <defs>
              <linearGradient
                id="repositoryHealthArea"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.28}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />

            <XAxis
              dataKey="displayDate"
              minTickGap={36}
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "hsl(var(--muted-foreground))",
                fontSize: 12,
              }}
            />

            <YAxis
              domain={[0, 100]}
              width={42}
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "hsl(var(--muted-foreground))",
                fontSize: 12,
              }}
            />

            <Tooltip
              cursor={{
                stroke: "hsl(var(--border))",
                strokeDasharray: "4 4",
              }}
              content={<HealthTimelineTooltip />}
            />

            <Area
              type="monotone"
              dataKey="health"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fill="url(#repositoryHealthArea)"
              activeDot={{
                r: 6,
                strokeWidth: 3,
                fill: "hsl(var(--background))",
                stroke: "hsl(var(--primary))",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function HealthTimelineTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: {
      displayDate: string;
      health: number;
      index: number;
    };
  }>;
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
        Health Score:{" "}
        <span className="font-bold">
          {point.health}/100
        </span>
      </p>
    </div>
  );
}

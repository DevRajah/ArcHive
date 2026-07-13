"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminAnalyticsDatum } from "@/types/admin.types";
import { formatIntelligenceLabel } from "@/lib/intelligence-labels";

interface AdminAnalyticsChartCardProps {
  title: string;
  description: string;
  data?: AdminAnalyticsDatum[];
  humanizeLabels?: boolean;
  chartType?: "bar" | "donut";
  limit?: number;
}

export function AdminAnalyticsChartCard({
  title,
  description,
  data = [],
  humanizeLabels = true,
  chartType = "bar",
  limit = 10,
}: AdminAnalyticsChartCardProps) {
  const normalizedData = [...data]
    .filter(
      (item) =>
        item &&
        typeof item.name === "string" &&
        Number.isFinite(item.value)
    )
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map((item) => ({
      ...item,
      displayName: humanizeLabels
        ? formatIntelligenceLabel(item.name)
        : item.name,
    }));

  return (
    <div className="min-w-0 rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {normalizedData.length === 0 ? (
        <div className="mt-6 rounded-xl border border-border bg-background p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No analytics data available.
          </p>
        </div>
      ) : chartType === "donut" ? (
        <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={normalizedData}
                  dataKey="value"
                  nameKey="displayName"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={2}
                >
                  {normalizedData.map((item) => (
                    <Cell
                      key={item.name}
                      fill="currentColor"
                      className="text-primary"
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => [
                    Number(value).toLocaleString(),
                    "Count",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {normalizedData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-3 py-2"
              >
                <span className="truncate text-sm">
                  {item.displayName}
                </span>

                <span className="text-sm font-semibold">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 h-80 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={normalizedData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 80,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="displayName"
                interval={0}
                angle={-35}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 11 }}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11 }}
              />

              <Tooltip
                formatter={(value) => [
                  Number(value).toLocaleString(),
                  "Count",
                ]}
                labelFormatter={(label) => String(label)}
              />

              <Bar
                dataKey="value"
                fill="currentColor"
                className="text-primary"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
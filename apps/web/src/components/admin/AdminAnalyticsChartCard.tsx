"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatIntelligenceLabel } from "@/lib/intelligence-labels";
import { AdminAnalyticsDatum } from "@/types/admin.types";

interface AdminAnalyticsChartCardProps {
  title: string;
  description: string;
  data?: AdminAnalyticsDatum[];
  humanizeLabels?: boolean;
}

export function AdminAnalyticsChartCard({
  title,
  description,
  data = [],
  humanizeLabels = true,
}: AdminAnalyticsChartCardProps) {
  const normalizedData = data.map((item) => ({
    ...item,
    displayName: humanizeLabels
      ? formatIntelligenceLabel(item.name)
      : item.name,
  }));

  return (
    <div className="min-w-0 rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">{title}</h2>

      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      {normalizedData.length === 0 ? (
        <div className="mt-6 rounded-xl border border-border bg-background p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No analytics data available.
          </p>
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
                bottom: 70,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="displayName"
                interval={0}
                angle={-35}
                textAnchor="end"
                height={90}
                tick={{ fontSize: 11 }}
              />

              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />

              <Tooltip
                formatter={(value) => [Number(value).toLocaleString(), "Count"]}
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
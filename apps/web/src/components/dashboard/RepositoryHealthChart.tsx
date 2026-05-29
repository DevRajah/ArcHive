"use client";

import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

import { RepositoryIntelligence } from "@/types/dashboard.types";

interface RepositoryHealthChartProps {
  repositories?: RepositoryIntelligence[];
}

export function RepositoryHealthChart({
  repositories = [],
}: RepositoryHealthChartProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">
          Repository Intelligence Overview
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Engineering events and architecture evolution activity across tracked
          repositories.
        </p>
      </div>

      {repositories.length === 0 && (
        <div className="flex h-[320px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No repository intelligence available yet.
          </p>
        </div>
      )}

      {repositories.length > 0 && (
        <div className="mt-6 h-[320px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={repositories}
              margin={{
                top: 10,
                right: 10,
                left: -10,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />

              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip />

              <Bar
                dataKey="events"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
              />

              <Bar
                dataKey="architectureChanges"
                fill="#8b5cf6"
                radius={[6, 6, 0, 0]}
              />

              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
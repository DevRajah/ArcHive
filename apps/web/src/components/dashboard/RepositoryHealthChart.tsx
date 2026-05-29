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

const data = [
  { name: "API", events: 120, changes: 18 },
  { name: "Worker", events: 86, changes: 12 },
  { name: "Web", events: 142, changes: 24 },
  { name: "Auth", events: 64, changes: 9 },
  { name: "Queues", events: 94, changes: 16 },
];

export function RepositoryHealthChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 min-w-0">
      <div>
        <h2 className="text-lg font-semibold">Repository Intelligence</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Engineering activity and architecture change signals by module.
        </p>
      </div>

      <div className="mt-6 h-[320px] w-full min-w-0">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="events" radius={[6, 6, 0, 0]} />
            <Bar dataKey="changes" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
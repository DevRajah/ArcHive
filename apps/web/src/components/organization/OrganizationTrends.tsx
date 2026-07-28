"use client";

import {
  Activity,
  GitBranch,
  BrainCircuit,
  ShieldCheck,
  Layers3,
  ShieldAlert,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
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

import type {
  OrganizationTrendPoint,
} from "@/types/organization.types";

interface Props {
  points: OrganizationTrendPoint[];
}

const charts = [
  {
    title: "Architecture",
    icon: GitBranch,
    key: "averageArchitectureScore",
  },
  {
    title: "Engineering Quality",
    icon: BrainCircuit,
    key: "averageEngineeringQualityScore",
  },
  {
    title: "Production Readiness",
    icon: ShieldCheck,
    key: "averageProductionReadinessScore",
  },
  {
    title: "Maturity",
    icon: Layers3,
    key: "averageMaturityScore",
  },
  {
    title: "Risk",
    icon: ShieldAlert,
    key: "averageRiskScore",
  },
] as const;

export default function OrganizationTrends({
  points,
}: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">

      {charts.map((chart) => {
        const Icon = chart.icon;

        return (
          <Card key={chart.key}>
            <CardHeader>

              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {chart.title}
              </CardTitle>

            </CardHeader>

            <CardContent>

              <div className="h-72">

                <ResponsiveContainer>

                  <LineChart data={points}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="period" />

                    <YAxis />

                    <Tooltip />

                    <Line
                      dataKey={chart.key}
                      strokeWidth={3}
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
  );
}
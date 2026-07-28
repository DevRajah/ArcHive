"use client";

import {
  CheckCircle2,
  Clock3,
  Database,
  PieChart,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

interface AnalysisCoverageCardProps {
  analyzedRepositories: number;
  unanalyzedRepositories: number;
  coverage: number;
}

function clampPercentage(
  value: number,
) {
  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, value),
  );
}

function getCoverageLabel(
  coverage: number,
) {
  if (coverage >= 90) {
    return "Excellent";
  }

  if (coverage >= 70) {
    return "Good";
  }

  if (coverage >= 40) {
    return "Partial";
  }

  return "Low";
}

export default function AnalysisCoverageCard({
  analyzedRepositories,
  unanalyzedRepositories,
  coverage,
}: AnalysisCoverageCardProps) {
  const normalizedCoverage =
    clampPercentage(coverage);

  const totalRepositories =
    analyzedRepositories +
    unanalyzedRepositories;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Analysis Coverage
            </CardTitle>

            <p className="mt-2 text-sm text-muted-foreground">
              Repository coverage across
              the connected engineering
              portfolio.
            </p>
          </div>

          <Badge
            variant={
              normalizedCoverage >= 70
                ? "default"
                : "secondary"
            }
            className="w-fit"
          >
            {getCoverageLabel(
              normalizedCoverage,
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-4xl font-bold tracking-tight">
              {normalizedCoverage.toFixed(
                1,
              )}
              %
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              of tracked repositories have
              completed engineering
              analysis
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            {analyzedRepositories} of{" "}
            {totalRepositories} repositories
          </div>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{
              width: `${normalizedCoverage}%`,
            }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              Total tracked
            </div>

            <div className="mt-2 text-2xl font-bold">
              {totalRepositories.toLocaleString()}
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Analysed
            </div>

            <div className="mt-2 text-2xl font-bold">
              {analyzedRepositories.toLocaleString()}
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="h-4 w-4 text-amber-500" />
              Pending
            </div>

            <div className="mt-2 text-2xl font-bold">
              {unanalyzedRepositories.toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
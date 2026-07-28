"use client";

import type {
  ReactNode,
} from "react";

import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface OverviewMetricCardProps {
  title: string;
  value:
    | string
    | number
    | null
    | undefined;

  icon: ReactNode;
  description?: string;
  trend?: number | null;
  suffix?: string;
}

function formatValue(
  value:
    | string
    | number
    | null
    | undefined,
  suffix?: string,
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not analysed";
  }

  if (typeof value === "number") {
    const formatted =
      Number.isInteger(value)
        ? value.toLocaleString()
        : value.toLocaleString(
            undefined,
            {
              maximumFractionDigits: 1,
            },
          );

    return suffix
      ? `${formatted}${suffix}`
      : formatted;
  }

  return suffix
    ? `${value}${suffix}`
    : value;
}

function getTrendDetails(
  trend:
    | number
    | null
    | undefined,
) {
  if (
    trend === null ||
    trend === undefined ||
    trend === 0
  ) {
    return {
      Icon: Minus,
      text: "No change",
      className:
        "text-muted-foreground",
    };
  }

  if (trend > 0) {
    return {
      Icon: ArrowUpRight,
      text: `${Math.abs(
        trend,
      ).toFixed(1)}% increase`,
      className:
        "text-emerald-600 dark:text-emerald-400",
    };
  }

  return {
    Icon: ArrowDownRight,
    text: `${Math.abs(
      trend,
    ).toFixed(1)}% decrease`,
    className:
      "text-red-600 dark:text-red-400",
  };
}

export default function OverviewMetricCard({
  title,
  value,
  icon,
  description,
  trend,
  suffix,
}: OverviewMetricCardProps) {
  const trendDetails =
    getTrendDetails(trend);

  const TrendIcon =
    trendDetails.Icon;

  return (
    <Card className="group overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <CardContent className="relative p-6">
        <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-primary/[0.03]" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>

            <div className="mt-3 break-words text-2xl font-bold tracking-tight">
              {formatValue(
                value,
                suffix,
              )}
            </div>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-muted/40 transition group-hover:bg-primary/5">
            {icon}
          </div>
        </div>

        {description ? (
          <p className="relative mt-4 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}

        {trend !== undefined ? (
          <div
            className={`relative mt-4 flex items-center gap-1.5 text-xs font-medium ${trendDetails.className}`}
          >
            <TrendIcon className="h-3.5 w-3.5" />

            {trendDetails.text}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
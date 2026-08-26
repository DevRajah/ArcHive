"use client";

import { motion } from "framer-motion";

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  normalizeHealthDelta,
  normalizeHealthScore,
} from "@/utils/repository-health-trends";

import type { LucideIcon } from "lucide-react";

import type {
  RepositoryHealthMetric,
} from "@/types/repository-health-trends.types";

interface HealthMetricCardProps {
  title: string;
  description: string;
  metric: RepositoryHealthMetric;
  icon: LucideIcon;
  index?: number;
  inverseTrend?: boolean;
}

/**
 * Displays one repository health metric.
 *
 * Important semantics:
 *
 * score === 0
 *   means a genuine measured zero.
 *
 * score === null
 *   means the metric is unavailable / not assessed.
 *
 * The frontend must never convert the second state into the first.
 */
export function HealthMetricCard({
  title,
  description,
  metric,
  icon: Icon,
  index = 0,
  inverseTrend = false,
}: HealthMetricCardProps) {
  const score =
    normalizeHealthScore(
      metric.score,
    );

  const previousScore =
    normalizeHealthScore(
      metric.previousScore,
    );

  const delta =
    normalizeHealthDelta(
      metric.delta,
    );

  const hasScore =
    score !== null;

  const hasDelta =
    delta !== null;

  const isPositive =
    hasDelta && delta > 0;

  const isNegative =
    hasDelta && delta < 0;

  const isHealthyChange =
    inverseTrend
      ? isNegative
      : isPositive;

  const isUnhealthyChange =
    inverseTrend
      ? isPositive
      : isNegative;

  const TrendIcon =
    isPositive
      ? ArrowUpRight
      : isNegative
        ? ArrowDownRight
        : ArrowRight;

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 14,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
        delay: Math.min(
          index * 0.04,
          0.2,
        ),
      }}
      className="rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        <div
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
            {
              "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400":
                isHealthyChange,

              "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400":
                isUnhealthyChange,

              "border-border bg-muted text-muted-foreground":
                !isHealthyChange &&
                !isUnhealthyChange,
            },
          )}
        >
          <TrendIcon className="h-3.5 w-3.5" />

          {hasDelta
            ? `${
                delta > 0
                  ? "+"
                  : ""
              }${delta}`
            : "No delta"}
        </div>
      </div>

      <p className="mt-5 text-sm font-medium text-muted-foreground">
        {title}
      </p>

      {hasScore ? (
        <>
          <div className="mt-1 flex items-end gap-2">
            <p className="text-4xl font-bold tracking-tight">
              {score}
            </p>

            <span className="pb-1 text-sm text-muted-foreground">
              /100
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${score}%`,
              }}
              transition={{
                duration: 0.7,
                ease: "easeOut",
              }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </>
      ) : (
        <div className="mt-2 rounded-lg border border-dashed border-border bg-muted/20 p-4">
          <p className="text-xl font-bold tracking-tight">
            Not available
          </p>

          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            ArcHive does not currently
            have sufficient evidence to
            present a reliable value for
            this metric.
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground">
          Previous score
        </span>

        <span className="font-semibold">
          {previousScore === null
            ? "Not available"
            : `${previousScore}/100`}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {metric.explanation ??
          description}
      </p>
    </motion.article>
  );
}
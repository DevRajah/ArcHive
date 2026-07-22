import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CircleHelp,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getHealthDirectionLabel } from "@/utils/repository-health-trends";

import type {
  RepositoryHealthChangeDirection,
  RepositoryHealthDirection,
} from "@/types/repository-health-trends.types";

interface HealthDirectionBadgeProps {
  direction:
    | RepositoryHealthDirection
    | RepositoryHealthChangeDirection
    | string
    | null
    | undefined;

  size?: "sm" | "md" | "lg";
  className?: string;
}

export function HealthDirectionBadge({
  direction,
  size = "md",
  className,
}: HealthDirectionBadgeProps) {
  const normalizedDirection =
    direction?.toUpperCase() ?? "UNKNOWN";

  const isImproving = [
    "IMPROVING",
    "IMPROVED",
    "INCREASED",
  ].includes(normalizedDirection);

  const isDeclining = [
    "DECLINING",
    "DECLINED",
    "DECREASED",
  ].includes(normalizedDirection);

  const isStable = [
    "STABLE",
    "UNCHANGED",
  ].includes(normalizedDirection);

  const Icon = isImproving
    ? ArrowUpRight
    : isDeclining
      ? ArrowDownRight
      : isStable
        ? ArrowRight
        : CircleHelp;

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border font-semibold",
        {
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400":
            isImproving,

          "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400":
            isDeclining,

          "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400":
            isStable,

          "border-border bg-muted text-muted-foreground":
            !isImproving &&
            !isDeclining &&
            !isStable,

          "gap-1 px-2 py-0.5 text-xs":
            size === "sm",

          "gap-1.5 px-3 py-1 text-sm":
            size === "md",

          "gap-2 px-4 py-2 text-base":
            size === "lg",
        },
        className,
      )}
    >
      <Icon
        className={cn({
          "h-3.5 w-3.5": size === "sm",
          "h-4 w-4": size === "md",
          "h-5 w-5": size === "lg",
        })}
      />

      {getHealthDirectionLabel(direction)}
    </span>
  );
}
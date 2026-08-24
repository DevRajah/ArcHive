"use client";

import { motion } from "framer-motion";
import {
  Activity,
  CalendarClock,
  Gauge,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";

import { HealthDirectionBadge } from "@/components/health-trends/HealthDirectionBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  formatHealthDate,
  getRiskLevelLabel,
  normalizeHealthScore,
} from "@/utils/repository-health-trends";

import type {
  RepositoryHealthDirection,
  RepositoryHealthRiskLevel,
} from "@/types/repository-health-trends.types";

interface RepositoryHealthHeroProps {
  repositoryName: string;

  /**
   * null means ArcHive does not currently have enough evidence
   * to publish this score.
   *
   * It must never be rendered as numeric zero.
   */
  overallHealthScore: number | null;

  direction: RepositoryHealthDirection;

  confidenceScore: number | null;

  riskScore: number | null;

  riskLevel: RepositoryHealthRiskLevel;

  lastUpdatedAt?: string;

  isRefreshing: boolean;

  onRefresh: () => void;
}

export function RepositoryHealthHero({
  repositoryName,
  overallHealthScore,
  direction,
  confidenceScore,
  riskScore,
  riskLevel,
  lastUpdatedAt,
  isRefreshing,
  onRefresh,
}: RepositoryHealthHeroProps) {
  const health =
    overallHealthScore === null
      ? null
      : normalizeHealthScore(
        overallHealthScore,
      );

  const confidence =
    confidenceScore === null
      ? null
      : normalizeHealthScore(
        confidenceScore,
      );

  const risk =
    riskScore === null
      ? null
      : normalizeHealthScore(
        riskScore,
      );

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
    >
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/5 text-primary"
              >
                <Activity className="mr-1.5 h-3.5 w-3.5" />
                Repository Health Trends
              </Badge>

              <HealthDirectionBadge
                direction={direction}
                size="sm"
              />
            </div>

            <p className="mt-6 text-sm font-medium text-muted-foreground">
              Repository
            </p>

            <h1 className="mt-1 break-words text-3xl font-bold tracking-tight md:text-4xl">
              {repositoryName}
            </h1>

            <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Overall Health
                </p>

                <div className="mt-2 flex items-end gap-2">
                  <p className="text-6xl font-bold tracking-tight md:text-7xl">
                    {health === null
                      ? "Not assessed"
                      : health}
                  </p>

                  {health !== null && (
                    <span className="pb-2 text-lg font-medium text-muted-foreground">
                      /100
                    </span>
                  )}
                </div>
              </div>

              <div className="max-w-2xl lg:pb-2">
                <p className="text-base leading-7 text-muted-foreground">
                  {getDirectionExplanation(direction)}
                </p>
              </div>
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="shrink-0"
          >
            <RefreshCcw
              className={`mr-2 h-4 w-4 ${isRefreshing
                ? "animate-spin"
                : ""
                }`}
            />

            {isRefreshing
              ? "Refreshing Health"
              : "Refresh Health"}
          </Button>
        </div>

        <div className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-2 xl:grid-cols-4">
          <HeroMetric
            label="Direction"
            value={formatDirection(direction)}
            description="Repository movement"
            icon={Activity}
          />

          <HeroMetric
            label="Confidence"
            value={
              confidence === null
                ? "Not available"
                : `${confidence}%`
            }
            description={
              confidence === null
                ? "More repository evidence is required"
                : "Evidence confidence"
            }
            icon={Gauge}
          />

          <HeroMetric
            label="Risk"
            value={
              risk === null
                ? "Not assessed"
                : `${risk}%`
            }
            description={
              risk === null
                ? "Insufficient evidence for a risk judgement"
                : getRiskLevelLabel(riskLevel)
            }
            icon={ShieldAlert}
          />

          <HeroMetric
            label="Last Updated"
            value={formatHealthDate(lastUpdatedAt)}
            description="Latest health snapshot"
            icon={CalendarClock}
            compact
          />
        </div>
      </div>
    </motion.section>
  );
}

function HeroMetric({
  label,
  value,
  description,
  icon: Icon,
  compact = false,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof Activity;
  compact?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/70 p-4">
      <Icon className="h-5 w-5 text-primary" />

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p
        className={
          compact
            ? "mt-1 text-base font-bold leading-6"
            : "mt-1 text-2xl font-bold"
        }
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function formatDirection(
  direction: RepositoryHealthDirection,
) {
  switch (direction) {
    case "IMPROVING":
      return "Improving";

    case "DECLINING":
      return "Declining";

    case "STABLE":
      return "Stable";

    default:
      return "Unknown";
  }
}

function getDirectionExplanation(
  direction: RepositoryHealthDirection,
) {
  switch (direction) {
    case "IMPROVING":
      return "The repository is showing positive engineering movement across its latest health snapshots.";

    case "DECLINING":
      return "The repository is trending downward and should be reviewed for emerging engineering or production risks.";

    case "STABLE":
      return "The repository remains broadly consistent, with no significant upward or downward health movement.";

    default:
      return "ArcHive requires additional repository evidence before it can confidently determine the current direction.";
  }
}
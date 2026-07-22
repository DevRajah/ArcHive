"use client";

import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Gauge,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { HealthDirectionBadge } from "@/components/health-trends/HealthDirectionBadge";
import { normalizeHealthDelta } from "@/utils/repository-health-trends";

import type { RepositoryHealthDirection } from "@/types/repository-health-trends.types";

interface RepositoryDirectionPanelProps {
  direction: RepositoryHealthDirection;
  overallDelta: number | null;
  confidenceScore: number;
  riskScore: number;
}

export function RepositoryDirectionPanel({
  direction,
  overallDelta,
  confidenceScore,
  riskScore,
}: RepositoryDirectionPanelProps) {
  const delta =
    normalizeHealthDelta(overallDelta) ?? 0;

  const configuration =
    getDirectionConfiguration(direction);

  const DirectionIcon = configuration.icon;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    >
      <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
        <div className="p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Repository direction
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <DirectionIcon className="h-7 w-7 text-primary" />
            </div>

            <HealthDirectionBadge
              direction={direction}
              size="lg"
            />
          </div>

          <h3 className="mt-6 text-2xl font-bold tracking-tight">
            {configuration.title}
          </h3>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            {configuration.description}
          </p>

          <div className="mt-6 rounded-xl border border-border bg-background/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Overall movement
            </p>

            <p className="mt-2 text-3xl font-bold">
              {delta > 0 ? "+" : ""}
              {delta} points
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Compared with the previous repository health snapshot.
            </p>
          </div>
        </div>

        <div className="border-t border-border bg-muted/30 p-6 lg:border-l lg:border-t-0 md:p-8">
          <p className="font-semibold">
            Direction signals
          </p>

          <div className="mt-5 space-y-4">
            <DirectionSignal
              icon={Sparkles}
              title="Engineering movement"
              description={
                configuration.engineeringSignal
              }
            />

            <DirectionSignal
              icon={Gauge}
              title="Assessment confidence"
              description={`${Math.round(
                confidenceScore,
              )}/100 confidence in the available evidence.`}
            />

            <DirectionSignal
              icon={ShieldCheck}
              title="Current risk exposure"
              description={`${Math.round(
                riskScore,
              )}/100 repository risk. Lower is healthier.`}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function DirectionSignal({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
        <Icon className="h-4 w-4 text-primary" />
      </div>

      <div>
        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function getDirectionConfiguration(
  direction: RepositoryHealthDirection,
) {
  switch (direction) {
    case "IMPROVING":
      return {
        icon: ArrowUpRight,
        title: "The repository is moving in a healthier direction",
        description:
          "Recent snapshots show positive engineering movement. ArcHive is detecting stronger repository health across the latest assessment period.",
        engineeringSignal:
          "Positive movement is visible across the most recent repository snapshots.",
      };

    case "DECLINING":
      return {
        icon: ArrowDownRight,
        title: "The repository requires engineering attention",
        description:
          "Recent snapshots show declining repository health. Review the largest regressions, production risks, and recent engineering changes before the trend continues.",
        engineeringSignal:
          "Negative movement is visible across the most recent repository snapshots.",
      };

    case "STABLE":
      return {
        icon: ArrowRight,
        title: "The repository is broadly stable",
        description:
          "The latest snapshots do not show a significant upward or downward movement. Stability is useful, but the lowest-scoring metrics still deserve review.",
        engineeringSignal:
          "Recent engineering health remains consistent without a major directional shift.",
      };

    default:
      return {
        icon: ArrowRight,
        title: "Repository direction is not yet established",
        description:
          "ArcHive needs more historical evidence before it can confidently classify the repository as improving, stable, or declining.",
        engineeringSignal:
          "Additional snapshots are required to establish a reliable direction.",
      };
  }
}

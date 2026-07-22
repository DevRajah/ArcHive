"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type {
  RepositoryHealthInsight,
  RepositoryHealthRiskLevel,
} from "@/types/repository-health-trends.types";

interface EngineeringInsightCardProps {
  insight: RepositoryHealthInsight;
  index: number;
}

export function EngineeringInsightCard({
  insight,
  index,
}: EngineeringInsightCardProps) {
  const evidence = normalizeEvidence(
    insight.evidence,
  );

  const severity =
    insight.severity ?? "UNKNOWN";

  const Icon = getInsightIcon(severity);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.05, 0.25),
      }}
      className="rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            getSeverityIconClasses(severity),
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {insight.category && (
            <Badge variant="outline">
              {insight.category}
            </Badge>
          )}

          <Badge
            variant="secondary"
            className={getSeverityBadgeClasses(
              severity,
            )}
          >
            {formatSeverity(severity)}
          </Badge>
        </div>
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        {insight.title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {insight.description}
      </p>

      {insight.recommendation && (
        <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex gap-2">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Recommended action
              </p>

              <p className="mt-2 text-sm leading-6">
                {insight.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {evidence.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Evidence
          </p>

          <ul className="mt-3 space-y-2">
            {evidence.map((item, evidenceIndex) => (
              <li
                key={`${item}-${evidenceIndex}`}
                className="flex gap-2 text-sm leading-6 text-muted-foreground"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.article>
  );
}

function normalizeEvidence(
  evidence: string[] | string | undefined,
) {
  if (Array.isArray(evidence)) {
    return evidence;
  }

  return evidence ? [evidence] : [];
}

function getInsightIcon(
  severity: RepositoryHealthRiskLevel,
) {
  switch (severity) {
    case "CRITICAL":
    case "HIGH":
      return ShieldAlert;

    case "MEDIUM":
      return AlertTriangle;

    case "LOW":
      return CheckCircle2;

    default:
      return Sparkles;
  }
}

function getSeverityIconClasses(
  severity: RepositoryHealthRiskLevel,
) {
  switch (severity) {
    case "CRITICAL":
    case "HIGH":
      return "bg-red-500/10 text-red-600 dark:text-red-400";

    case "MEDIUM":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400";

    case "LOW":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";

    default:
      return "bg-primary/10 text-primary";
  }
}

function getSeverityBadgeClasses(
  severity: RepositoryHealthRiskLevel,
) {
  switch (severity) {
    case "CRITICAL":
    case "HIGH":
      return "bg-red-500/10 text-red-700 dark:text-red-400";

    case "MEDIUM":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400";

    case "LOW":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";

    default:
      return "";
  }
}

function formatSeverity(
  severity: RepositoryHealthRiskLevel,
) {
  return severity === "UNKNOWN"
    ? "General"
    : severity.charAt(0) +
        severity.slice(1).toLowerCase();
}

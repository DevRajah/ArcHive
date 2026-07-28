"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import OrganizationEmptyState from "@/components/organization/OrganizationEmptyState";

import type {
  OrganizationRiskSummary,
} from "@/types/organization.types";

interface RiskOverviewProps {
  risks: OrganizationRiskSummary;
}

type RiskFilter =
  | "ALL"
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW";

const riskLevels: {
  value: Exclude<RiskFilter, "ALL">;
  label: string;
  description: string;
}[] = [
  {
    value: "CRITICAL",
    label: "Critical",
    description:
      "Immediate engineering attention required",
  },
  {
    value: "HIGH",
    label: "High",
    description:
      "Significant engineering risk detected",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    description:
      "Improvements should be scheduled",
  },
  {
    value: "LOW",
    label: "Low",
    description:
      "Repository is currently stable",
  },
];

function getRiskBadgeVariant(
  level: string,
): "default" | "secondary" | "outline" | "destructive" {
  switch (level) {
    case "CRITICAL":
    case "HIGH":
      return "destructive";

    case "MEDIUM":
      return "secondary";

    default:
      return "outline";
  }
}

function getRiskIcon(level: string) {
  switch (level) {
    case "CRITICAL":
    case "HIGH":
      return ShieldAlert;

    case "MEDIUM":
      return AlertTriangle;

    default:
      return ShieldCheck;
  }
}

export default function RiskOverview({
  risks,
}: RiskOverviewProps) {
  const [activeFilter, setActiveFilter] =
    useState<RiskFilter>("ALL");

  const counts = useMemo(() => {
    return riskLevels.reduce(
      (result, level) => {
        result[level.value] =
          risks.repositories.filter(
            (repository) =>
              repository.riskLevel ===
              level.value,
          ).length;

        return result;
      },
      {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
      } as Record<
        Exclude<RiskFilter, "ALL">,
        number
      >,
    );
  }, [risks.repositories]);

  const visibleRepositories =
    useMemo(() => {
      if (activeFilter === "ALL") {
        return risks.repositories;
      }

      return risks.repositories.filter(
        (repository) =>
          repository.riskLevel ===
          activeFilter,
      );
    }, [
      activeFilter,
      risks.repositories,
    ]);

  if (!risks.repositories.length) {
    return (
      <OrganizationEmptyState
        icon={CheckCircle2}
        title="No organization risks detected"
        description="Risk information will appear when analyzed repositories contain architecture, engineering quality, maturity, or production readiness concerns."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Organization Risks
            </CardTitle>

            <p className="mt-2 text-sm text-muted-foreground">
              Review repositories that may require
              engineering or architecture attention.
            </p>
          </div>

          <Button
            type="button"
            variant={
              activeFilter === "ALL"
                ? "default"
                : "outline"
            }
            size="sm"
            onClick={() =>
              setActiveFilter("ALL")
            }
          >
            All risks
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-7">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {riskLevels.map((level) => {
            const isActive =
              activeFilter === level.value;

            return (
              <button
                key={level.value}
                type="button"
                onClick={() =>
                  setActiveFilter(
                    level.value,
                  )
                }
                className={`rounded-xl border p-4 text-left transition ${
                  isActive
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Badge
                    variant={getRiskBadgeVariant(
                      level.value,
                    )}
                  >
                    {level.label}
                  </Badge>

                  <span className="text-2xl font-bold">
                    {counts[level.value]}
                  </span>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  {level.description}
                </p>
              </button>
            );
          })}
        </div>

        {!visibleRepositories.length ? (
          <OrganizationEmptyState
            icon={ShieldCheck}
            title={`No ${activeFilter.toLowerCase()} risk repositories`}
            description="No repositories currently match this risk filter."
          />
        ) : (
          <div className="space-y-4">
            {visibleRepositories.map(
              (repository) => {
                const RiskIcon =
                  getRiskIcon(
                    repository.riskLevel,
                  );

                return (
                  <Card
                    key={
                      repository.repositoryId
                    }
                    className="transition hover:border-primary/40"
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                            <RiskIcon className="h-5 w-5 text-muted-foreground" />
                          </div>

                          <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold">
                                {
                                  repository.repositoryName
                                }
                              </h3>

                              <Badge
                                variant={getRiskBadgeVariant(
                                  repository.riskLevel,
                                )}
                              >
                                {
                                  repository.riskLevel
                                }
                              </Badge>

                              <Badge variant="outline">
                                {
                                  repository.maturityLabel
                                }
                              </Badge>
                            </div>

                            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                              {
                                repository.overallAssessment
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center justify-between gap-4 lg:justify-end">
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">
                              Risk score
                            </div>

                            <div className="text-2xl font-bold">
                              {
                                repository.overallRiskScore
                              }
                            </div>
                          </div>

                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                          >
                            <Link
                              href={`/repositories/${repository.repositoryId}`}
                            >
                              View Repository
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              },
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
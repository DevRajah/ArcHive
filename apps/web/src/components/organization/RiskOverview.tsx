"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  CheckCircle2,
  Search,
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
import { Input } from "@/components/ui/input";

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

type RiskSort =
  | "RISK_HIGH"
  | "RISK_LOW"
  | "NAME_ASC"
  | "NAME_DESC";

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
):
  | "default"
  | "secondary"
  | "outline"
  | "destructive" {
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

function normalizeRiskScore(
  score: number | null | undefined,
) {
  if (
    typeof score !== "number" ||
    !Number.isFinite(score)
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, score),
  );
}

function formatRiskScore(
  score: number | null | undefined,
) {
  if (
    typeof score !== "number" ||
    !Number.isFinite(score)
  ) {
    return "N/A";
  }

  return Number.isInteger(score)
    ? String(score)
    : score.toFixed(1);
}

function getRiskProgressClass(
  score: number,
) {
  if (score >= 75) {
    return "bg-red-500";
  }

  if (score >= 50) {
    return "bg-orange-500";
  }

  if (score >= 25) {
    return "bg-yellow-500";
  }

  return "bg-emerald-500";
}

export default function RiskOverview({
  risks,
}: RiskOverviewProps) {
  const [activeFilter, setActiveFilter] =
    useState<RiskFilter>("ALL");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [sortBy, setSortBy] =
    useState<RiskSort>("RISK_HIGH");

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
      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      const filtered =
        risks.repositories.filter(
          (repository) => {
            const matchesRisk =
              activeFilter === "ALL" ||
              repository.riskLevel ===
                activeFilter;

            const matchesSearch =
              normalizedSearch.length === 0 ||
              repository.repositoryName
                .toLowerCase()
                .includes(
                  normalizedSearch,
                );

            return (
              matchesRisk &&
              matchesSearch
            );
          },
        );

      return [...filtered].sort(
        (first, second) => {
          const firstRisk =
            typeof first.overallRiskScore ===
            "number"
              ? first.overallRiskScore
              : 0;

          const secondRisk =
            typeof second.overallRiskScore ===
            "number"
              ? second.overallRiskScore
              : 0;

          switch (sortBy) {
            case "RISK_LOW":
              return (
                firstRisk -
                secondRisk
              );

            case "NAME_ASC":
              return first.repositoryName.localeCompare(
                second.repositoryName,
              );

            case "NAME_DESC":
              return second.repositoryName.localeCompare(
                first.repositoryName,
              );

            case "RISK_HIGH":
            default:
              return (
                secondRisk -
                firstRisk
              );
          }
        },
      );
    }, [
      activeFilter,
      risks.repositories,
      searchTerm,
      sortBy,
    ]);

  const totalRisks =
    risks.repositories.length;

  const urgentRiskCount =
    counts.CRITICAL + counts.HIGH;

  if (!totalRisks) {
    return (
      <OrganizationEmptyState
        icon={CheckCircle2}
        title="No organization risks detected"
        description="Risk information will appear when analysed repositories contain architecture, engineering quality, maturity, or production readiness concerns."
      />
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />

              Organization Risks
            </CardTitle>

            <p className="mt-2 text-sm text-muted-foreground">
              Review repositories that may
              require engineering or
              architecture attention.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {totalRisks} repositories
            </Badge>

            <Badge
              variant={
                urgentRiskCount > 0
                  ? "destructive"
                  : "outline"
              }
            >
              {urgentRiskCount} urgent
            </Badge>

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
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
              placeholder="Search risk repositories..."
              className="pl-9"
            />
          </div>

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                event.target
                  .value as RiskSort,
              )
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          >
            <option value="RISK_HIGH">
              Highest risk first
            </option>

            <option value="RISK_LOW">
              Lowest risk first
            </option>

            <option value="NAME_ASC">
              Repository name A to Z
            </option>

            <option value="NAME_DESC">
              Repository name Z to A
            </option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="space-y-7">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {riskLevels.map((level) => {
            const isActive =
              activeFilter ===
              level.value;

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
                    : "hover:border-primary/30 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
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

                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  {level.description}
                </p>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${
                      level.value ===
                        "CRITICAL" ||
                      level.value ===
                        "HIGH"
                        ? "bg-red-500"
                        : level.value ===
                            "MEDIUM"
                          ? "bg-yellow-500"
                          : "bg-emerald-500"
                    }`}
                    style={{
                      width:
                        totalRisks > 0
                          ? `${
                              (counts[
                                level
                                  .value
                              ] /
                                totalRisks) *
                              100
                            }%`
                          : "0%",
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {
                visibleRepositories.length
              }
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {totalRisks}
            </span>{" "}
            repositories
          </p>

          {searchTerm ||
          activeFilter !== "ALL" ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearchTerm("");
                setActiveFilter("ALL");
              }}
            >
              Clear filters
            </Button>
          ) : null}
        </div>

        {!visibleRepositories.length ? (
          <OrganizationEmptyState
            icon={ShieldCheck}
            title="No matching risk repositories"
            description="No repositories currently match the selected risk level and search term."
          />
        ) : (
          <div className="space-y-4">
            {visibleRepositories.map(
              (repository) => {
                const RiskIcon =
                  getRiskIcon(
                    repository.riskLevel,
                  );

                const normalizedScore =
                  normalizeRiskScore(
                    repository.overallRiskScore,
                  );

                return (
                  <Card
                    key={
                      repository.repositoryId
                    }
                    className="overflow-hidden transition hover:border-primary/40 hover:shadow-sm"
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 flex-1 gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-muted/60">
                            <RiskIcon className="h-5 w-5 text-muted-foreground" />
                          </div>

                          <div className="min-w-0 flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate font-semibold">
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

                              {repository.maturityLabel ? (
                                <Badge variant="outline">
                                  {
                                    repository.maturityLabel
                                  }
                                </Badge>
                              ) : null}
                            </div>

                            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                              {repository.overallAssessment ||
                                "No overall risk assessment is currently available for this repository."}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center lg:justify-end">
                          <div className="min-w-40">
                            <div className="flex items-end justify-between gap-4">
                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Risk score
                                </div>

                                <div className="mt-1 text-2xl font-bold">
                                  {formatRiskScore(
                                    repository.overallRiskScore,
                                  )}
                                </div>
                              </div>

                              <span className="text-xs text-muted-foreground">
                                / 100
                              </span>
                            </div>

                            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${getRiskProgressClass(
                                  normalizedScore,
                                )}`}
                                style={{
                                  width: `${normalizedScore}%`,
                                }}
                              />
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
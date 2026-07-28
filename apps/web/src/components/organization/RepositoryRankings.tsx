"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowDown,
  ArrowUp,
  Search,
  Trophy,
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

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import OrganizationEmptyState from "@/components/organization/OrganizationEmptyState";

import type {
  OrganizationRepositoryRanking,
} from "@/types/organization.types";

interface RepositoryRankingsProps {
  repositories: OrganizationRepositoryRanking[];
}

type SortKey =
  | "overallScore"
  | "architectureScore"
  | "engineeringQualityScore"
  | "productionReadinessScore"
  | "maturityScore"
  | "riskScore";

type ResultLimit = "5" | "10" | "ALL";

const rankingTabs: {
  value: SortKey;
  label: string;
}[] = [
  {
    value: "overallScore",
    label: "Overall",
  },
  {
    value: "architectureScore",
    label: "Architecture",
  },
  {
    value: "engineeringQualityScore",
    label: "Engineering",
  },
  {
    value: "productionReadinessScore",
    label: "Production",
  },
  {
    value: "maturityScore",
    label: "Maturity",
  },
  {
    value: "riskScore",
    label: "Risk",
  },
];

function getNumericValue(
  repository: OrganizationRepositoryRanking,
  key: SortKey,
) {
  const value = repository[key];

  return typeof value === "number"
    ? value
    : 0;
}

function formatScore(
  value: number | null | undefined,
) {
  if (typeof value !== "number") {
    return "N/A";
  }

  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(1);
}

function getScoreBadgeVariant(
  score: number,
  isRisk: boolean,
): "default" | "secondary" | "outline" | "destructive" {
  if (isRisk) {
    if (score >= 75) {
      return "destructive";
    }

    if (score >= 50) {
      return "secondary";
    }

    return "outline";
  }

  if (score >= 75) {
    return "default";
  }

  if (score >= 50) {
    return "secondary";
  }

  return "outline";
}

export default function RepositoryRankings({
  repositories,
}: RepositoryRankingsProps) {
  const [activeTab, setActiveTab] =
    useState<SortKey>("overallScore");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [language, setLanguage] =
    useState("ALL");

  const [resultLimit, setResultLimit] =
    useState<ResultLimit>("10");

  const availableLanguages = useMemo(() => {
    const languages = repositories
      .map((repository) => repository.language)
      .filter(
        (
          item,
        ): item is string =>
          typeof item === "string" &&
          item.trim().length > 0,
      );

    return Array.from(
      new Set(languages),
    ).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [repositories]);

  const visibleRepositories = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    const filtered = repositories.filter(
      (repository) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          repository.repositoryName
            .toLowerCase()
            .includes(normalizedSearch) ||
          repository.repositoryFullName
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesLanguage =
          language === "ALL" ||
          repository.language === language;

        return (
          matchesSearch &&
          matchesLanguage
        );
      },
    );

    filtered.sort((first, second) => {
      const firstScore = getNumericValue(
        first,
        activeTab,
      );

      const secondScore = getNumericValue(
        second,
        activeTab,
      );

      return secondScore - firstScore;
    });

    if (resultLimit === "ALL") {
      return filtered;
    }

    return filtered.slice(
      0,
      Number(resultLimit),
    );
  }, [
    activeTab,
    language,
    repositories,
    resultLimit,
    searchTerm,
  ]);

  if (!repositories.length) {
    return (
      <OrganizationEmptyState
        icon={Trophy}
        title="No repository rankings yet"
        description="Repository rankings will appear after ArcHive completes analysis for at least one repository."
      />
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Repository Rankings
            </CardTitle>

            <p className="mt-2 text-sm text-muted-foreground">
              Compare repositories across architecture,
              engineering quality, production readiness,
              maturity, and risk.
            </p>
          </div>

          <Badge variant="secondary">
            {visibleRepositories.length} shown
          </Badge>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
              placeholder="Search repositories..."
              className="pl-9"
            />
          </div>

          <select
            value={language}
            onChange={(event) =>
              setLanguage(
                event.target.value,
              )
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">
              All languages
            </option>

            {availableLanguages.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ),
            )}
          </select>

          <select
            value={resultLimit}
            onChange={(event) =>
              setResultLimit(
                event.target
                  .value as ResultLimit,
              )
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          >
            <option value="5">
              Top 5
            </option>

            <option value="10">
              Top 10
            </option>

            <option value="ALL">
              Show all
            </option>
          </select>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(
              value as SortKey,
            )
          }
        >
          <TabsList className="mb-6 flex h-auto flex-wrap justify-start">
            {rankingTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {rankingTabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
            >
              {!visibleRepositories.length ? (
                <OrganizationEmptyState
                  icon={Search}
                  title="No repositories found"
                  description="Try changing the search term, language filter, or result limit."
                />
              ) : (
                <div className="max-h-[620px] overflow-auto rounded-lg border">
                  <table className="w-full min-w-[950px] text-sm">
                    <thead className="sticky top-0 z-10 bg-background">
                      <tr className="border-b">
                        <th className="w-20 px-4 py-3 text-left font-medium text-muted-foreground">
                          Rank
                        </th>

                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                          Repository
                        </th>

                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                          Language
                        </th>

                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                          Score
                        </th>

                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                          Activity
                        </th>

                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {visibleRepositories.map(
                        (
                          repository,
                          index,
                        ) => {
                          const score =
                            getNumericValue(
                              repository,
                              activeTab,
                            );

                          const isRisk =
                            activeTab ===
                            "riskScore";

                          const TrendIcon =
                            isRisk
                              ? ArrowUp
                              : ArrowDown;

                          return (
                            <tr
                              key={
                                repository.repositoryId
                              }
                              className="border-b transition-colors last:border-b-0 hover:bg-muted/40"
                            >
                              <td className="px-4 py-4">
                                <Badge
                                  variant={
                                    index < 3
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  #{index + 1}
                                </Badge>
                              </td>

                              <td className="px-4 py-4">
                                <div className="font-medium">
                                  {
                                    repository.repositoryName
                                  }
                                </div>

                                <div className="mt-1 text-xs text-muted-foreground">
                                  {
                                    repository.repositoryFullName
                                  }
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <Badge variant="outline">
                                  {repository.language ??
                                    "Unknown"}
                                </Badge>
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <TrendIcon
                                    className={`h-4 w-4 ${
                                      isRisk
                                        ? "text-destructive"
                                        : "text-emerald-500"
                                    }`}
                                  />

                                  <Badge
                                    variant={getScoreBadgeVariant(
                                      score,
                                      isRisk,
                                    )}
                                  >
                                    {formatScore(
                                      score,
                                    )}
                                  </Badge>
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline">
                                    {
                                      repository.engineeringEventCount
                                    }{" "}
                                    events
                                  </Badge>

                                  <Badge variant="outline">
                                    {
                                      repository.architectureChangeCount
                                    }{" "}
                                    architecture
                                  </Badge>

                                  <Badge variant="outline">
                                    {
                                      repository.recommendationCount
                                    }{" "}
                                    recommendations
                                  </Badge>
                                </div>
                              </td>

                              <td className="px-4 py-4 text-right">
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
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  FolderGit2,
  Lightbulb,
  RotateCcw,
  Search,
  Sparkles,
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
  OrganizationRecommendation,
} from "@/types/organization.types";

interface OrganizationRecommendationsProps {
  recommendations: OrganizationRecommendation[];
}

type RecommendationSort =
  | "NEWEST"
  | "OLDEST"
  | "REPOSITORY_ASC"
  | "REPOSITORY_DESC"
  | "CATEGORY_ASC";

function formatRecommendationKey(
  value: string,
) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatRecommendationDate(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

function getCategoryBadgeVariant(
  category: string,
):
  | "default"
  | "secondary"
  | "outline"
  | "destructive" {
  const normalizedCategory =
    category.toUpperCase();

  if (
    normalizedCategory.includes(
      "SECURITY",
    ) ||
    normalizedCategory.includes(
      "VULNERABILITY",
    )
  ) {
    return "destructive";
  }

  if (
    normalizedCategory.includes(
      "ARCHITECTURE",
    ) ||
    normalizedCategory.includes(
      "PRODUCTION",
    )
  ) {
    return "default";
  }

  if (
    normalizedCategory.includes(
      "TEST",
    ) ||
    normalizedCategory.includes(
      "QUALITY",
    )
  ) {
    return "secondary";
  }

  return "outline";
}

export default function OrganizationRecommendations({
  recommendations,
}: OrganizationRecommendationsProps) {
  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("ALL");

  const [sortBy, setSortBy] =
    useState<RecommendationSort>(
      "NEWEST",
    );

  const [
    expandedRecommendations,
    setExpandedRecommendations,
  ] = useState<Set<string>>(
    () => new Set(),
  );

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        recommendations
          .map(
            (item) =>
              item.recommendationKey,
          )
          .filter(
            (category) =>
              category.trim().length >
              0,
          ),
      ),
    ).sort((first, second) =>
      formatRecommendationKey(
        first,
      ).localeCompare(
        formatRecommendationKey(
          second,
        ),
      ),
    );
  }, [recommendations]);

  const categoryCounts = useMemo(() => {
    return recommendations.reduce(
      (result, item) => {
        result[
          item.recommendationKey
        ] =
          (result[
            item.recommendationKey
          ] ?? 0) + 1;

        return result;
      },
      {} as Record<string, number>,
    );
  }, [recommendations]);

  const repositoryCount =
    useMemo(() => {
      return new Set(
        recommendations.map(
          (item) =>
            item.repositoryId,
        ),
      ).size;
    }, [recommendations]);

  const evidenceCount =
    useMemo(() => {
      return recommendations.filter(
        (item) =>
          Boolean(
            item.evidence?.trim(),
          ),
      ).length;
    }, [recommendations]);

  const visibleRecommendations =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      const filtered =
        recommendations.filter(
          (item) => {
            const matchesCategory =
              activeCategory ===
                "ALL" ||
              item.recommendationKey ===
                activeCategory;

            const searchableContent = [
              item.title,
              item.description,
              item.repositoryName,
              item.recommendationKey,
              item.evidence ?? "",
            ]
              .join(" ")
              .toLowerCase();

            const matchesSearch =
              normalizedSearch.length ===
                0 ||
              searchableContent.includes(
                normalizedSearch,
              );

            return (
              matchesCategory &&
              matchesSearch
            );
          },
        );

      return [...filtered].sort(
        (first, second) => {
          const firstDate =
            new Date(
              first.createdAt,
            ).getTime();

          const secondDate =
            new Date(
              second.createdAt,
            ).getTime();

          switch (sortBy) {
            case "OLDEST":
              return (
                firstDate -
                secondDate
              );

            case "REPOSITORY_ASC":
              return first.repositoryName.localeCompare(
                second.repositoryName,
              );

            case "REPOSITORY_DESC":
              return second.repositoryName.localeCompare(
                first.repositoryName,
              );

            case "CATEGORY_ASC":
              return formatRecommendationKey(
                first.recommendationKey,
              ).localeCompare(
                formatRecommendationKey(
                  second.recommendationKey,
                ),
              );

            case "NEWEST":
            default:
              return (
                secondDate -
                firstDate
              );
          }
        },
      );
    }, [
      activeCategory,
      recommendations,
      searchTerm,
      sortBy,
    ]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    activeCategory !== "ALL";

  function createRecommendationId(
    item: OrganizationRecommendation,
    index: number,
  ) {
    return [
      item.repositoryId,
      item.recommendationKey,
      item.createdAt,
      index,
    ].join("-");
  }

  function toggleRecommendation(
    recommendationId: string,
  ) {
    setExpandedRecommendations(
      (current) => {
        const next = new Set(
          current,
        );

        if (
          next.has(
            recommendationId,
          )
        ) {
          next.delete(
            recommendationId,
          );
        } else {
          next.add(
            recommendationId,
          );
        }

        return next;
      },
    );
  }

  function clearFilters() {
    setSearchTerm("");
    setActiveCategory("ALL");
  }

  if (!recommendations.length) {
    return (
      <OrganizationEmptyState
        icon={Lightbulb}
        title="No engineering recommendations"
        description="Recommendations will appear after ArcHive completes repository analysis and identifies practical engineering improvements."
      />
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />

              Engineering Recommendations
            </CardTitle>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Practical engineering
              improvements generated from
              repository architecture,
              quality, maturity, and
              production-readiness analysis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {
                visibleRecommendations.length
              }{" "}
              shown
            </Badge>

            <Badge variant="outline">
              {recommendations.length}{" "}
              total
            </Badge>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>

              <span className="text-2xl font-bold">
                {recommendations.length}
              </span>
            </div>

            <p className="mt-3 text-sm font-medium">
              Total recommendations
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Engineering improvements
              identified across the
              organization.
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FolderGit2 className="h-5 w-5 text-primary" />
              </div>

              <span className="text-2xl font-bold">
                {repositoryCount}
              </span>
            </div>

            <p className="mt-3 text-sm font-medium">
              Repositories affected
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Repositories currently
              containing recommended
              improvements.
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>

              <span className="text-2xl font-bold">
                {evidenceCount}
              </span>
            </div>

            <p className="mt-3 text-sm font-medium">
              Evidence-backed
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Recommendations supported by
              repository analysis evidence.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={
                activeCategory === "ALL"
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                setActiveCategory("ALL")
              }
            >
              All
              <Badge
                variant="secondary"
                className="ml-2"
              >
                {recommendations.length}
              </Badge>
            </Button>

            {categories.map(
              (category) => (
                <Button
                  key={category}
                  type="button"
                  size="sm"
                  variant={
                    activeCategory ===
                    category
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setActiveCategory(
                      category,
                    )
                  }
                >
                  {formatRecommendationKey(
                    category,
                  )}

                  <Badge
                    variant="secondary"
                    className="ml-2"
                  >
                    {
                      categoryCounts[
                        category
                      ]
                    }
                  </Badge>
                </Button>
              ),
            )}
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
                placeholder="Search titles, descriptions, repositories, categories, or evidence..."
                className="pl-9"
              />
            </div>

            <select
              value={activeCategory}
              onChange={(event) =>
                setActiveCategory(
                  event.target.value,
                )
              }
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            >
              <option value="ALL">
                All categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {formatRecommendationKey(
                      category,
                    )}
                  </option>
                ),
              )}
            </select>

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target
                    .value as RecommendationSort,
                )
              }
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            >
              <option value="NEWEST">
                Newest first
              </option>

              <option value="OLDEST">
                Oldest first
              </option>

              <option value="REPOSITORY_ASC">
                Repository A to Z
              </option>

              <option value="REPOSITORY_DESC">
                Repository Z to A
              </option>

              <option value="CATEGORY_ASC">
                Category A to Z
              </option>
            </select>

            {hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>

            <CardContent>
        {!visibleRecommendations.length ? (
          <OrganizationEmptyState
            icon={Search}
            title="No matching recommendations"
            description="Try changing your search term or selected category."
          />
        ) : (
          <div className="space-y-5">
            {visibleRecommendations.map(
              (item, index) => {
                const recommendationId =
                  createRecommendationId(
                    item,
                    index,
                  );

                const expanded =
                  expandedRecommendations.has(
                    recommendationId,
                  );

                return (
                  <Card
                    key={recommendationId}
                    className="overflow-hidden transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                              >
                                #
                                {index + 1}
                              </Badge>

                              <Badge
                                variant={getCategoryBadgeVariant(
                                  item.recommendationKey,
                                )}
                              >
                                {formatRecommendationKey(
                                  item.recommendationKey,
                                )}
                              </Badge>
                            </div>

                            <h3 className="text-lg font-semibold leading-7">
                              {item.title}
                            </h3>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <Badge variant="secondary">
                                Repository
                              </Badge>

                              <span className="font-medium">
                                {
                                  item.repositoryName
                                }
                              </span>
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              toggleRecommendation(
                                recommendationId,
                              )
                            }
                          >
                            {expanded ? (
                              <>
                                <ChevronUp className="mr-2 h-4 w-4" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="mr-2 h-4 w-4" />
                                Show Details
                              </>
                            )}
                          </Button>
                        </div>

                        <div>
                          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Recommendation
                          </div>

                          <p className="leading-7 text-muted-foreground">
                            {item.description}
                          </p>
                        </div>

                        {expanded &&
                        item.evidence ? (
                          <div className="rounded-xl border bg-muted/30 p-5">
                            <div className="mb-3 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />

                              <span className="text-sm font-semibold">
                                Supporting Evidence
                              </span>
                            </div>

                            <p className="leading-7 text-muted-foreground">
                              {item.evidence}
                            </p>
                          </div>
                        ) : null}

                        <div className="flex flex-col gap-4 border-t pt-5 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />

                              <span>
                                Generated{" "}
                                {formatRecommendationDate(
                                  item.createdAt,
                                )}
                              </span>
                            </div>
                          </div>

                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                          >
                            <Link
                              href={`/repositories/${item.repositoryId}`}
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
"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  Calendar,
  Lightbulb,
  Search,
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

export default function OrganizationRecommendations({
  recommendations,
}: OrganizationRecommendationsProps) {
  const [searchTerm, setSearchTerm] =
    useState("");

  const [activeCategory, setActiveCategory] =
    useState("ALL");

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        recommendations.map(
          (item) =>
            item.recommendationKey,
        ),
      ),
    ).sort();
  }, [recommendations]);

  const visibleRecommendations =
    useMemo(() => {
      const normalizedSearch =
        searchTerm.trim().toLowerCase();

      return recommendations.filter(
        (item) => {
          const matchesCategory =
            activeCategory === "ALL" ||
            item.recommendationKey ===
              activeCategory;

          const matchesSearch =
            normalizedSearch.length === 0 ||
            item.title
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            item.description
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            item.repositoryName
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          return (
            matchesCategory &&
            matchesSearch
          );
        },
      );
    }, [
      activeCategory,
      recommendations,
      searchTerm,
    ]);

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
      <CardHeader className="space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Engineering Recommendations
            </CardTitle>

            <p className="mt-2 text-sm text-muted-foreground">
              Prioritized improvements generated from
              repository architecture and engineering
              analysis.
            </p>
          </div>

          <Badge variant="secondary">
            {visibleRecommendations.length} recommendations
          </Badge>
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
              placeholder="Search recommendations..."
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

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {formatRecommendationKey(
                  category,
                )}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>

      <CardContent>
        {!visibleRecommendations.length ? (
          <OrganizationEmptyState
            icon={Search}
            title="No matching recommendations"
            description="Try changing the search term or recommendation category."
          />
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {visibleRecommendations.map(
              (item, index) => (
                <Card
                  key={`${item.repositoryId}-${item.recommendationKey}-${index}`}
                  className="transition hover:border-primary/40"
                >
                  <CardContent className="flex h-full flex-col gap-5 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold">
                          {item.title}
                        </h3>

                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {
                            item.repositoryName
                          }
                        </p>
                      </div>

                      <Badge
                        variant="secondary"
                        className="shrink-0"
                      >
                        {formatRecommendationKey(
                          item.recommendationKey,
                        )}
                      </Badge>
                    </div>

                    <p className="text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>

                    {item.evidence ? (
                      <div className="rounded-lg border bg-muted/40 p-4">
                        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Evidence
                        </div>

                        <p className="text-sm leading-6">
                          {item.evidence}
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-auto flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-4 w-4" />

                        {new Date(
                          item.createdAt,
                        ).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
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
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
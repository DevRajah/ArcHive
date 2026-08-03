"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  ChevronDown,
  ChevronUp,
  Code2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import type {
  TeamTechnologyInventory,
} from "@/types/team.types";

interface TeamTechnologyInventoryProps {
  inventory: TeamTechnologyInventory;
}

export function TeamTechnologyInventory({
  inventory,
}: TeamTechnologyInventoryProps) {
  const [
    expandedTechnology,
    setExpandedTechnology,
  ] = useState<string | null>(null);

  const technologies = useMemo(
    () =>
      [...inventory.technologies].sort(
        (first, second) =>
          second.repositoryCount -
          first.repositoryCount,
      ),
    [inventory.technologies],
  );

  const highestUsage = Math.max(
    ...technologies.map(
      (technology) =>
        technology.repositoryCount,
    ),
    1,
  );

  if (!technologies.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-14 text-center">
          <Code2 className="mx-auto h-10 w-10 text-muted-foreground" />

          <h3 className="mt-4 text-lg font-semibold">
            No technologies detected
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Technology inventory will appear after repository analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>
              Technology Inventory
            </CardTitle>

            <p className="mt-2 text-sm text-muted-foreground">
              Technology adoption across team repositories.
            </p>
          </div>

          <Badge variant="secondary">
            {inventory.totalTechnologies} technologies
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {technologies.map((item) => {
          const isExpanded =
            expandedTechnology ===
            item.technology;

          const progress =
            (item.repositoryCount /
              highestUsage) *
            100;

          return (
            <div
              key={item.technology}
              className="rounded-xl border p-4"
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() =>
                  setExpandedTechnology(
                    isExpanded
                      ? null
                      : item.technology,
                  )
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {item.technology}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Used by {item.repositoryCount} repositories
                    </p>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                <Progress
                  value={progress}
                  className="mt-4"
                />
              </button>

              {isExpanded ? (
                <div className="mt-4 space-y-2 border-t pt-4">
                  {item.repositories.map(
                    (repository) => (
                      <div
                        key={
                          repository.repositoryId
                        }
                        className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {repository.repositoryName}
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {repository.repositoryFullName}
                          </p>
                        </div>

                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                        >
                          <a
                            href={`/repositories/${repository.repositoryId}`}
                          >
                            Open
                          </a>
                        </Button>
                      </div>
                    ),
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
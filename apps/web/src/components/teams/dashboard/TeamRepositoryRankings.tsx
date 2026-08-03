"use client";

import Link from "next/link";

import {
  AlertCircle,
  ArrowUpRight,
  GitBranch,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type {
  TeamRepositoryRanking,
} from "@/types/team.types";

interface TeamRepositoryRankingsProps {
  rankings: TeamRepositoryRanking[];
}

function formatScore(
  value: number | null,
) {
  if (
    value === null ||
    !Number.isFinite(value)
  ) {
    return "No score";
  }

  return Math.round(value).toString();
}

export function TeamRepositoryRankings({
  rankings,
}: TeamRepositoryRankingsProps) {
  if (!rankings.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-14 text-center">
          <GitBranch className="mx-auto h-10 w-10 text-muted-foreground" />

          <h3 className="mt-4 text-lg font-semibold">
            No repository rankings yet
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Attach repositories to this workspace to build team rankings.
          </p>
        </CardContent>
      </Card>
    );
  }

  const orderedRankings = [...rankings].sort(
    (first, second) =>
      (second.overallScore ?? -1) -
      (first.overallScore ?? -1),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Repository Rankings
        </CardTitle>

        <p className="text-sm text-muted-foreground">
          Engineering performance across shared repositories.
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {orderedRankings.map(
          (repository, index) => (
            <div
              key={repository.repositoryId}
              className="flex flex-col gap-4 rounded-xl border p-4 transition hover:border-primary/40 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted/30 font-bold">
                  {index + 1}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold">
                      {repository.repositoryName}
                    </h3>

                    {repository.analysisStatus ===
                    "COMPLETED" ? (
                      <Badge variant="secondary">
                        Analysed
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    )}

                    {repository.language ? (
                      <Badge variant="outline">
                        {repository.language}
                      </Badge>
                    ) : null}
                  </div>

                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {repository.repositoryFullName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Overall
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatScore(
                      repository.overallScore,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Architecture
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatScore(
                      repository.architectureScore,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Production
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatScore(
                      repository.productionReadinessScore,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Risk
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatScore(
                      repository.riskScore,
                    )}
                  </p>
                </div>
              </div>

              <Button
                asChild
                size="sm"
                variant="outline"
                className="shrink-0"
              >
                <Link
                  href={`/repositories/${repository.repositoryId}`}
                >
                  View Repository
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ),
        )}
      </CardContent>
    </Card>
  );
}
"use client";

import Link from "next/link";

import {
  ShieldAlert,
  AlertTriangle,
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
  OrganizationRiskSummary,
} from "@/types/organization.types";

interface Props {
  risks: OrganizationRiskSummary;
}

const levels = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
] as const;

export default function RiskOverview({
  risks,
}: Props) {
  return (
    <Card>

      <CardHeader>

        <CardTitle className="flex items-center gap-2">

          <ShieldAlert className="h-5 w-5" />

          Organization Risks

        </CardTitle>

      </CardHeader>

      <CardContent className="space-y-8">

        {levels.map((level) => {
          const repositories =
            risks.repositories.filter(
              (r) => r.riskLevel === level
            );

          if (!repositories.length)
            return null;

          return (
            <div
              key={level}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">

                <Badge>
                  {level}
                </Badge>

                <span className="font-medium">
                  {repositories.length} repositories
                </span>

              </div>

              <div className="grid gap-4">

                {repositories.map(
                  (repository) => (
                    <Card
                      key={
                        repository.repositoryId
                      }
                    >
                      <CardContent className="flex items-center justify-between p-5">

                        <div className="space-y-2">

                          <div className="font-semibold">
                            {
                              repository.repositoryName
                            }
                          </div>

                          <p className="text-sm text-muted-foreground">
                            {
                              repository.overallAssessment
                            }
                          </p>

                          <Badge
                            variant="outline"
                          >
                            {
                              repository.maturityLabel
                            }
                          </Badge>

                        </div>

                        <div className="flex items-center gap-4">

                          <Badge>
                            Risk{" "}
                            {
                              repository.overallRiskScore
                            }
                          </Badge>

                          <Button
                            asChild
                            size="sm"
                          >
                            <Link
                              href={`/repositories/${repository.repositoryId}`}
                            >
                              View Repository
                            </Link>
                          </Button>

                        </div>

                      </CardContent>
                    </Card>
                  )
                )}

              </div>

            </div>
          );
        })}

      </CardContent>

    </Card>
  );
}
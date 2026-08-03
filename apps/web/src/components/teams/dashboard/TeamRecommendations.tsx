import Link from "next/link";

import {
  Lightbulb,
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
  TeamRecommendation,
} from "@/types/team.types";

interface TeamRecommendationsProps {
  recommendations: TeamRecommendation[];
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

export function TeamRecommendations({
  recommendations,
}: TeamRecommendationsProps) {
  if (!recommendations.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-14 text-center">
          <Lightbulb className="mx-auto h-10 w-10 text-muted-foreground" />

          <h3 className="mt-4 text-lg font-semibold">
            No active recommendations
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Team-wide recommendations will appear after analysis.
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
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Team Recommendations
            </CardTitle>

            <p className="mt-2 text-sm text-muted-foreground">
              Actionable improvements across shared repositories.
            </p>
          </div>

          <Badge variant="secondary">
            {recommendations.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 xl:grid-cols-2">
        {recommendations.map(
          (recommendation) => (
            <Card
              key={recommendation.id}
              className="transition hover:border-primary/40"
            >
              <CardContent className="flex h-full flex-col gap-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">
                      {recommendation.title}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {recommendation.repositoryName}
                    </p>
                  </div>

                  <Badge variant="secondary">
                    {formatRecommendationKey(
                      recommendation.recommendationKey,
                    )}
                  </Badge>
                </div>

                <p className="text-sm leading-6 text-muted-foreground">
                  {recommendation.description}
                </p>

                {recommendation.evidence ? (
                  <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Evidence
                    </p>

                    <p className="mt-2 leading-6">
                      {recommendation.evidence}
                    </p>
                  </div>
                ) : null}

                <div className="mt-auto flex items-center justify-between border-t pt-4">
                  <Badge variant="outline">
                    {recommendation.status}
                  </Badge>

                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                  >
                    <Link
                      href={`/repositories/${recommendation.repositoryId}`}
                    >
                      View Repository
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ),
        )}
      </CardContent>
    </Card>
  );
}
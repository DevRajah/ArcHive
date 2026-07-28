"use client";

import Link from "next/link";

import {
  Lightbulb,
  Calendar,
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
  OrganizationRecommendation,
} from "@/types/organization.types";

interface Props {
  recommendations: OrganizationRecommendation[];
}

export default function OrganizationRecommendations({
  recommendations,
}: Props) {
  return (
    <Card>

      <CardHeader>

        <CardTitle className="flex items-center gap-2">

          <Lightbulb className="h-5 w-5" />

          Engineering Recommendations

        </CardTitle>

      </CardHeader>

      <CardContent>

        <div className="space-y-5">

          {recommendations.map((item) => (
            <Card key={item.repositoryId + item.recommendationKey}>

              <CardContent className="space-y-4 p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="font-semibold">
                      {item.title}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {item.repositoryName}
                    </p>

                  </div>

                  <Badge>
                    {item.recommendationKey
                      .replaceAll("_", " ")}
                  </Badge>

                </div>

                <p className="text-sm">
                  {item.description}
                </p>

                {item.evidence && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-3 text-sm">
                      {item.evidence}
                    </CardContent>
                  </Card>
                )}

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">

                    <Calendar className="h-4 w-4" />

                    {new Date(
                      item.createdAt
                    ).toLocaleDateString()}

                  </div>

                  <Button
                    asChild
                    size="sm"
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
          ))}

        </div>

      </CardContent>

    </Card>
  );
}
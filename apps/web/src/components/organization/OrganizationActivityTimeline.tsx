"use client";

import Link from "next/link";

import {
  GitBranch,
  Activity,
  History,
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
  OrganizationActivityResponse,
} from "@/types/organization.types";

interface Props {
  activity: OrganizationActivityResponse;
}

function getIcon(type: string) {
  switch (type) {
    case "ARCHITECTURE_CHANGE":
      return GitBranch;

    case "ENGINEERING_EVENT":
      return Activity;

    default:
      return History;
  }
}

export default function OrganizationActivityTimeline({
  activity,
}: Props) {
  return (
    <Card>

      <CardHeader>

        <CardTitle>
          Recent Engineering Activity
        </CardTitle>

      </CardHeader>

      <CardContent>

        <div className="space-y-5">

          {activity.items.map((item) => {

            const Icon = getIcon(item.type);

            return (
              <div
                key={item.id}
                className="flex gap-5 rounded-xl border p-5"
              >

                <div className="rounded-full bg-primary/10 p-3">

                  <Icon className="h-5 w-5 text-primary" />

                </div>

                <div className="flex-1">

                  <div className="mb-2 flex items-center gap-2">

                    <h3 className="font-semibold">
                      {item.title}
                    </h3>

                    <Badge variant="outline">
                      {item.type.replaceAll("_", " ")}
                    </Badge>

                  </div>

                  <p className="mb-3 text-sm text-muted-foreground">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between">

                    <div>

                      <div className="font-medium">
                        {item.repositoryName}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {new Date(
                          item.timestamp
                        ).toLocaleString()}
                      </div>

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

                </div>

              </div>
            );
          })}

        </div>

      </CardContent>

    </Card>
  );
}
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowUp,
  ArrowDown,
  Trophy,
  GitBranch,
  BrainCircuit,
  ShieldCheck,
  Layers3,
  ShieldAlert,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import type { OrganizationRepositoryRanking } from "@/types/organization.types";

interface Props {
  repositories: OrganizationRepositoryRanking[];
}

type SortKey =
  | "overallScore"
  | "architectureScore"
  | "engineeringQualityScore"
  | "productionReadinessScore"
  | "maturityScore"
  | "riskScore";

const tabs: {
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

export default function RepositoryRankings({
  repositories,
}: Props) {
  const [activeTab, setActiveTab] =
    useState<SortKey>("overallScore");

  const sorted = useMemo(() => {
    const items = [...repositories];

    items.sort((a, b) => {
      if (activeTab === "riskScore") {
        return b.riskScore - a.riskScore;
      }

      return (
        b[activeTab] -
        a[activeTab]
      );
    });

    return items;
  }, [repositories, activeTab]);

  return (
    <Card>

      <CardHeader>

        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Repository Rankings
        </CardTitle>

      </CardHeader>

      <CardContent>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as SortKey)
          }
        >
          <TabsList className="mb-6 flex flex-wrap">

            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
              >
                {tab.label}
              </TabsTrigger>
            ))}

          </TabsList>

          {tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
            >

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="border-b">

                      <th className="py-3 text-left">
                        Rank
                      </th>

                      <th className="py-3 text-left">
                        Repository
                      </th>

                      <th className="py-3 text-left">
                        Language
                      </th>

                      <th className="py-3 text-left">
                        Score
                      </th>

                      <th className="py-3 text-left">
                        Activity
                      </th>

                      <th className="py-3 text-right">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {sorted.map((repo, index) => {

                      const score =
                        repo[activeTab];

                      return (
                        <tr
                          key={repo.repositoryId}
                          className="border-b transition hover:bg-muted/40"
                        >

                          <td className="py-4">

                            <Badge variant="secondary">
                              #{index + 1}
                            </Badge>

                          </td>

                          <td className="py-4">

                            <div className="font-medium">
                              {repo.repositoryName}
                            </div>

                            <div className="text-xs text-muted-foreground">
                              {repo.repositoryFullName}
                            </div>

                          </td>

                          <td className="py-4">

                            {repo.language ?? "-"}

                          </td>

                          <td className="py-4">

                            <div className="flex items-center gap-2">

                              {activeTab ===
                              "riskScore" ? (
                                <ArrowUp className="h-4 w-4 text-red-500" />
                              ) : (
                                <ArrowUp className="h-4 w-4 text-green-500" />
                              )}

                              <span className="font-semibold">
                                {score}
                              </span>

                            </div>

                          </td>

                          <td className="py-4">

                            <div className="flex flex-wrap gap-2">

                              <Badge variant="outline">
                                {repo.engineeringEventCount} events
                              </Badge>

                              <Badge variant="outline">
                                {repo.architectureChangeCount} architecture
                              </Badge>

                              <Badge variant="outline">
                                {repo.recommendationCount} recommendations
                              </Badge>

                            </div>

                          </td>

                          <td className="py-4 text-right">

                            <Button
                              asChild
                              size="sm"
                            >
                              <Link
                                href={`/repositories/${repo.repositoryId}`}
                              >
                                View Repository
                              </Link>
                            </Button>

                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>

            </TabsContent>
          ))}

        </Tabs>

      </CardContent>

    </Card>
  );
}
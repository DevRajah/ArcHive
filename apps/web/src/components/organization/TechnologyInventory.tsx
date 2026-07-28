"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Boxes,
  Cloud,
  Code2,
  Cpu,
  Database,
  GitBranch,
  Search,
  TestTube2,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import OrganizationEmptyState from "@/components/organization/OrganizationEmptyState";

import type {
  OrganizationTechnologyInventory,
} from "@/types/organization.types";

interface TechnologyInventoryProps {
  technology: OrganizationTechnologyInventory;
}

const CATEGORY_MAP: Record<
  string,
  string
> = {
  TypeScript: "Languages",
  JavaScript: "Languages",
  Python: "Languages",
  Java: "Languages",
  Go: "Languages",
  Rust: "Languages",
  PHP: "Languages",
  Ruby: "Languages",
  CSharp: "Languages",
  "C#": "Languages",

  Express: "Frameworks",
  Fastify: "Frameworks",
  NestJS: "Frameworks",
  React: "Frameworks",
  "Next.js": "Frameworks",
  Vue: "Frameworks",
  Angular: "Frameworks",
  Svelte: "Frameworks",

  PostgreSQL: "Databases",
  MongoDB: "Databases",
  MySQL: "Databases",
  MariaDB: "Databases",
  SQLite: "Databases",
  DynamoDB: "Databases",
  Prisma: "Databases",
  Sequelize: "Databases",

  AWS: "Cloud",
  Azure: "Cloud",
  GCP: "Cloud",
  Vercel: "Cloud",
  Railway: "Cloud",
  Render: "Cloud",
  Fly: "Cloud",

  Docker: "Infrastructure",
  Kubernetes: "Infrastructure",
  Redis: "Infrastructure",
  BullMQ: "Infrastructure",
  RabbitMQ: "Infrastructure",
  Kafka: "Infrastructure",
  Terraform: "Infrastructure",
  Nginx: "Infrastructure",

  OpenAI: "AI",
  Anthropic: "AI",
  LangChain: "AI",
  Gemini: "AI",

  Jest: "Testing",
  Vitest: "Testing",
  Cypress: "Testing",
  Playwright: "Testing",
  Supertest: "Testing",
  Mocha: "Testing",
};

const CATEGORY_ICONS = {
  Languages: Code2,
  Frameworks: Boxes,
  Databases: Database,
  Cloud,
  Infrastructure: Cpu,
  Testing: TestTube2,
  AI: GitBranch,
  Other: Boxes,
};

function normalizeCategory(
  technologyName: string,
) {
  return (
    CATEGORY_MAP[technologyName] ??
    "Other"
  );
}

export default function TechnologyInventory({
  technology,
}: TechnologyInventoryProps) {
  const [searchTerm, setSearchTerm] =
    useState("");

  const technologies =
    technology.technologies ?? [];

  const filteredTechnologies =
    useMemo(() => {
      const normalizedSearch =
        searchTerm.trim().toLowerCase();

      if (!normalizedSearch) {
        return technologies;
      }

      return technologies.filter(
        (item) =>
          item.technology
            .toLowerCase()
            .includes(
              normalizedSearch,
            ),
      );
    }, [
      searchTerm,
      technologies,
    ]);

  const groupedTechnologies =
    useMemo(() => {
      return filteredTechnologies.reduce<
        Record<
          string,
          typeof filteredTechnologies
        >
      >((groups, item) => {
        const category =
          normalizeCategory(
            item.technology,
          );

        if (!groups[category]) {
          groups[category] = [];
        }

        groups[category].push(item);

        return groups;
      }, {});
    }, [filteredTechnologies]);

  const chartData = useMemo(() => {
    return [...filteredTechnologies]
      .sort(
        (first, second) =>
          second.repositoryCount -
          first.repositoryCount,
      )
      .slice(0, 12);
  }, [filteredTechnologies]);

  const totalUsageCount =
    useMemo(() => {
      return technologies.reduce(
        (sum, item) =>
          sum +
          item.repositoryCount,
        0,
      );
    }, [technologies]);

  if (!technologies.length) {
    return (
      <OrganizationEmptyState
        icon={Code2}
        title="No technologies detected"
        description="Technology usage will appear after ArcHive completes repository analysis and identifies languages, frameworks, databases, infrastructure, and development tools."
      />
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Technology Inventory
            </CardTitle>

            <p className="mt-2 text-sm text-muted-foreground">
              Technologies detected
              across tracked repositories.
            </p>
          </div>

          <div className="flex gap-2">
            <Badge variant="secondary">
              {technologies.length} technologies
            </Badge>

            <Badge variant="outline">
              {totalUsageCount} usages
            </Badge>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value,
              )
            }
            placeholder="Search technologies..."
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {!filteredTechnologies.length ? (
          <OrganizationEmptyState
            icon={Search}
            title="No matching technologies"
            description="Try searching for another language, framework, database, or infrastructure tool."
          />
        ) : (
          <>
            <div className="rounded-xl border p-4">
              <div className="mb-5">
                <h3 className="font-semibold">
                  Most Used Technologies
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Top technologies ranked
                  by repository usage.
                </p>
              </div>

              <div className="h-[340px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 20,
                      left: 15,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                    />

                    <XAxis
                      type="number"
                      allowDecimals={false}
                    />

                    <YAxis
                      type="category"
                      dataKey="technology"
                      width={95}
                      tick={{
                        fontSize: 12,
                      }}
                    />

                    <Tooltip
                      formatter={(
                        value,
                      ) => [
                        `${value} repositories`,
                        "Usage",
                      ]}
                    />

                    <Bar
                      dataKey="repositoryCount"
                      radius={[
                        0,
                        6,
                        6,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(
                groupedTechnologies,
              )
                .sort(
                  (
                    [firstCategory],
                    [secondCategory],
                  ) =>
                    firstCategory.localeCompare(
                      secondCategory,
                    ),
                )
                .map(
                  ([
                    category,
                    items,
                  ]) => {
                    const Icon =
                      CATEGORY_ICONS[
                        category as keyof typeof CATEGORY_ICONS
                      ] ??
                      Boxes;

                    const repositoryUsage =
                      items.reduce(
                        (
                          total,
                          item,
                        ) =>
                          total +
                          item.repositoryCount,
                        0,
                      );

                    return (
                      <div
                        key={category}
                        className="rounded-xl border p-5 transition hover:border-primary/30"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                              <Icon className="h-4 w-4" />
                            </div>

                            <div>
                              <h3 className="font-semibold">
                                {category}
                              </h3>

                              <p className="text-xs text-muted-foreground">
                                {
                                  items.length
                                }{" "}
                                detected
                              </p>
                            </div>
                          </div>

                          <Badge variant="outline">
                            {
                              repositoryUsage
                            }{" "}
                            usages
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {[...items]
                            .sort(
                              (
                                first,
                                second,
                              ) =>
                                second.repositoryCount -
                                first.repositoryCount,
                            )
                            .map(
                              (item) => (
                                <Badge
                                  key={
                                    item.technology
                                  }
                                  variant="secondary"
                                  className="gap-1.5"
                                >
                                  {
                                    item.technology
                                  }

                                  <span className="rounded-full bg-background/60 px-1.5 py-0.5 text-[10px]">
                                    {
                                      item.repositoryCount
                                    }
                                  </span>
                                </Badge>
                              ),
                            )}
                        </div>
                      </div>
                    );
                  },
                )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
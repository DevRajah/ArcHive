"use client";

import { useMemo } from "react";
import {
  Code2,
  Database,
  Cloud,
  Boxes,
  Cpu,
  TestTube2,
  GitBranch,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import type {
  OrganizationTechnologyInventory,
} from "@/types/organization.types";

interface Props {
  technology: OrganizationTechnologyInventory;
}

const CATEGORY_MAP: Record<string, string> = {
  TypeScript: "Languages",
  JavaScript: "Languages",
  Python: "Languages",
  Java: "Languages",
  Go: "Languages",

  Express: "Frameworks",
  Fastify: "Frameworks",
  React: "Frameworks",
  "Next.js": "Frameworks",
  Vue: "Frameworks",

  PostgreSQL: "Databases",
  MongoDB: "Databases",
  MySQL: "Databases",

  AWS: "Cloud",
  Azure: "Cloud",
  Vercel: "Cloud",
  Railway: "Cloud",
  Render: "Cloud",

  Docker: "Infrastructure",
  Kubernetes: "Infrastructure",
  Redis: "Infrastructure",
  BullMQ: "Infrastructure",
  RabbitMQ: "Infrastructure",
  Kafka: "Infrastructure",

  OpenAI: "AI",
  Anthropic: "AI",
  LangChain: "AI",

  Jest: "Testing",
  Vitest: "Testing",
  Cypress: "Testing",
  Playwright: "Testing",
  Supertest: "Testing",
};

const ICONS: Record<string, React.ReactNode> = {
  Languages: <Code2 className="h-5 w-5" />,
  Frameworks: <Boxes className="h-5 w-5" />,
  Databases: <Database className="h-5 w-5" />,
  Cloud: <Cloud className="h-5 w-5" />,
  Infrastructure: <Cpu className="h-5 w-5" />,
  Testing: <TestTube2 className="h-5 w-5" />,
  AI: <GitBranch className="h-5 w-5" />,
};

export default function TechnologyInventory({
  technology,
}: Props) {
  const grouped = useMemo(() => {
    const map: Record<
      string,
      typeof technology.technologies
    > = {};

    technology.technologies.forEach((item) => {
      const category =
        CATEGORY_MAP[item.technology] ?? "Other";

      if (!map[category]) map[category] = [];

      map[category].push(item);
    });

    return map;
  }, [technology]);

  return (
    <div className="space-y-6">
      <Card>

        <CardHeader>

          <CardTitle>
            Technology Inventory
          </CardTitle>

        </CardHeader>

        <CardContent>

          <div className="mb-8 h-80">

            <ResponsiveContainer>

              <BarChart
                data={technology.technologies}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="technology"
                />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="repositoryCount"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {Object.entries(grouped).map(
              ([category, items]) => (
                <Card
                  key={category}
                >
                  <CardContent className="space-y-5 p-5">

                    <div className="flex items-center gap-2">

                      {ICONS[category]}

                      <h3 className="font-semibold">
                        {category}
                      </h3>

                    </div>

                    <div className="flex flex-wrap gap-2">

                      {items.map((tech) => (
                        <Badge
                          key={tech.technology}
                          variant="secondary"
                        >
                          {tech.technology} (
                          {tech.repositoryCount})
                        </Badge>
                      ))}

                    </div>

                  </CardContent>
                </Card>
              )
            )}

          </div>

        </CardContent>

      </Card>
    </div>
  );
}
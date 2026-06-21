"use client";

import {
  Activity,
  BrainCircuit,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Props {
  summary?: {
    overallEngineeringScore?: number;
    repositoriesAnalyzed?: number;
    averageHealthScore?: number;
    averageMaturityScore?: number;
    averageQualityScore?: number;
  };
}

export function PortfolioHealthOverview({ summary }: Props) {
  const overall = summary?.overallEngineeringScore ?? 0;

  const cards = [
    {
      label: "Repositories",
      value: summary?.repositoriesAnalyzed ?? 0,
      icon: BrainCircuit,
    },
    {
      label: "Health",
      value: summary?.averageHealthScore ?? 0,
      icon: ShieldCheck,
    },
    {
      label: "Maturity",
      value: summary?.averageMaturityScore ?? 0,
      icon: Sparkles,
    },
    {
      label: "Quality",
      value: summary?.averageQualityScore ?? 0,
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Overall Engineering Score
              </p>

              <h2 className="mt-2 text-5xl font-bold">{overall}</h2>

              <Progress value={overall} className="mt-6 h-3" />
            </div>

            <div className="rounded-2xl bg-primary/10 p-6">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label}>
              <CardContent className="p-6">
                <Icon className="mb-4 h-6 w-6 text-primary" />

                <div className="text-3xl font-bold">{card.value}</div>

                <p className="mt-1 text-sm text-muted-foreground">
                  {card.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
"use client";

import { CheckCircle2, CircleDashed, Database } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Props {
  analyzedRepositories: number;
  unanalyzedRepositories: number;
  coverage: number;
}

export default function AnalysisCoverageCard({
  analyzedRepositories,
  unanalyzedRepositories,
  coverage,
}: Props) {
  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Database className="h-6 w-6 text-primary" />

          <div>
            <h3 className="font-semibold">
              Analysis Coverage
            </h3>

            <p className="text-sm text-muted-foreground">
              Repository intelligence coverage
            </p>
          </div>
        </div>

        <Progress value={coverage} />

        <div className="grid gap-4 md:grid-cols-3">

          <div>
            <div className="mb-1 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />

              <span className="text-sm text-muted-foreground">
                Analysed
              </span>
            </div>

            <p className="text-2xl font-bold">
              {analyzedRepositories}
            </p>
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <CircleDashed className="h-4 w-4 text-yellow-500" />

              <span className="text-sm text-muted-foreground">
                Pending
              </span>
            </div>

            <p className="text-2xl font-bold">
              {unanalyzedRepositories}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Coverage
            </p>

            <p className="text-2xl font-bold">
              {coverage.toFixed(0)}%
            </p>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
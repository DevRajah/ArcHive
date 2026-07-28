"use client";

import { ArrowUpRight, Minus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface Props {
  title: string;
  value: number | string | null;
  icon: React.ReactNode;
  description?: string;
}

export default function OverviewMetricCard({
  title,
  value,
  icon,
  description,
}: Props) {
  return (
    <Card className="transition-all hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="space-y-5 p-6">

        <div className="flex items-center justify-between">
          {icon}

          <ArrowUpRight className="h-4 w-4 text-green-500" />
        </div>

        <div>

          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold">

            {value === null
              ? "Not analysed"
              : value}

          </h2>

          {description && (
            <p className="mt-2 text-xs text-muted-foreground">
              {description}
            </p>
          )}

        </div>

      </CardContent>
    </Card>
  );
}
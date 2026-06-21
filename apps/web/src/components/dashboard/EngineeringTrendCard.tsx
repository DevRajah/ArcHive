"use client";

import { TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface Props {
  title: string;
  value: string;
}

export function EngineeringTrendCard({
  title,
  value,
}: Props) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <h2 className="mt-2 text-xl font-bold">
            {value}
          </h2>
        </div>

        <TrendingUp className="h-8 w-8 text-primary" />
      </CardContent>
    </Card>
  );
}
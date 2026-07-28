"use client";

import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

interface ExecutiveStatProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function ExecutiveStat({
  icon,
  title,
  value,
  subtitle,
}: ExecutiveStatProps) {
  return (
    <Card className="p-5 transition hover:border-primary/30">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {value}
          </h2>

          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <div className="rounded-xl border bg-muted p-3">
          {icon}
        </div>
      </div>
    </Card>
  );
}
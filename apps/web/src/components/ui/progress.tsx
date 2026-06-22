"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number | null;
}

export function Progress({ value = 0, className, ...props }: ProgressProps) {
  const safeValue =
    typeof value === "number" && !Number.isNaN(value)
      ? Math.min(Math.max(value, 0), 100)
      : 0;

  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 rounded-full bg-primary transition-all"
        style={{
          transform: `translateX(-${100 - safeValue}%)`,
        }}
      />
    </div>
  );
}
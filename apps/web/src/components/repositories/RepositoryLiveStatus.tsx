"use client";

import { Radio } from "lucide-react";

interface RepositoryLiveStatusProps {
  isConnected: boolean;
  lastUpdatedAt: string | null;
}

function formatLastUpdated(lastUpdatedAt: string | null) {
  if (!lastUpdatedAt) return "Waiting for repository activity";

  return "Updated just now";
}

export function RepositoryLiveStatus({
  isConnected,
  lastUpdatedAt,
}: RepositoryLiveStatusProps) {
  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
      <Radio
        className={`h-3.5 w-3.5 ${
          isConnected ? "text-emerald-500" : "text-muted-foreground"
        }`}
      />

      <span>
        {isConnected
          ? "Live repository intelligence connected"
          : "Live repository intelligence offline"}
      </span>

      <span className="hidden text-muted-foreground sm:inline">•</span>

      <span>{formatLastUpdated(lastUpdatedAt)}</span>
    </div>
  );
}
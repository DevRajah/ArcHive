"use client";

import { Brain, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RepositoryConfidencePanelProps {
  confidence?: {
    confidenceScore: number;
    confidenceLevel: string;
  };

  reasoningSignals?: string[];
}

export function RepositoryConfidencePanel({
  confidence,
  reasoningSignals,
}: RepositoryConfidencePanelProps) {
  if (!confidence && (!reasoningSignals || reasoningSignals.length === 0)) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      {confidence && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Intelligence Confidence</p>
          </div>

          <Badge variant="secondary">
            {confidence.confidenceLevel} Confidence ·{" "}
            {confidence.confidenceScore}%
          </Badge>
        </div>
      )}

      {reasoningSignals && reasoningSignals.length > 0 && (
        <div className={confidence ? "mt-4" : ""}>
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Reasoning Signals</p>
          </div>

          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {reasoningSignals.map((signal) => (
              <li key={signal} className="rounded-lg border border-border p-3">
                {signal}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
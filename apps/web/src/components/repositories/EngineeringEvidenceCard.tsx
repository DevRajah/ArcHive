"use client";

import { Brain, Cpu, Layers3, Network } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatFilterLabel } from "@/lib/filters";

interface EngineeringEvidenceCardProps {
  domains?: string[];
  technologies?: string[];
  repositoryTypes?: string[];
  reasoningSignals?: string[];
}

function EvidenceSection({
  title,
  items,
  variant = "secondary",
}: {
  title: string;
  items?: string[];
  variant?: "default" | "secondary" | "outline";
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-sm font-medium">{title}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge key={`${item}-${index}`} variant={variant}>
            {title === "Detected Technologies" ? item : formatFilterLabel(item)}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function EngineeringEvidenceCard({
  domains,
  technologies,
  repositoryTypes,
  reasoningSignals,
}: EngineeringEvidenceCardProps) {
  const hasEvidence =
    Boolean(domains?.length) ||
    Boolean(technologies?.length) ||
    Boolean(repositoryTypes?.length) ||
    Boolean(reasoningSignals?.length);

  if (!hasEvidence) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Brain className="h-4 w-4 text-primary" />
        </div>

        <div>
          <h2 className="text-lg font-semibold">Engineering Evidence</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            ArcHive used these repository signals to support its intelligence
            conclusions.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <EvidenceSection
          title="Architecture Domains"
          items={domains}
          variant="secondary"
        />

        <EvidenceSection
          title="Detected Technologies"
          items={technologies}
          variant="outline"
        />

        <EvidenceSection
          title="Repository Types"
          items={repositoryTypes}
          variant="default"
        />

        {reasoningSignals && reasoningSignals.length > 0 && (
          <div className="rounded-xl border border-border bg-background p-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Reasoning Signals</p>
            </div>

            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {reasoningSignals.map((signal, index) => (
                <li
                  key={`${signal}-${index}`}
                  className="rounded-lg border border-border bg-card p-3"
                >
                  {signal}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
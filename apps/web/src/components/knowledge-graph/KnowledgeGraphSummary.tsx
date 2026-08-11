"use client";

import type { LucideIcon } from "lucide-react";

import {
  Boxes,
  CircleDot,
  GitCompareArrows,
  Layers3,
  Network,
  Puzzle,
  Share2,
  Workflow,
} from "lucide-react";

import type {
  KnowledgeGraphSummary as KnowledgeGraphSummaryData,
} from "@/types/knowledge-graph.types";

interface SummaryItem {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
}

interface KnowledgeGraphSummaryProps {
  summary?: KnowledgeGraphSummaryData;
  showRepositories?: boolean;
  showSimilarity?: boolean;
}

/**
 * Keeps the summary cards defensive.
 *
 * The backend should always return numeric totals, but if a field is
 * temporarily missing during development, the UI should still render
 * safely instead of crashing.
 */
function safeNumber(value?: number | null) {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : 0;
}

export function KnowledgeGraphSummary({
  summary,
  showRepositories = false,
  showSimilarity = false,
}: KnowledgeGraphSummaryProps) {
  const items: SummaryItem[] = [
    ...(showRepositories
      ? [
          {
            label: "Repositories",
            value: safeNumber(
              summary?.totalRepositories,
            ),
            description:
              "Repository nodes represented in this graph.",
            icon: Boxes,
          },
        ]
      : []),

    {
      label: "Graph Nodes",
      value: safeNumber(
        summary?.totalNodes,
      ),
      description:
        "All engineering entities represented in the graph.",
      icon: CircleDot,
    },

    {
      label: "Relationships",
      value: safeNumber(
        summary?.totalEdges,
      ),
      description:
        "Connections detected between graph entities.",
      icon: Share2,
    },

    {
      label: "Technologies",
      value: safeNumber(
        summary?.totalTechnologies,
      ),
      description:
        "Technology nodes detected across the graph.",
      icon: Workflow,
    },

    {
      label: "Architecture Domains",
      value: safeNumber(
        summary?.totalArchitectureDomains,
      ),
      description:
        "Architecture domains represented in the graph.",
      icon: Layers3,
    },

    {
      label: "Repository Types",
      value: safeNumber(
        summary?.totalRepositoryTypes,
      ),
      description:
        "Repository classifications represented in the graph.",
      icon: Network,
    },

    {
      label: "Capabilities",
      value: safeNumber(
        summary?.totalCapabilities,
      ),
      description:
        "Engineering capabilities connected to repositories.",
      icon: Puzzle,
    },

    ...(showSimilarity
      ? [
          {
            label: "Similarity Relationships",
            value: safeNumber(
              summary?.similarityRelationships,
            ),
            description:
              "Repository-to-repository similarity connections.",
            icon: GitCompareArrows,
          },
        ]
      : []),
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {item.label}
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {item.value.toLocaleString()}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
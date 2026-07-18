"use client";

import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Braces,
  CircleDot,
  GitCompareArrows,
  Layers3,
  Network,
  Puzzle,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { formatIntelligenceLabel } from "@/lib/intelligence-labels";

import type {
  KnowledgeGraphEdge,
  KnowledgeGraphNode,
} from "@/types/knowledge-graph.types";

interface KnowledgeGraphDetailsPanelProps {
  selectedNode?: KnowledgeGraphNode | null;
  selectedEdge?: KnowledgeGraphEdge | null;
  onClose: () => void;
}

function getNodeIcon(type?: string) {
  switch (type) {
    case "REPOSITORY":
      return Boxes;

    case "TECHNOLOGY":
      return Braces;

    case "ARCHITECTURE_DOMAIN":
      return Layers3;

    case "REPOSITORY_TYPE":
      return Network;

    case "CAPABILITY":
      return Puzzle;

    default:
      return CircleDot;
  }
}

function getMetadataEntries(
  metadata?: Record<string, unknown> | null
) {
  if (!metadata) return [];

  return Object.entries(metadata).filter(([, value]) => {
    return (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      Array.isArray(value)
    );
  });
}

function formatMetadataValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).join(", ");
  }

  return String(value);
}

export function KnowledgeGraphDetailsPanel({
  selectedNode,
  selectedEdge,
  onClose,
}: KnowledgeGraphDetailsPanelProps) {
  if (!selectedNode && !selectedEdge) {
    return null;
  }

  if (selectedEdge) {
    return (
      <aside className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <GitCompareArrows className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Graph Relationship
              </p>

              <h2 className="mt-1 text-lg font-semibold">
                {selectedEdge.label ||
                  selectedEdge.relationship ||
                  formatIntelligenceLabel(
                    selectedEdge.type || "RELATIONSHIP"
                  )}
              </h2>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close details</span>
          </Button>
        </div>

        <div className="mt-5 space-y-3">
          <DetailRow
            label="Source"
            value={selectedEdge.source}
          />

          <DetailRow
            label="Target"
            value={selectedEdge.target}
          />

          <DetailRow
            label="Relationship"
            value={formatIntelligenceLabel(
              selectedEdge.type ||
                selectedEdge.relationship ||
                "RELATIONSHIP"
            )}
          />
        </div>

        {selectedEdge.similarity && (
          <div className="mt-5 rounded-xl border border-border bg-background p-4">
            <p className="font-medium">
              Repository Similarity
            </p>

            <div className="mt-3">
              <Badge variant="secondary">
                {Math.round(
                  (selectedEdge.similarity.similarityScore ?? 0) *
                    ((selectedEdge.similarity.similarityScore ?? 0) <= 1
                      ? 100
                      : 1)
                )}
                % similar
              </Badge>
            </div>

            <SimilarityGroup
              title="Shared Technologies"
              items={
                selectedEdge.similarity.sharedTechnologies
              }
            />

            <SimilarityGroup
              title="Shared Architecture Domains"
              items={
                selectedEdge.similarity
                  .sharedArchitectureDomains
              }
            />

            <SimilarityGroup
              title="Shared Capabilities"
              items={
                selectedEdge.similarity.sharedCapabilities
              }
            />

            <SimilarityGroup
              title="Shared Repository Types"
              items={
                selectedEdge.similarity.sharedRepositoryTypes
              }
            />
          </div>
        )}

        <MetadataList metadata={selectedEdge.metadata} />
      </aside>
    );
  }

  if (!selectedNode) {
    return null;
  }

  const Icon = getNodeIcon(selectedNode.type);
  const repositoryId =
    selectedNode.type === "REPOSITORY"
      ? selectedNode.id
      : null;

  return (
    <aside className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>

          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              Selected Graph Node
            </p>

            <h2 className="mt-1 break-words text-lg font-semibold">
              {selectedNode.label}
            </h2>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close details</span>
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        <DetailRow
          label="Type"
          value={formatIntelligenceLabel(selectedNode.type)}
        />

        <DetailRow
          label="Label"
          value={selectedNode.label}
        />

        <DetailRow
          label="Value"
          value={selectedNode.value || selectedNode.label}
        />
      </div>

      <MetadataList metadata={selectedNode.metadata} />

      {repositoryId && (
        <div className="mt-6 space-y-2">
          <p className="text-sm font-medium">
            Repository Pages
          </p>

          <RepositoryLink
            href={`/repositories/${repositoryId}`}
            label="Repository Overview"
          />

          <RepositoryLink
            href={`/repositories/${repositoryId}/architecture`}
            label="Architecture"
          />

          <RepositoryLink
            href={`/repositories/${repositoryId}/timeline`}
            label="Timeline"
          />

          <RepositoryLink
            href={`/repositories/${repositoryId}/intelligence`}
            label="Intelligence"
          />

          <RepositoryLink
            href={`/repositories/${repositoryId}/knowledge-graph`}
            label="Knowledge Graph"
          />

          <RepositoryLink
            href={`/repositories/${repositoryId}/intelligence/diff`}
            label="Intelligence Diff"
          />
        </div>
      )}
    </aside>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium">
        {value}
      </p>
    </div>
  );
}

function MetadataList({
  metadata,
}: {
  metadata?: Record<string, unknown> | null;
}) {
  const entries = getMetadataEntries(metadata);

  if (entries.length === 0) {
    return (
      <div className="mt-5 rounded-lg border border-dashed border-border p-4">
        <p className="text-sm text-muted-foreground">
          No additional metadata is available.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <p className="text-sm font-medium">Metadata</p>

      <div className="mt-3 space-y-2">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="rounded-lg border border-border bg-background p-3"
          >
            <p className="text-xs text-muted-foreground">
              {formatIntelligenceLabel(key)}
            </p>

            <p className="mt-1 break-words text-sm">
              {formatMetadataValue(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimilarityGroup({
  title,
  items,
}: {
  title: string;
  items?: string[];
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <p className="text-xs font-medium text-muted-foreground">
        {title}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge
            key={`${title}-${item}-${index}`}
            variant="outline"
          >
            {formatIntelligenceLabel(item)}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function RepositoryLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Button
      asChild
      variant="outline"
      className="w-full justify-between"
    >
      <Link href={href}>
        {label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );
}
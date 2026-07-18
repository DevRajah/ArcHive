"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

import type {
  KnowledgeGraphFilterState,
  KnowledgeGraphNode,
} from "@/types/knowledge-graph.types";

interface KnowledgeGraphFiltersProps {
  nodes: KnowledgeGraphNode[];
  filters: KnowledgeGraphFilterState;
  onChange: (
    filters: KnowledgeGraphFilterState
  ) => void;
}

function getUniqueValues(
  nodes: KnowledgeGraphNode[],
  type: string
) {
  return Array.from(
    new Set(
      nodes
        .filter((node) => node.type === type)
        .map((node) => node.value || node.label)
        .filter(Boolean)
    )
  ).sort((first, second) =>
    first.localeCompare(second)
  );
}

export function KnowledgeGraphFilters({
  nodes,
  filters,
  onChange,
}: KnowledgeGraphFiltersProps) {
  const repositories = getUniqueValues(
    nodes,
    "REPOSITORY"
  );

  const technologies = getUniqueValues(
    nodes,
    "TECHNOLOGY"
  );

  const architectureDomains = getUniqueValues(
    nodes,
    "ARCHITECTURE_DOMAIN"
  );

  const capabilities = getUniqueValues(
    nodes,
    "CAPABILITY"
  );

  const repositoryTypes = getUniqueValues(
    nodes,
    "REPOSITORY_TYPE"
  );

  const hasActiveFilters =
    Boolean(filters.repository) ||
    Boolean(filters.technology) ||
    Boolean(filters.architectureDomain) ||
    Boolean(filters.capability) ||
    Boolean(filters.repositoryType) ||
    filters.similarityOnly;

  function updateFilter(
    key: keyof KnowledgeGraphFilterState,
    value: string | boolean
  ) {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  function resetFilters() {
    onChange({
      repository: "",
      technology: "",
      architectureDomain: "",
      capability: "",
      repositoryType: "",
      similarityOnly: false,
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <FilterSelect
          label="Repository"
          value={filters.repository}
          options={repositories}
          onChange={(value) =>
            updateFilter("repository", value)
          }
        />

        <FilterSelect
          label="Technology"
          value={filters.technology}
          options={technologies}
          onChange={(value) =>
            updateFilter("technology", value)
          }
        />

        <FilterSelect
          label="Architecture Domain"
          value={filters.architectureDomain}
          options={architectureDomains}
          onChange={(value) =>
            updateFilter(
              "architectureDomain",
              value
            )
          }
        />

        <FilterSelect
          label="Capability"
          value={filters.capability}
          options={capabilities}
          onChange={(value) =>
            updateFilter("capability", value)
          }
        />

        <FilterSelect
          label="Repository Type"
          value={filters.repositoryType}
          options={repositoryTypes}
          onChange={(value) =>
            updateFilter("repositoryType", value)
          }
        />

        <div className="flex items-end gap-3">
          <label className="flex h-10 flex-1 items-center gap-3 rounded-md border border-input bg-background px-3 text-sm">
            <input
              type="checkbox"
              checked={filters.similarityOnly}
              onChange={(event) =>
                updateFilter(
                  "similarityOnly",
                  event.target.checked
                )
              }
            />

            Similarity relationships only
          </label>

          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!hasActiveFilters}
            onClick={resetFilters}
          >
            <RotateCcw className="h-4 w-4" />

            <span className="sr-only">
              Reset filters
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-medium text-muted-foreground">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="">
          All {label.toLowerCase()} values
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
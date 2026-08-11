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

interface FilterOption {
  value: string;
  label: string;
}

/**
 * Most knowledge graph filters use the same value for both filtering
 * and display, so we can keep those as simple strings.
 */
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

/**
 * Repository nodes are slightly different.
 *
 * Their value is the repository ID used internally by the graph,
 * while their label contains the human-readable repository name.
 *
 * We keep both so the filter can use the stable repository ID
 * without exposing UUIDs in the UI.
 */
function getRepositoryOptions(
  nodes: KnowledgeGraphNode[]
): FilterOption[] {
  const repositories = nodes
    .filter((node) => node.type === "REPOSITORY")
    .map((node) => ({
      value: node.value || node.id,
      label: node.label || node.value || node.id,
    }));

  const uniqueRepositories = new Map<
    string,
    FilterOption
  >();

  repositories.forEach((repository) => {
    if (!uniqueRepositories.has(repository.value)) {
      uniqueRepositories.set(
        repository.value,
        repository
      );
    }
  });

  return Array.from(
    uniqueRepositories.values()
  ).sort((first, second) =>
    first.label.localeCompare(second.label)
  );
}

export function KnowledgeGraphFilters({
  nodes,
  filters,
  onChange,
}: KnowledgeGraphFiltersProps) {
  const repositories =
    getRepositoryOptions(nodes);

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
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="grid gap-4 lg:grid-cols-2">
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
          options={technologies.map((item) => ({
            value: item,
            label: item,
          }))}
          onChange={(value) =>
            updateFilter("technology", value)
          }
        />

        <FilterSelect
          label="Architecture Domain"
          value={filters.architectureDomain}
          options={architectureDomains.map(
            (item) => ({
              value: item,
              label: item,
            })
          )}
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
          options={capabilities.map((item) => ({
            value: item,
            label: item,
          }))}
          onChange={(value) =>
            updateFilter("capability", value)
          }
        />

        <FilterSelect
          label="Repository Type"
          value={filters.repositoryType}
          options={repositoryTypes.map((item) => ({
            value: item,
            label: item,
          }))}
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
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-muted-foreground">
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
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
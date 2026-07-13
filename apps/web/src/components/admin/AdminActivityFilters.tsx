"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatIntelligenceLabel } from "@/lib/intelligence-labels";

interface AdminActivityFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;

  selectedType: string;
  onTypeChange: (value: string) => void;

  selectedAction: string;
  onActionChange: (value: string) => void;

  types: string[];
  actions: string[];

  resultCount: number;
  totalCount: number;

  onClear: () => void;
}

export function AdminActivityFilters({
  search,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedAction,
  onActionChange,
  types,
  actions,
  resultCount,
  totalCount,
  onClear,
}: AdminActivityFiltersProps) {
  const hasActiveFilters =
    Boolean(search.trim()) ||
    selectedType !== "ALL" ||
    selectedAction !== "ALL";

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search activity, repository, actor, or description..."
            className="pl-9"
          />
        </div>

        <select
          value={selectedType}
          onChange={(event) => onTypeChange(event.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="ALL">All activity types</option>

          {types.map((type) => (
            <option key={type} value={type}>
              {formatIntelligenceLabel(type)}
            </option>
          ))}
        </select>

        <select
          value={selectedAction}
          onChange={(event) => onActionChange(event.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="ALL">All actions</option>

          {actions.map((action) => (
            <option key={action} value={action}>
              {formatIntelligenceLabel(action)}
            </option>
          ))}
        </select>

        <Button
          type="button"
          variant="outline"
          disabled={!hasActiveFilters}
          onClick={onClear}
        >
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">{resultCount}</span> of{" "}
        <span className="font-medium text-foreground">{totalCount}</span>{" "}
        activity records.
      </p>
    </div>
  );
}
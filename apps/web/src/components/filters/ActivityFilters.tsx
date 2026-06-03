"use client";

import { Input } from "@/components/ui/input";
import { formatFilterLabel } from "@/lib/filters";

interface ActivityFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;

  selectedType: string;
  onTypeChange: (value: string) => void;

  types: string[];
}

export function ActivityFilters({
  search,
  onSearchChange,
  selectedType,
  onTypeChange,
  types,
}: ActivityFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 md:flex-row">
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search engineering activity..."
        className="md:max-w-sm"
      />

      <select
        value={selectedType}
        onChange={(event) => onTypeChange(event.target.value)}
        className="h-10 rounded-md border border-border bg-background px-3 text-sm"
      >
        <option value="ALL">All activity types</option>

        {types.map((type) => (
          <option key={type} value={type}>
            {formatFilterLabel(type)}
          </option>
        ))}
      </select>
    </div>
  );
}
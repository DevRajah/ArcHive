"use client";

import { Input } from "@/components/ui/input";
import { formatFilterLabel } from "@/lib/filters";

interface ArchitectureEvolutionFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedDomain: string;
  onDomainChange: (value: string) => void;
  domains: string[];
}

export function ArchitectureEvolutionFilters({
  search,
  onSearchChange,
  selectedDomain,
  onDomainChange,
  domains,
}: ArchitectureEvolutionFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 md:flex-row">
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search architecture evolution..."
        className="md:max-w-sm"
      />

      <select
        value={selectedDomain}
        onChange={(event) => onDomainChange(event.target.value)}
        className="h-10 rounded-md border border-border bg-background px-3 text-sm"
      >
        <option value="ALL">All architecture domains</option>

        {domains.map((domain) => (
          <option key={domain} value={domain}>
            {formatFilterLabel(domain)}
          </option>
        ))}
      </select>
    </div>
  );
}
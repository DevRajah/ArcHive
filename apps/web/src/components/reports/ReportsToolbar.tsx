"use client";

import {
  ArrowDownAZ,
  ArrowUpAZ,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { ReportStatus } from "@/types/report.types";

export type ReportStatusFilter =
  | "ALL"
  | ReportStatus;

export type ReportSortOption =
  | "NEWEST"
  | "OLDEST"
  | "TITLE_ASC"
  | "TITLE_DESC";

interface ReportsToolbarProps {
  search: string;
  status: ReportStatusFilter;
  sort: ReportSortOption;
  resultCount: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (
    value: ReportStatusFilter,
  ) => void;
  onSortChange: (
    value: ReportSortOption,
  ) => void;
  onReset: () => void;
}

export function ReportsToolbar({
  search,
  status,
  sort,
  resultCount,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onReset,
}: ReportsToolbarProps) {
  const hasActiveFilters =
    search.trim().length > 0 ||
    status !== "ALL" ||
    sort !== "NEWEST";

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            placeholder="Search reports by title or description..."
            className="pl-9"
            onChange={(event) =>
              onSearchChange(
                event.target.value,
              )
            }
          />

          {search && (
            <button
              type="button"
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              onClick={() =>
                onSearchChange("")
              }
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={status}
            onValueChange={(value) =>
              onStatusChange(
                value as ReportStatusFilter,
              )
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">
                All statuses
              </SelectItem>

              <SelectItem value="QUEUED">
                Queued
              </SelectItem>

              <SelectItem value="GENERATING">
                Generating
              </SelectItem>

              <SelectItem value="COMPLETED">
                Completed
              </SelectItem>

              <SelectItem value="FAILED">
                Failed
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(value) =>
              onSortChange(
                value as ReportSortOption,
              )
            }
          >
            <SelectTrigger className="w-full sm:w-[190px]">
              {sort === "TITLE_ASC" ||
              sort === "OLDEST" ? (
                <ArrowUpAZ className="mr-2 h-4 w-4" />
              ) : (
                <ArrowDownAZ className="mr-2 h-4 w-4" />
              )}

              <SelectValue placeholder="Sort reports" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="NEWEST">
                Newest first
              </SelectItem>

              <SelectItem value="OLDEST">
                Oldest first
              </SelectItem>

              <SelectItem value="TITLE_ASC">
                Title A to Z
              </SelectItem>

              <SelectItem value="TITLE_DESC">
                Title Z to A
              </SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              onClick={onReset}
            >
              <X className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {resultCount === 1
          ? "1 report found"
          : `${resultCount} reports found`}
      </p>
    </div>
  );
}
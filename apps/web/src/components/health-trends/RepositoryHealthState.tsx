import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  History,
  RefreshCcw,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export function RepositoryHealthEmptyState({
  repositoryId,
  isRefreshing,
  onRefresh,
}: {
  repositoryId: string;
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center md:p-12">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <History className="h-8 w-8 text-primary" />
      </div>

      <h1 className="mt-6 text-2xl font-bold tracking-tight">
        More health history is required
      </h1>

      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
        More historical snapshots are required before
        trends can be generated. Refresh repository
        health after new engineering activity to build a
        meaningful health timeline.
      </p>

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCcw
            className={`mr-2 h-4 w-4 ${
              isRefreshing
                ? "animate-spin"
                : ""
            }`}
          />

          {isRefreshing
            ? "Creating Snapshot"
            : "Refresh Health Snapshot"}
        </Button>

        <Button
          asChild
          variant="outline"
        >
          <Link
            href={`/repositories/${repositoryId}`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Repository Overview
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function RepositoryHealthErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center md:p-12">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
        <TriangleAlert className="h-8 w-8 text-destructive" />
      </div>

      <h1 className="mt-6 text-2xl font-bold tracking-tight">
        {title}
      </h1>

      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
        {description}
      </p>

      {onRetry && (
        <Button
          type="button"
          variant="outline"
          className="mt-7"
          onClick={onRetry}
        >
          <Activity className="mr-2 h-4 w-4" />
          Retry Health Trends
        </Button>
      )}
    </div>
  );
}
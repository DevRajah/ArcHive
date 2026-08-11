"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { RepositoryIntelligenceNav } from "@/components/repositories/RepositoryIntelligenceNav";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useRepositoryIntelligenceAudit } from "@/hooks/useRepositories";
import { formatFilterLabel } from "@/lib/filters";

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) =>
      normalizeList(item)
    );
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.map((item) =>
          String(item)
        );
      }
    } catch {
      return [value];
    }

    return [value];
  }

  if (
    value &&
    typeof value === "object"
  ) {
    return Object.values(value).flatMap(
      (item) => normalizeList(item)
    );
  }

  return [];
}

function ListBlock({
  title,
  items,
  tone = "neutral",
}: {
  title: string;
  items?: unknown;
  tone?: "neutral" | "success" | "warning";
}) {
  const normalizedItems =
    normalizeList(items);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      {normalizedItems.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No items detected yet.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {normalizedItems.map(
            (item, index) => (
              <div
                key={`${item}-${index}`}
                className={`rounded-lg border p-3 text-sm leading-6 ${
                  tone === "warning"
                    ? "border-yellow-500/30 bg-yellow-500/10"
                    : tone === "success"
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : "border-border bg-background"
                }`}
              >
                {item}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

function SignalGroup({
  title,
  items,
}: {
  title: string;
  items?: unknown;
}) {
  const normalizedItems =
    normalizeList(items);

  return (
    <div>
      <p className="text-sm font-medium">
        {title}
      </p>

      {normalizedItems.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          No signals detected.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {normalizedItems.map(
            (item, index) => (
              <Badge
                key={`${item}-${index}`}
                variant="outline"
              >
                {formatFilterLabel(item)}
              </Badge>
            )
          )}
        </div>
      )}
    </div>
  );
}

function ReasoningSignalsBlock({
  items,
}: {
  items?: unknown;
}) {
  const normalizedItems =
    normalizeList(items);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">
        Reasoning Signals
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Evidence ArcHive used when producing
        the repository classification.
      </p>

      {normalizedItems.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No reasoning signals detected yet.
        </p>
      ) : (
        <div className="mt-5 max-h-[32rem] space-y-3 overflow-y-auto pr-2">
          {normalizedItems.map(
            (item, index) => (
              <div
                key={`${index}-${item}`}
                className="rounded-lg border border-border bg-background p-4 text-sm leading-6"
              >
                {item}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default function RepositoryAuditPage() {
  const params =
    useParams<{ repoId: string }>();

  const repoId = params.repoId;

  const {
    data,
    isLoading,
    isError,
    error,
  } =
    useRepositoryIntelligenceAudit(
      repoId
    );

  /*
   * The audit endpoint now returns:
   *
   * data.audit
   * data.signals
   *
   * rather than exposing those fields at the
   * response root.
   */
  const response =
    data as
      | {
          repository?: {
            id?: string;
            name?: string;
            fullName?: string;
          };

          audit?: {
            auditStatus?: string;
            strengths?: string[];
            warnings?: string[];
            improvementAreas?: string[];
          };

          signals?: {
            repositoryTypes?: string[];
            domains?: string[];
            technologies?: string[];
            reasoningSignals?: string[];
          };
        }
      | undefined;

  const audit = response?.audit;

  const signals = response?.signals;

  const auditStatus =
    audit?.auditStatus || "UNKNOWN";

  const isHealthy =
    auditStatus === "HEALTHY";

  const StatusIcon = isHealthy
    ? CheckCircle2
    : TriangleAlert;

  return (
    <AppShell>
      <PageContent>
        <Button
          asChild
          variant="ghost"
          className="px-0"
        >
          <Link
            href={`/repositories/${repoId}`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to repository overview
          </Link>
        </Button>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Intelligence Quality Audit
              </h1>

              <p className="mt-2 max-w-3xl text-muted-foreground">
                Shows how much ArcHive trusts
                its repository understanding,
                which signals were used, and
                where the classification can
                improve.
              </p>
            </div>
          </div>
        </div>

        <RepositoryIntelligenceNav
          repositoryId={repoId}
        />

        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-28 rounded-xl" />

            <div className="grid gap-6 xl:grid-cols-2">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>

            <Skeleton className="h-72 rounded-xl" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
            <p className="font-medium text-destructive">
              Failed to load intelligence audit
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Please check backend."}
            </p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          response && (
            <>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusIcon
                    className={
                      isHealthy
                        ? "h-5 w-5 text-emerald-500"
                        : "h-5 w-5 text-yellow-500"
                    }
                  />

                  <h2 className="text-lg font-semibold">
                    Audit Status
                  </h2>

                  <Badge
                    variant={
                      isHealthy
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {formatFilterLabel(
                      auditStatus
                    )}
                  </Badge>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  {isHealthy
                    ? "ArcHive found enough explainable evidence to support the current repository classification."
                    : "ArcHive detected uncertainty or areas where the current repository classification could be strengthened."}
                </p>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <ListBlock
                  title="Strengths"
                  items={audit?.strengths}
                  tone="success"
                />

                <ListBlock
                  title="Warnings"
                  items={audit?.warnings}
                  tone="warning"
                />

                <ListBlock
                  title="Improvement Areas"
                  items={
                    audit?.improvementAreas
                  }
                />

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold">
                    Signals Used
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Structured signals used by
                    ArcHive when evaluating the
                    repository classification.
                  </p>

                  <div className="mt-6 space-y-6">
                    <SignalGroup
                      title="Repository Types"
                      items={
                        signals?.repositoryTypes
                      }
                    />

                    <SignalGroup
                      title="Architecture Domains"
                      items={signals?.domains}
                    />

                    <SignalGroup
                      title="Technologies"
                      items={
                        signals?.technologies
                      }
                    />
                  </div>
                </div>
              </div>

              <ReasoningSignalsBlock
                items={
                  signals?.reasoningSignals
                }
              />
            </>
          )}
      </PageContent>
    </AppShell>
  );
}
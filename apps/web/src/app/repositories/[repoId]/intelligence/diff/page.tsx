"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";
import axios from "axios";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  CircleMinus,
  GitCompareArrows,
  History,
  Loader2,
  LockKeyhole,
  Minus,
  RefreshCcw,
  SearchX,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { RepositoryIntelligenceNav } from "@/components/repositories/RepositoryIntelligenceNav";
import { IntelligenceSection } from "@/components/intelligence-v2/IntelligenceSection";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useRepositoryIntelligenceDiff,
  useReprocessRepositoryIntelligence,
} from "@/hooks/useRepositories";

import { formatIntelligenceLabel } from "@/lib/intelligence-labels";

import type {
  IntelligenceDiffDirection,
  IntelligenceDiffRecommendationChanges,
  IntelligenceDiffScoreChange,
  IntelligenceDiffSignalGroup,
} from "@/types/repository-intelligence-diff.types";

type ReprocessContext =
  | "CREATE_FIRST"
  | "CREATE_ANOTHER"
  | "REFRESH";

function getHttpStatus(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return null;
  }

  return error.response?.status ?? null;
}

function getBackendErrorMessage(
  error: unknown,
  fallback: string
) {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : fallback;
  }

  const payload = error.response?.data as
    | {
        message?: string;
        error?: string;
      }
    | undefined;

  return (
    payload?.message ||
    payload?.error ||
    error.message ||
    fallback
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString();
}

function formatValue(
  value: number | string | null
) {
  if (value === null || value === "") {
    return "Not available";
  }

  if (typeof value === "number") {
    return value.toLocaleString();
  }

  return value;
}

function getDirectionConfiguration(
  direction: IntelligenceDiffDirection
): {
  label: string;
  icon: LucideIcon;
  className: string;
} {
  switch (direction) {
    case "UP":
      return {
        label: "Improved",
        icon: ArrowUp,
        className:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
      };

    case "DOWN":
      return {
        label: "Declined",
        icon: ArrowDown,
        className:
          "border-destructive/30 bg-destructive/10 text-destructive",
      };

    case "UNCHANGED":
      return {
        label: "Unchanged",
        icon: Minus,
        className:
          "border-border bg-muted text-muted-foreground",
      };

    default:
      return {
        label: "Not comparable",
        icon: CircleMinus,
        className:
          "border-border bg-background text-muted-foreground",
      };
  }
}

export default function RepositoryIntelligenceDiffPage() {
  const params = useParams<{ repoId: string }>();
  const repositoryId = params.repoId;

  const router = useRouter();

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  /*
   * This tracks only the testing workflow completed during the current
   * browser session. It does not attempt to represent the backend's
   * immutable snapshot count.
   */
  const [
    hasCreatedSnapshotThisSession,
    setHasCreatedSnapshotThisSession,
  ] = useState(false);

  const [
    reprocessContext,
    setReprocessContext,
  ] = useState<ReprocessContext | null>(null);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useRepositoryIntelligenceDiff(repositoryId);

  const reprocessMutation =
    useReprocessRepositoryIntelligence(repositoryId);

  const status = getHttpStatus(error);

  useEffect(() => {
    if (status !== 401) {
      return;
    }

    router.replace("/connect-github");
  }, [router, status]);

  useEffect(() => {
    if (!feedback) return;

    const timer = window.setTimeout(() => {
      setFeedback(null);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [feedback]);

  function handleReprocess(
    context: ReprocessContext
  ) {
    setReprocessContext(context);

    reprocessMutation.mutate(undefined, {
      onSuccess: () => {
        setHasCreatedSnapshotThisSession(true);

        setFeedback({
          type: "success",
          message:
            "Intelligence snapshot created successfully.",
        });
      },

      onError: (mutationError) => {
        setFeedback({
          type: "error",
          message: getBackendErrorMessage(
            mutationError,
            "Failed to refresh repository intelligence."
          ),
        });
      },

      onSettled: () => {
        setReprocessContext(null);
      },
    });
  }

  const isReprocessing =
    reprocessMutation.isPending;

  const headerActionLabel =
    reprocessContext === "REFRESH" &&
    isReprocessing
      ? "Refreshing intelligence..."
      : "Refresh Intelligence";

  return (
    <AppShell>
      <PageContent>
        <Button asChild variant="ghost" className="px-0">
          <Link
            href={`/repositories/${repositoryId}/intelligence`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to intelligence report
          </Link>
        </Button>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <GitCompareArrows className="h-5 w-5 text-primary" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">
                    Intelligence Diff
                  </h1>

                  {data?.repository?.fullName && (
                    <Badge variant="secondary">
                      {data.repository.fullName}
                    </Badge>
                  )}
                </div>

                <p className="mt-2 max-w-3xl text-muted-foreground">
                  Compare how ArcHive&apos;s understanding of this
                  repository changed between completed intelligence
                  refreshes.
                </p>

                <div className="mt-4 max-w-3xl rounded-lg border border-border bg-background px-4 py-3">
                  <div className="flex items-start gap-3">
                    <History className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                    <div>
                      <p className="text-sm font-medium">
                        How Intelligence Diff works
                      </p>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        ArcHive preserves an intelligence snapshot
                        after every successful repository refresh.
                        This page compares the newest snapshot with
                        the immediately previous snapshot.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {data?.hasDiff === true && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  handleReprocess("REFRESH")
                }
                disabled={
                  isReprocessing || isFetching
                }
              >
                {isReprocessing &&
                reprocessContext === "REFRESH" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="mr-2 h-4 w-4" />
                )}

                {headerActionLabel}
              </Button>
            )}
          </div>
        </div>

        <RepositoryIntelligenceNav
          repositoryId={repositoryId}
        />

        {feedback && (
          <div
            className={`rounded-xl border p-4 ${
              feedback.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-destructive/30 bg-destructive/10"
            }`}
          >
            <div className="flex items-start gap-3">
              {feedback.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              )}

              <p
                className={`text-sm font-medium ${
                  feedback.type === "success"
                    ? "text-emerald-600"
                    : "text-destructive"
                }`}
              >
                {feedback.message}
              </p>
            </div>
          </div>
        )}

        {isLoading && (
          <IntelligenceDiffSkeleton />
        )}

        {status === 401 && (
          <StatusCard
            icon={LockKeyhole}
            title="Authentication required"
            description="Your ArcHive session has expired. Redirecting to the existing GitHub connection flow."
          />
        )}

        {isError && status === 403 && (
          <StatusCard
            icon={LockKeyhole}
            title="Repository access denied"
            description="This repository exists, but the current ArcHive account does not have permission to view its intelligence history."
          />
        )}

        {isError && status === 404 && (
          <StatusCard
            icon={SearchX}
            title="Repository not found"
            description="ArcHive could not find this repository. It may have been deleted, removed from the workspace, or the link may be invalid."
            action={
              <Button asChild variant="outline">
                <Link href="/repositories">
                  Back to repositories
                </Link>
              </Button>
            }
          />
        )}

        {isError &&
          status !== 401 &&
          status !== 403 &&
          status !== 404 && (
            <StatusCard
              icon={TriangleAlert}
              title="Failed to load intelligence diff"
              description={
                error instanceof Error
                  ? error.message
                  : "ArcHive could not load the repository intelligence comparison."
              }
              action={
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={isFetching}
                >
                  <RefreshCcw
                    className={`mr-2 h-4 w-4 ${
                      isFetching
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  Retry
                </Button>
              }
            />
          )}

        {!isLoading &&
          !isError &&
          data &&
          data.hasDiff === false && (
            <InsufficientHistoryState
              repositoryId={repositoryId}
              repositoryName={
                data.repository.fullName ||
                data.repository.name
              }
              hasCreatedSnapshotThisSession={
                hasCreatedSnapshotThisSession
              }
              isReprocessing={isReprocessing}
              reprocessContext={reprocessContext}
              onCreateSnapshot={() =>
                handleReprocess(
                  hasCreatedSnapshotThisSession
                    ? "CREATE_ANOTHER"
                    : "CREATE_FIRST"
                )
              }
            />
          )}

        {!isLoading &&
          !isError &&
          data &&
          data.hasDiff === true && (
            <>
              <IntelligenceSection
                title="Diff Summary"
                description="The main changes identified between the two most recent completed intelligence snapshots."
              >
                <div className="rounded-xl border border-border bg-background p-5">
                  <h2 className="text-2xl font-bold">
                    {data.summary?.headline ||
                      "Repository intelligence changed"}
                  </h2>

                  <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
                    {data.summary?.description ||
                      "ArcHive detected meaningful changes in this repository's intelligence signals."}
                  </p>

                  <p className="mt-4 text-xs text-muted-foreground">
                    Generated:{" "}
                    {formatDate(data.generatedAt)}
                  </p>
                </div>
              </IntelligenceSection>

              <IntelligenceSection
                title="Score Changes"
                description="Previous and current measurements from the compared intelligence snapshots."
              >
                {!data.scoreChanges ||
                data.scoreChanges.length === 0 ? (
                  <NoChangesState
                    message="No measurable score changes were detected."
                  />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {data.scoreChanges.map(
                      (change, index) => (
                        <ScoreChangeCard
                          key={`${change.label}-${index}`}
                          change={change}
                        />
                      )
                    )}
                  </div>
                )}
              </IntelligenceSection>

              <IntelligenceSection
                title="Signal Changes"
                description="Technologies, architecture domains, repository types, and capabilities added, removed, or retained."
              >
                <div className="grid gap-6 lg:grid-cols-2">
                  <SignalChangeCard
                    title="Technologies"
                    changes={
                      data.signalChanges.technologies
                    }
                  />

                  <SignalChangeCard
                    title="Architecture Domains"
                    changes={
                      data.signalChanges
                        .architectureDomains
                    }
                  />

                  <SignalChangeCard
                    title="Repository Types"
                    changes={
                      data.signalChanges.repositoryTypes
                    }
                  />

                  <SignalChangeCard
                    title="Capabilities"
                    changes={
                      data.signalChanges.capabilities
                    }
                  />
                </div>
              </IntelligenceSection>

              <IntelligenceSection
                title="Recommendation Lifecycle"
                description="Recommendations introduced, resolved, or removed between intelligence refreshes."
              >
                <RecommendationChanges
                  changes={
                    data.recommendationChanges
                  }
                />
              </IntelligenceSection>
            </>
          )}
      </PageContent>
    </AppShell>
  );
}

function IntelligenceDiffSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-44 rounded-xl" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map(
          (_, index) => (
            <Skeleton
              key={index}
              className="h-56 rounded-xl"
            />
          )
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <Skeleton
              key={index}
              className="h-72 rounded-xl"
            />
          )
        )}
      </div>
    </div>
  );
}

function InsufficientHistoryState({
  repositoryId,
  repositoryName,
  hasCreatedSnapshotThisSession,
  isReprocessing,
  reprocessContext,
  onCreateSnapshot,
}: {
  repositoryId: string;
  repositoryName: string;
  hasCreatedSnapshotThisSession: boolean;
  isReprocessing: boolean;
  reprocessContext: ReprocessContext | null;
  onCreateSnapshot: () => void;
}) {
  const isCreatingSnapshot =
    isReprocessing &&
    (reprocessContext === "CREATE_FIRST" ||
      reprocessContext === "CREATE_ANOTHER");

  const buttonLabel =
    hasCreatedSnapshotThisSession
      ? "Create Another Snapshot"
      : "Create Intelligence Snapshot";

  const loadingLabel =
    hasCreatedSnapshotThisSession
      ? "Creating another snapshot..."
      : "Creating snapshot...";

  return (
    <div className="rounded-xl border border-border bg-card p-6 sm:p-10">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>

        <h2 className="mt-5 text-2xl font-semibold">
          Intelligence history is still being built
        </h2>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The repository{" "}
          <span className="font-medium text-foreground">
            {repositoryName}
          </span>{" "}
          exists and this page is working. ArcHive needs at
          least two successful intelligence refreshes before
          it can compare the newest snapshot with the
          previous one.
        </p>
      </div>

      <div className="mx-auto mt-7 max-w-3xl rounded-xl border border-border bg-background p-5">
        <p className="font-medium">
          Snapshot testing progress
        </p>

        <div className="mt-5 space-y-4">
          <WorkflowStep
            number={1}
            title="Create an intelligence snapshot"
            description="Refresh the repository intelligence successfully. ArcHive automatically preserves the resulting snapshot."
            completed={
              hasCreatedSnapshotThisSession
            }
          />

          <WorkflowStep
            number={2}
            title="Create another snapshot"
            description="Run another successful refresh. Once two completed snapshots exist, the comparison appears automatically."
            completed={false}
          />
        </div>

        {hasCreatedSnapshotThisSession && (
          <div className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-sm font-medium text-emerald-600">
              A successful refresh was completed during this
              session.
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              The backend still reports that there is not
              enough comparison history. Create another
              snapshot to continue the testing workflow.
            </p>
          </div>
        )}
      </div>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button
          type="button"
          onClick={onCreateSnapshot}
          disabled={isReprocessing}
        >
          {isCreatingSnapshot ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="mr-2 h-4 w-4" />
          )}

          {isCreatingSnapshot
            ? loadingLabel
            : buttonLabel}
        </Button>

        <Button asChild variant="outline">
          <Link
            href={`/repositories/${repositoryId}/intelligence`}
          >
            Open intelligence report
          </Link>
        </Button>
      </div>
    </div>
  );
}

function WorkflowStep({
  number,
  title,
  description,
  completed,
}: {
  number: number;
  title: string;
  description: string;
  completed: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
          completed
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
            : "border-border bg-card text-muted-foreground"
        }`}
      >
        {completed ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          number
        )}
      </div>

      <div>
        <p className="font-medium">{title}</p>

        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function ScoreChangeCard({
  change,
}: {
  change: IntelligenceDiffScoreChange;
}) {
  const direction =
    getDirectionConfiguration(change.direction);

  const DirectionIcon = direction.icon;

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-semibold">
          {formatIntelligenceLabel(change.label)}
        </h3>

        <Badge
          variant="outline"
          className={direction.className}
        >
          <DirectionIcon className="mr-1 h-3.5 w-3.5" />
          {direction.label}
        </Badge>
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <ValueCard
          label="Previous"
          value={change.previous}
        />

        <div className="text-muted-foreground">
          →
        </div>

        <ValueCard
          label="Current"
          value={change.current}
        />
      </div>

      {change.summary ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {change.summary}
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No additional score explanation was provided.
        </p>
      )}
    </div>
  );
}

function ValueCard({
  label,
  value,
}: {
  label: string;
  value: number | string | null;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 break-words text-lg font-bold">
        {formatValue(value)}
      </p>
    </div>
  );
}

function SignalChangeCard({
  title,
  changes,
}: {
  title: string;
  changes: IntelligenceDiffSignalGroup;
}) {
  const added = changes?.added ?? [];
  const removed = changes?.removed ?? [];
  const unchanged = changes?.unchanged ?? [];

  const hasChanges =
    added.length > 0 ||
    removed.length > 0 ||
    unchanged.length > 0;

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <h3 className="text-lg font-semibold">
        {title}
      </h3>

      {!hasChanges ? (
        <NoChangesState
          message={`No ${title.toLowerCase()} changes were detected.`}
        />
      ) : (
        <div className="mt-5 space-y-5">
          <ChangeBadgeGroup
            title="Added"
            items={added}
            type="added"
          />

          <ChangeBadgeGroup
            title="Removed"
            items={removed}
            type="removed"
          />

          <ChangeBadgeGroup
            title="Unchanged"
            items={unchanged}
            type="unchanged"
            limit={10}
          />
        </div>
      )}
    </div>
  );
}

function ChangeBadgeGroup({
  title,
  items,
  type,
  limit,
}: {
  title: string;
  items: string[];
  type:
    | "added"
    | "removed"
    | "resolved"
    | "unchanged";
  limit?: number;
}) {
  const displayedItems =
    typeof limit === "number"
      ? items.slice(0, limit)
      : items;

  const badgeClassName =
    type === "added"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
      : type === "resolved"
        ? "border-primary/30 bg-primary/10 text-primary"
        : type === "removed"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-border bg-muted text-muted-foreground";

  return (
    <div>
      <p className="mb-2 text-sm font-medium">
        {title}
      </p>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No changes
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {displayedItems.map(
            (item, index) => (
              <Badge
                key={`${type}-${item}-${index}`}
                variant="outline"
                className={badgeClassName}
              >
                {formatIntelligenceLabel(item)}
              </Badge>
            )
          )}

          {typeof limit === "number" &&
            items.length > limit && (
              <Badge variant="secondary">
                +{items.length - limit} more
              </Badge>
            )}
        </div>
      )}
    </div>
  );
}

function RecommendationChanges({
  changes,
}: {
  changes: IntelligenceDiffRecommendationChanges;
}) {
  const added = changes?.added ?? [];
  const resolved = changes?.resolved ?? [];
  const removed = changes?.removed ?? [];

  const hasChanges =
    added.length > 0 ||
    resolved.length > 0 ||
    removed.length > 0;

  if (!hasChanges) {
    return (
      <NoChangesState
        message="No recommendation lifecycle changes were detected."
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <RecommendationGroup
        title="Added"
        description="New recommendations introduced in the latest intelligence snapshot."
        items={added}
        type="added"
      />

      <RecommendationGroup
        title="Resolved"
        description="Recommendations that were completed or no longer require attention."
        items={resolved}
        type="resolved"
      />

      <RecommendationGroup
        title="Removed"
        description="Recommendations that are no longer applicable."
        items={removed}
        type="removed"
      />
    </div>
  );
}

function RecommendationGroup({
  title,
  description,
  items,
  type,
}: {
  title: string;
  description: string;
  items: string[];
  type: "added" | "resolved" | "removed";
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <h3 className="font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <div className="mt-4">
        <ChangeBadgeGroup
          title={`${title} recommendations`}
          items={items}
          type={type}
        />
      </div>
    </div>
  );
}

function NoChangesState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
      <Minus className="mx-auto h-5 w-5 text-muted-foreground" />

      <p className="mt-3 text-sm text-muted-foreground">
        {message}
      </p>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>

      <h2 className="mt-5 text-2xl font-semibold">
        {title}
      </h2>

      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {action && (
        <div className="mt-6">{action}</div>
      )}
    </div>
  );
}
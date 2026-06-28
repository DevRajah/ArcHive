"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, GitBranch, Network, Trash2 } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { RepositoryArchitecturePreview } from "@/components/repositories/RepositoryArchitecturePreview";
import { RepositoryArchitectureRadar } from "@/components/repositories/RepositoryArchitectureRadar";
import { RepositoryDetailNav } from "@/components/repositories/RepositoryDetailNav";
import { RepositoryIntelligenceCards } from "@/components/repositories/RepositoryIntelligenceCards";
import { RepositoryIntelligenceSummary } from "@/components/repositories/RepositoryIntelligenceSummary";
import { RepositoryLiveStatus } from "@/components/repositories/RepositoryLiveStatus";
import { RepositoryMetricCards } from "@/components/repositories/RepositoryMetricCards";
import { RepositoryPurposeCard } from "@/components/repositories/RepositoryPurposeCard";
import { RepositoryRecentEvents } from "@/components/repositories/RepositoryRecentEvents";
import { RepositoryTimelinePreview } from "@/components/repositories/RepositoryTimelinePreview";
import { RepositoryTrackingStatus } from "@/components/repositories/RepositoryTrackingStatus";

import { useRepositoryOverview } from "@/hooks/useRepositoryOverview";
import { useRepositoryLiveStatus } from "@/hooks/useRepositoryLiveStatus";
import {
  useRepositoryArchitectureRadar,
  useRepositoryIntelligenceReport,
  useRepositoryIntelligenceSummary,
  useUntrackRepository,
} from "@/hooks/useRepositories";

export default function RepositoryDetailPage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params.repoId;
  const router = useRouter();

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [isUntrackDialogOpen, setIsUntrackDialogOpen] = useState(false);

  const { data, isLoading, isError, error } = useRepositoryOverview(repoId);

  const liveStatus = useRepositoryLiveStatus(repoId);
  const untrackMutation = useUntrackRepository();

  const {
    data: architectureRadar,
    isLoading: isArchitectureRadarLoading,
  } = useRepositoryArchitectureRadar(repoId);

  const {
    data: intelligenceReport,
    isLoading: isIntelligenceReportLoading,
  } = useRepositoryIntelligenceReport(repoId);

  const {
    data: intelligenceSummary,
    isLoading: isIntelligenceSummaryLoading,
    isRefetching: isIntelligenceSummaryRefetching,
    refetch: refetchIntelligenceSummary,
  } = useRepositoryIntelligenceSummary(repoId);

  function handleUntrackRepository() {
    untrackMutation.mutate(repoId, {
      onSuccess: () => {
        setIsUntrackDialogOpen(false);

        setFeedback({
          type: "success",
          message: "Repository untracked successfully.",
        });

        setTimeout(() => {
          router.push("/repositories");
        }, 1000);
      },

      onError: (error) => {
        setFeedback({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to untrack repository.",
        });
      },
    });
  }

  useEffect(() => {
    if (!feedback) return;

    const timer = setTimeout(() => {
      setFeedback(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [feedback]);

  return (
    <AppShell>
      <div className="space-y-6">
        <Button asChild variant="ghost" className="px-0">
          <Link href="/repositories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to repositories
          </Link>
        </Button>

        {feedback?.type === "success" && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-sm font-medium text-emerald-500">
              {feedback.message}
            </p>
          </div>
        )}

        {feedback?.type === "error" && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm font-medium text-destructive">
              {feedback.message}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-32 rounded-xl" />

            <div className="grid gap-6 md:grid-cols-3">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>

            <Skeleton className="h-72 rounded-xl" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
            <p className="font-medium text-destructive">
              Failed to load repository overview
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Please check backend."}
            </p>
          </div>
        )}

        {!isLoading && !isError && data && (
          <>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h1 className="break-words text-3xl font-bold tracking-tight">
                      {data.repository?.fullName ||
                        data.repository?.name ||
                        repoId}
                    </h1>

                    <Badge>TRACKED</Badge>
                  </div>

                  <p className="max-w-3xl text-muted-foreground">
                    {data.repository?.description ||
                      "Repository intelligence overview and engineering activity."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>
                      Default branch: {data.repository?.defaultBranch || "main"}
                    </span>
                  </div>

                  <div className="mt-4">
                    <RepositoryLiveStatus
                      isConnected={liveStatus.isConnected}
                      lastUpdatedAt={liveStatus.lastUpdatedAt}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline">
                    <Link href={`/repositories/${repoId}/timeline`}>
                      <GitBranch className="mr-2 h-4 w-4" />
                      Timeline
                    </Link>
                  </Button>

                  <Button asChild>
                    <Link href={`/repositories/${repoId}/architecture`}>
                      <Network className="mr-2 h-4 w-4" />
                      Architecture
                    </Link>
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => setIsUntrackDialogOpen(true)}
                    disabled={untrackMutation.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {untrackMutation.isPending ? "Untracking..." : "Untrack"}
                  </Button>
                </div>
              </div>
            </div>

            <RepositoryDetailNav />

            <RepositoryMetricCards
              totalEvents={data.metrics?.totalEvents ?? 0}
              totalTimelineEntries={data.metrics?.totalTimelineEntries ?? 0}
              totalArchitectureChanges={
                data.metrics?.totalArchitectureChanges ?? 0
              }
            />

            <RepositoryTrackingStatus
              isRealtimeConnected={liveStatus.isConnected}
              lastLiveUpdatedAt={liveStatus.lastUpdatedAt}
              trackingStatus={data.trackingStatus}
            />

            <RepositoryIntelligenceCards repositoryId={repoId} />

            <RepositoryPurposeCard
              data={intelligenceReport}
              isLoading={isIntelligenceReportLoading}
            />

            <div id="intelligence-summary">
              <RepositoryIntelligenceSummary
                data={intelligenceSummary}
                isLoading={isIntelligenceSummaryLoading}
                isRefetching={isIntelligenceSummaryRefetching}
                onRefresh={() => refetchIntelligenceSummary()}
              />
            </div>

            <div id="architecture-radar">
              <RepositoryArchitectureRadar
                data={architectureRadar}
                isLoading={isArchitectureRadarLoading}
                repositoryId={repoId}
              />
            </div>

            <div
              id="recent-activity"
              className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"
            >
              <RepositoryRecentEvents events={data.recentEvents} />

              <div id="architecture-preview">
                <RepositoryArchitecturePreview
                  repositoryId={repoId}
                  changes={data.recentArchitectureChanges}
                />
              </div>
            </div>

            <div id="timeline-preview">
              <RepositoryTimelinePreview
                repositoryId={repoId}
                entries={data.recentTimelineEntries}
              />
            </div>

            <ConfirmDialog
              open={isUntrackDialogOpen}
              onOpenChange={setIsUntrackDialogOpen}
              title="Untrack repository?"
              description="This will remove the repository from your ArcHive workspace. Historical intelligence may remain stored, but it will no longer appear in your tracked repositories."
              confirmLabel="Untrack Repository"
              isLoading={untrackMutation.isPending}
              onConfirm={handleUntrackRepository}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
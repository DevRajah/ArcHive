"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Database,
  GitBranch,
  History,
  Layers3,
  RefreshCcw,
  Trash2,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStateCard } from "@/components/admin/AdminStateCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useAdminDeleteRepository,
  useAdminRepository,
  useAdminReprocessRepository,
} from "@/hooks/useAdmin";

import { getApiErrorMessage } from "@/lib/api-errors";
import { isAdminForbidden } from "@/lib/admin-errors";
import { formatIntelligenceLabel } from "@/lib/intelligence-labels";

interface AdminRepositoryOwner {
  id: string;
  username?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | null;
}

interface AdminTimelineEntry {
  id: string;
  title?: string | null;
  summary?: string | null;
  importanceScore?: number | null;
  generatedByAI?: boolean;
  createdAt?: string | null;
}

interface AdminArchitectureChange {
  id: string;
  changeType?: string | null;
  detectedTechnology?: string | null;
  fileAffected?: string | null;
  summary?: string | null;
  repositoryTypes?: string | null;
  reasoningSignals?: string | null;
  architectureDomain?: string | null;
  evolutionSummary?: string | null;
  createdAt?: string | null;
}

interface AdminEngineeringRecommendation {
  id: string;
  recommendationKey?: string | null;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  evidence?: string | null;
  resolvedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface AdminRepositoryIntelligence {
  primaryRepositoryType?: string | null;
  repositoryTypes?: string[];
  architectureDomain?: string | null;
  detectedTechnology?: string | null;
  reasoningSignals?: string[];
  evolutionSummary?: string | null;
  lastGeneratedAt?: string | null;
}

interface AdminRepositoryCounts {
  events?: number;
  timelineEntries?: number;
  architectureChanges?: number;
  engineeringRecommendations?: number;
}

interface AdminRepositoryDetailsPayload {
  id: string;
  githubRepoId?: string | null;
  name: string;
  owner?: string | null;
  fullName?: string | null;
  description?: string | null;
  defaultBranch?: string | null;
  language?: string | null;
  stars?: number;
  forks?: number;
  isTracked?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;

  user?: AdminRepositoryOwner | null;

  timelineEntries?: AdminTimelineEntry[];
  architectureChanges?: AdminArchitectureChange[];
  engineeringRecommendations?: AdminEngineeringRecommendation[];

  _count?: AdminRepositoryCounts;

  intelligence?: AdminRepositoryIntelligence | null;
}

function formatDate(value?: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString();
}

export default function AdminRepositoryDetailsPage() {
  const params = useParams<{ repositoryId: string }>();
  const repositoryId = params.repositoryId;
  const router = useRouter();

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminRepository(repositoryId);

  const reprocessMutation = useAdminReprocessRepository(repositoryId);
  const deleteMutation = useAdminDeleteRepository();

  /*
   * The admin repository endpoint returns the repository directly at the root.
   * It does not return { repository: {...} }.
   */
  const repository = data as AdminRepositoryDetailsPayload | undefined;

  const owner = repository?.user;
  const stats = repository?._count;
  const intelligence = repository?.intelligence;

  const timelineEntries = repository?.timelineEntries ?? [];
  const architectureChanges = repository?.architectureChanges ?? [];
  const recommendations = repository?.engineeringRecommendations ?? [];

  function handleReprocess() {
    reprocessMutation.mutate(undefined, {
      onSuccess: async () => {
        setFeedback({
          type: "success",
          message: "Repository intelligence reprocess queued successfully.",
        });

        await refetch();
      },

      onError: (error) => {
        setFeedback({
          type: "error",
          message: getApiErrorMessage(
            error,
            "Failed to refresh repository intelligence."
          ),
        });
      },
    });
  }

  function handleDelete() {
    deleteMutation.mutate(repositoryId, {
      onSuccess: () => {
        setFeedback({
          type: "success",
          message: "Repository deleted successfully.",
        });

        setIsDeleteDialogOpen(false);

        setTimeout(() => {
          router.push("/admin/repositories");
        }, 1000);
      },

      onError: (error) => {
        setFeedback({
          type: "error",
          message: getApiErrorMessage(
            error,
            "Failed to delete repository."
          ),
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
          <Link href="/admin/repositories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to repositories
          </Link>
        </Button>

        <AdminPageHeader
          title="Repository Details"
          description="Inspect repository ownership, intelligence, architecture changes, recommendations, and operational metadata."
          action={
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={handleReprocess}
                disabled={reprocessMutation.isPending}
              >
                <RefreshCcw
                  className={`mr-2 h-4 w-4 ${
                    reprocessMutation.isPending ? "animate-spin" : ""
                  }`}
                />

                {reprocessMutation.isPending
                  ? "Refreshing..."
                  : "Refresh Intelligence"}
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />

                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          }
        />

        {feedback && (
          <div
            className={`rounded-xl border p-4 ${
              feedback.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-destructive/30 bg-destructive/10"
            }`}
          >
            <p
              className={`text-sm font-medium ${
                feedback.type === "success"
                  ? "text-emerald-500"
                  : "text-destructive"
              }`}
            >
              {feedback.message}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-40 rounded-xl" />

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-xl" />
              ))}
            </div>

            <Skeleton className="h-72 rounded-xl" />
          </div>
        )}

        {isError && isAdminForbidden(error) && <AdminAccessRequired />}

        {isError && !isAdminForbidden(error) && (
          <AdminStateCard
            title="Failed to load repository details"
            description={getApiErrorMessage(
              error,
              "Please check the backend connection."
            )}
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && !repository && (
          <AdminStateCard
            title="Repository details unavailable"
            description="ArcHive did not return repository details for this repository."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && repository && (
          <>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="break-words text-2xl font-bold">
                      {repository.fullName || repository.name}
                    </h2>

                    {repository.isTracked && <Badge>Tracked</Badge>}

                    {repository.language && (
                      <Badge variant="secondary">
                        {repository.language}
                      </Badge>
                    )}
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">
                    Owner:{" "}
                    <span className="font-medium text-foreground">
                      {repository.owner || owner?.username || "Unknown"}
                    </span>
                  </p>

                  {owner?.email && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Owner email: {owner.email}
                    </p>
                  )}

                  <p className="mt-2 text-sm text-muted-foreground">
                    Default branch:{" "}
                    <span className="font-medium text-foreground">
                      {repository.defaultBranch || "Unknown"}
                    </span>
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Last intelligence refresh:{" "}
                    <span className="font-medium text-foreground">
                      {formatDate(intelligence?.lastGeneratedAt)}
                    </span>
                  </p>

                  {repository.description && (
                    <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
                      {repository.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Stars {repository.stars ?? 0}
                  </Badge>

                  <Badge variant="outline">
                    Forks {repository.forks ?? 0}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <AdminStatCard
                label="Timeline Entries"
                value={stats?.timelineEntries ?? timelineEntries.length}
                icon={History}
              />

              <AdminStatCard
                label="Engineering Events"
                value={stats?.events ?? 0}
                icon={GitBranch}
              />

              <AdminStatCard
                label="Architecture Changes"
                value={
                  stats?.architectureChanges ?? architectureChanges.length
                }
                icon={Layers3}
              />

              <AdminStatCard
                label="Recommendations"
                value={
                  stats?.engineeringRecommendations ??
                  recommendations.length
                }
                icon={Database}
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">
                Repository Intelligence
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Current engineering classification generated by ArcHive.
              </p>

              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-sm text-muted-foreground">
                    Primary Repository Type
                  </p>

                  <h3 className="mt-2 text-xl font-bold">
                    {formatIntelligenceLabel(
                      intelligence?.primaryRepositoryType || "Unknown"
                    )}
                  </h3>
                </div>

                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-sm text-muted-foreground">
                    Evolution Summary
                  </p>

                  <p className="mt-2 text-sm font-medium leading-6">
                    {intelligence?.evolutionSummary ||
                      "No evolution summary available."}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-3">
                <InfoList
                  title="Repository Types"
                  items={intelligence?.repositoryTypes}
                />

                <InfoList
                  title="Architecture Domain"
                  items={
                    intelligence?.architectureDomain
                      ? [intelligence.architectureDomain]
                      : []
                  }
                />

                <InfoList
                  title="Detected Technology"
                  items={
                    intelligence?.detectedTechnology
                      ? [intelligence.detectedTechnology]
                      : []
                  }
                  raw
                />
              </div>

              <div className="mt-5">
                <InfoList
                  title="Reasoning Signals"
                  items={intelligence?.reasoningSignals}
                  raw
                  limit={12}
                />
              </div>
            </div>

            <SectionList
              title="Recent Timeline"
              empty="No timeline entries available."
              items={timelineEntries}
              getKey={(item) => item.id}
              render={(item) => (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      {item.title || "Timeline entry"}
                    </p>

                    {typeof item.importanceScore === "number" && (
                      <Badge variant="outline">
                        Importance {item.importanceScore}
                      </Badge>
                    )}

                    {item.generatedByAI && (
                      <Badge variant="secondary">AI Generated</Badge>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.summary || "No summary available."}
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </p>
                </>
              )}
            />

            <SectionList
              title="Architecture Changes"
              empty="No architecture changes available."
              items={architectureChanges}
              getKey={(item) => item.id}
              render={(item) => (
                <>
                  <div className="flex flex-wrap gap-2">
                    {item.changeType && (
                      <Badge variant="secondary">
                        {formatIntelligenceLabel(item.changeType)}
                      </Badge>
                    )}

                    {item.architectureDomain && (
                      <Badge variant="outline">
                        {formatIntelligenceLabel(item.architectureDomain)}
                      </Badge>
                    )}

                    {item.detectedTechnology && (
                      <Badge variant="outline">
                        {item.detectedTechnology}
                      </Badge>
                    )}
                  </div>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {item.summary || "Architecture change detected."}
                  </p>

                  {item.evolutionSummary && (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.evolutionSummary}
                    </p>
                  )}

                  {item.fileAffected && (
                    <p className="mt-2 break-all text-xs text-muted-foreground">
                      File: {item.fileAffected}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </p>
                </>
              )}
            />

            <SectionList
              title="Engineering Recommendations"
              empty="No engineering recommendations available."
              items={recommendations}
              getKey={(item) => item.id}
              render={(item) => (
                <>
                  <div className="flex flex-wrap gap-2">
                    {item.recommendationKey && (
                      <Badge variant="secondary">
                        {formatIntelligenceLabel(item.recommendationKey)}
                      </Badge>
                    )}

                    {item.status && (
                      <Badge
                        variant={
                          item.status === "ACTIVE"
                            ? "default"
                            : "outline"
                        }
                      >
                        {formatIntelligenceLabel(item.status)}
                      </Badge>
                    )}
                  </div>

                  <p className="mt-3 font-medium">
                    {item.title || "Recommendation"}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.description || "No description available."}
                  </p>

                  {item.evidence && (
                    <p className="mt-2 break-all text-xs text-muted-foreground">
                      Evidence: {item.evidence}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-muted-foreground">
                    Created: {formatDate(item.createdAt)}
                  </p>

                  {item.resolvedAt && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Resolved: {formatDate(item.resolvedAt)}
                    </p>
                  )}
                </>
              )}
            />

            <ConfirmDialog
              open={isDeleteDialogOpen}
              onOpenChange={(open) => {
                if (!deleteMutation.isPending) {
                  setIsDeleteDialogOpen(open);
                }
              }}
              title="Delete repository?"
              description={`This will permanently remove ${
                repository.fullName || repository.name
              } and its associated ArcHive data. This action cannot be undone.`}
              confirmLabel="Delete Repository"
              isLoading={deleteMutation.isPending}
              onConfirm={handleDelete}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}

function InfoList({
  title,
  items,
  raw = false,
  limit = 8,
}: {
  title: string;
  items?: string[];
  raw?: boolean;
  limit?: number;
}) {
  const normalizedItems = (items ?? [])
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="mb-3 text-sm font-medium">{title}</p>

      {normalizedItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No data available.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {normalizedItems.slice(0, limit).map((item, index) => (
            <Badge key={`${item}-${index}`} variant="outline">
              {raw ? item : formatIntelligenceLabel(item)}
            </Badge>
          ))}

          {normalizedItems.length > limit && (
            <Badge variant="secondary">
              +{normalizedItems.length - limit} more
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

function SectionList<T>({
  title,
  empty,
  items,
  getKey,
  render,
}: {
  title: string;
  empty: string;
  items?: T[];
  getKey: (item: T, index: number) => string;
  render: (item: T) => ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">{title}</h2>

      {!items || items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="mt-5 space-y-3">
          {items.slice(0, 8).map((item, index) => (
            <div
              key={getKey(item, index)}
              className="rounded-xl border border-border bg-background p-4"
            >
              {render(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
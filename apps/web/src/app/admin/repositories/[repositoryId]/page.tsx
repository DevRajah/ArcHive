"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
import { getApiErrorMessage } from "@/lib/api-errors";

import { AppShell } from "@/components/layout/AppShell";
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
import { formatIntelligenceLabel } from "@/lib/intelligence-labels";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { isAdminForbidden } from "@/lib/admin-errors";

function formatDate(value?: string | null) {
    if (!value) return "Unknown";
    return new Date(value).toLocaleString();
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

    const { data, isLoading, isError, error, refetch } =
        useAdminRepository(repositoryId);

    const reprocessMutation = useAdminReprocessRepository(repositoryId);
    const deleteMutation = useAdminDeleteRepository();

    const repository = data?.repository;
    const stats = data?.stats;
    const intelligence = data?.intelligence;

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
                        "Failed to delete repository."
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
                    message:
                        error instanceof Error
                            ? error.message
                            : "Failed to delete repository.",
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
                                onClick={handleReprocess}
                                disabled={reprocessMutation.isPending}
                            >
                                <RefreshCcw
                                    className={`mr-2 h-4 w-4 ${reprocessMutation.isPending ? "animate-spin" : ""
                                        }`}
                                />
                                {reprocessMutation.isPending
                                    ? "Refreshing..."
                                    : "Refresh Intelligence"}
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={() => setIsDeleteDialogOpen(true)}
                                disabled={deleteMutation.isPending}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    }
                />

                {feedback && (
                    <div
                        className={`rounded-xl border p-4 ${feedback.type === "success"
                            ? "border-emerald-500/30 bg-emerald-500/10"
                            : "border-destructive/30 bg-destructive/10"
                            }`}
                    >
                        <p
                            className={`text-sm font-medium ${feedback.type === "success"
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
                    </div>
                )}

                {isError && isAdminForbidden(error) && <AdminAccessRequired />}

                {isError && !isAdminForbidden(error) && (
                    <AdminStateCard
                        title="Failed to load repository details"
                        description={
                            error instanceof Error
                                ? error.message
                                : "Please check backend connection."
                        }
                        onRetry={() => refetch()}
                    />
                )}

                {!isLoading && !isError && repository && (
                    <>
                        <div className="rounded-xl border border-border bg-card p-6">
                            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="text-2xl font-bold">
                                            {repository.fullName || repository.name}
                                        </h2>

                                        {repository.isTracked && <Badge>Tracked</Badge>}

                                        {repository.language && (
                                            <Badge variant="secondary">{repository.language}</Badge>
                                        )}
                                    </div>

                                    <p className="mt-3 text-sm text-muted-foreground">
                                        Owner: {repository.owner || data?.owner?.username || "Unknown"}
                                    </p>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Last intelligence refresh:{" "}
                                        {formatDate(repository.lastIntelligenceRefreshAt)}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline">Stars {repository.stars ?? 0}</Badge>
                                    <Badge variant="outline">Forks {repository.forks ?? 0}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                            <AdminStatCard
                                label="Timeline Entries"
                                value={stats?.totalTimelineEntries ?? repository.timelineCount ?? 0}
                                icon={History}
                            />

                            <AdminStatCard
                                label="Engineering Events"
                                value={stats?.totalEngineeringEvents ?? repository.eventCount ?? 0}
                                icon={GitBranch}
                            />

                            <AdminStatCard
                                label="Architecture Changes"
                                value={
                                    stats?.totalArchitectureChanges ??
                                    repository.architectureChangeCount ??
                                    0
                                }
                                icon={Layers3}
                            />

                            <AdminStatCard
                                label="Recommendations"
                                value={
                                    stats?.totalRecommendations ??
                                    repository.recommendationCount ??
                                    0
                                }
                                icon={Database}
                            />
                        </div>

                        <div className="rounded-xl border border-border bg-card p-6">
                            <h2 className="text-lg font-semibold">Repository Intelligence</h2>

                            <div className="mt-5 grid gap-5 lg:grid-cols-2">
                                <div className="rounded-xl border border-border bg-background p-4">
                                    <p className="text-sm text-muted-foreground">
                                        Primary Repository Type
                                    </p>

                                    <h3 className="mt-2 text-xl font-bold">
                                        {formatIntelligenceLabel(
                                            intelligence?.primaryRepositoryType ||
                                            repository.repositoryType ||
                                            "Unknown"
                                        )}
                                    </h3>
                                </div>

                                <div className="rounded-xl border border-border bg-background p-4">
                                    <p className="text-sm text-muted-foreground">
                                        Engineering Profile
                                    </p>

                                    <h3 className="mt-2 text-xl font-bold">
                                        {formatIntelligenceLabel(
                                            intelligence?.engineeringProfile || "Unknown"
                                        )}
                                    </h3>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-5 lg:grid-cols-3">
                                <InfoList
                                    title="Repository Types"
                                    items={intelligence?.repositoryTypes}
                                />

                                <InfoList
                                    title="Architecture Domains"
                                    items={intelligence?.architectureDomains}
                                />

                                <InfoList
                                    title="Technologies"
                                    items={intelligence?.technologies}
                                    raw
                                />
                            </div>
                        </div>

                        <SectionList
                            title="Recent Timeline"
                            empty="No timeline entries available."
                            items={data.timelineEntries}
                            render={(item) => (
                                <>
                                    <p className="font-medium">
                                        {item.title || "Timeline entry"}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {item.description || "No description available."}
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
                            items={data.architectureChanges}
                            render={(item) => (
                                <>
                                    <div className="flex flex-wrap gap-2">
                                        {item.changeType && (
                                            <Badge variant="secondary">
                                                {formatIntelligenceLabel(item.changeType)}
                                            </Badge>
                                        )}

                                        {item.detectedTechnology && (
                                            <Badge variant="outline">{item.detectedTechnology}</Badge>
                                        )}
                                    </div>

                                    <p className="mt-3 text-sm text-muted-foreground">
                                        {item.summary || "Architecture change detected."}
                                    </p>

                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {formatDate(item.createdAt)}
                                    </p>
                                </>
                            )}
                        />

                        <SectionList
                            title="Engineering Recommendations"
                            empty="No engineering recommendations available."
                            items={data.recommendations}
                            render={(item) => (
                                <>
                                    <div className="flex flex-wrap gap-2">
                                        {item.priority && (
                                            <Badge>{formatIntelligenceLabel(item.priority)}</Badge>
                                        )}

                                        {item.status && (
                                            <Badge variant="outline">
                                                {formatIntelligenceLabel(item.status)}
                                            </Badge>
                                        )}
                                    </div>

                                    <p className="mt-3 font-medium">
                                        {item.title || "Recommendation"}
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {item.description || "No description available."}
                                    </p>
                                </>
                            )}
                        />
                    </>
                )}

                <ConfirmDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    title="Delete repository?"
                    description="This will remove the repository and associated admin-visible data. This action cannot be undone."
                    confirmLabel="Delete Repository"
                    isLoading={deleteMutation.isPending}
                    onConfirm={handleDelete}
                />
            </div>
        </AppShell>
    );
}

function InfoList({
    title,
    items,
    raw,
}: {
    title: string;
    items?: string[];
    raw?: boolean;
}) {
    return (
        <div className="rounded-xl border border-border bg-background p-4">
            <p className="mb-3 text-sm font-medium">{title}</p>

            {!items || items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data available.</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {items.slice(0, 8).map((item, index) => (
                        <Badge key={`${item}-${index}`} variant="outline">
                            {raw ? item : formatIntelligenceLabel(item)}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}

function SectionList<T>({
    title,
    empty,
    items,
    render,
}: {
    title: string;
    empty: string;
    items?: T[];
    render: (item: T) => React.ReactNode;
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
                            key={index}
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
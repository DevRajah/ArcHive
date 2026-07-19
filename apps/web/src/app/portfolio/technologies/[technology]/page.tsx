"use client";

import Link from "next/link";
import {
    useEffect,
    useMemo,
} from "react";
import {
    useParams,
    useRouter,
} from "next/navigation";
import axios from "axios";
import {
    Activity,
    ArrowLeft,
    ArrowRight,
    Braces,
    CalendarClock,
    GitBranch,
    History,
    Layers3,
    Lightbulb,
    Network,
    RefreshCcw,
    SearchX,
    ShieldAlert,
    Sparkles,
    TriangleAlert,
} from "lucide-react";
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { PortfolioNavigation } from "@/components/portfolio/PortfolioNavigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useTechnologyDetail } from "@/hooks/usePortfolioTechnologies";

import { getUserId } from "@/lib/auth";
import { formatIntelligenceLabel } from "@/lib/intelligence-labels";

import type {
    TechnologyDetectionHistoryItem,
    TechnologyIntelligenceRepository,
    TechnologyNamedCount,
    TechnologyRecommendation,
} from "@/types/portfolio-technology.types";

function getHttpStatus(error: unknown) {
    if (!axios.isAxiosError(error)) {
        return null;
    }

    return error.response?.status ?? null;
}

function safeDecode(value: string) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function formatDate(
    value?: string | null
) {
    if (!value) return "Unknown";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Unknown";
    }

    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    );
}

function formatDateTime(
    value?: string | null
) {
    if (!value) return "Unknown";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Unknown";
    }

    return date.toLocaleString();
}

export default function TechnologyIntelligenceDetailPage() {
    const params = useParams<{
        technology: string;
    }>();

    const router = useRouter();
    const userId = getUserId();

    const technologyName = useMemo(
        () =>
            safeDecode(params.technology),
        [params.technology]
    );

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useTechnologyDetail(
        userId,
        technologyName
    );

    const status = getHttpStatus(error);

    useEffect(() => {
        if (status === 401) {
            router.replace("/connect-github");
        }
    }, [router, status]);

    return (
        <AppShell>
            <PageContent>
                <PortfolioNavigation />

                <Button
                    asChild
                    variant="ghost"
                    className="px-0"
                >
                    <Link href="/portfolio/technologies">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Technology Intelligence
                    </Link>
                </Button>

                {isLoading && (
                    <TechnologyDetailSkeleton />
                )}

                {isError &&
                    status === 403 && (
                        <DetailErrorState
                            icon={ShieldAlert}
                            title="Technology access denied"
                            description="The current ArcHive account cannot access this portfolio technology."
                        />
                    )}

                {isError &&
                    status === 404 && (
                        <DetailErrorState
                            icon={SearchX}
                            title="Technology not found in this portfolio"
                            description={`${technologyName} has not been detected in the current engineering portfolio.`}
                            action={
                                <Button
                                    asChild
                                    variant="outline"
                                >
                                    <Link href="/portfolio/technologies">
                                        Back to technologies
                                    </Link>
                                </Button>
                            }
                        />
                    )}

                {isError &&
                    status !== 401 &&
                    status !== 403 &&
                    status !== 404 && (
                        <DetailErrorState
                            icon={TriangleAlert}
                            title="Failed to load technology intelligence"
                            description={
                                error instanceof Error
                                    ? error.message
                                    : "ArcHive could not load this technology."
                            }
                            onRetry={() => refetch()}
                            isRetrying={isFetching}
                        />
                    )}

                {!isLoading &&
                    !isError &&
                    data && (
                        <>
                            <div className="rounded-xl border border-border bg-card p-6">
                                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                            <Braces className="h-5 w-5 text-primary" />
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h1 className="break-words text-3xl font-bold tracking-tight">
                                                    {data.technology.name}
                                                </h1>

                                                <Badge variant="secondary">
                                                    {
                                                        data.technology
                                                            .repositoryCount
                                                    }{" "}
                                                    repositories
                                                </Badge>
                                            </div>

                                            <p className="mt-2 max-w-3xl text-muted-foreground">
                                                See where this technology
                                                appears, which architecture
                                                domains and capabilities it
                                                supports, and how its adoption
                                                has evolved across the
                                                portfolio.
                                            </p>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <Badge variant="outline">
                                                    First detected{" "}
                                                    {formatDate(
                                                        data.technology
                                                            .firstDetectedAt
                                                    )}
                                                </Badge>

                                                <Badge variant="outline">
                                                    Last detected{" "}
                                                    {formatDate(
                                                        data.technology
                                                            .lastDetectedAt
                                                    )}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => refetch()}
                                        disabled={isFetching}
                                    >
                                        <RefreshCcw
                                            className={`mr-2 h-4 w-4 ${isFetching
                                                ? "animate-spin"
                                                : ""
                                                }`}
                                        />

                                        {isFetching
                                            ? "Refreshing..."
                                            : "Refresh Technology"}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                                <DetailMetricCard
                                    label="Repositories"
                                    value={
                                        data.technology
                                            .repositoryCount
                                    }
                                    icon={GitBranch}
                                />

                                <DetailMetricCard
                                    label="Tracked Repositories"
                                    value={
                                        data.technology
                                            .trackedRepositoryCount
                                    }
                                    icon={Activity}
                                />

                                <DetailMetricCard
                                    label="Architecture Domains"
                                    value={
                                        data.technology
                                            .architectureDomainCount
                                    }
                                    icon={Layers3}
                                />

                                <DetailMetricCard
                                    label="Repository Types"
                                    value={
                                        data.technology
                                            .repositoryTypeCount
                                    }
                                    icon={Network}
                                />

                                <DetailMetricCard
                                    label="Capabilities"
                                    value={
                                        data.technology
                                            .capabilityCount
                                    }
                                    icon={Sparkles}
                                />

                                <DetailMetricCard
                                    label="Recommendations"
                                    value={
                                        data.technology
                                            .recommendationCount
                                    }
                                    icon={Lightbulb}
                                />
                            </div>

                            <section className="rounded-xl border border-border bg-card p-6">
                                <h2 className="text-lg font-semibold">
                                    Repositories Using This Technology
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Repository usage, architecture
                                    context, capabilities, and matching
                                    intelligence records.
                                </p>

                                {data.repositories.length ===
                                    0 ? (
                                    <SectionEmptyState message="No repositories currently use this technology." />
                                ) : (
                                    <div className="mt-6 grid gap-4 xl:grid-cols-2">
                                        {data.repositories.map(
                                            (repository) => (
                                                <TechnologyRepositoryCard
                                                    key={repository.id}
                                                    repository={
                                                        repository
                                                    }
                                                />
                                            )
                                        )}
                                    </div>
                                )}
                            </section>

                            <section className="rounded-xl border border-border bg-card p-6">
                                <h2 className="text-lg font-semibold">
                                    Adoption Timeline
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    New repository adoption and
                                    cumulative portfolio adoption over
                                    time.
                                </p>

                                {data.adoptionTimeline.length ===
                                    0 ? (
                                    <SectionEmptyState message="No adoption timeline is available yet." />
                                ) : (
                                    <div className="mt-6 h-96 min-w-0">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <ComposedChart
                                                data={
                                                    data.adoptionTimeline
                                                }
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                />

                                                <XAxis
                                                    dataKey="period"
                                                    tick={{
                                                        fontSize: 11,
                                                    }}
                                                />

                                                <YAxis
                                                    allowDecimals={false}
                                                    tick={{
                                                        fontSize: 11,
                                                    }}
                                                />

                                                <Tooltip />

                                                <Legend />

                                                <Bar
                                                    dataKey="newlyAdoptedRepositories"
                                                    name="Newly Adopted"
                                                    fill="currentColor"
                                                    className="text-primary/50"
                                                    radius={[6, 6, 0, 0]}
                                                />

                                                <Line
                                                    type="monotone"
                                                    dataKey="cumulativeRepositories"
                                                    name="Cumulative Repositories"
                                                    stroke="currentColor"
                                                    className="text-primary"
                                                    strokeWidth={3}
                                                    dot
                                                />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </section>

                            <section className="grid gap-6 xl:grid-cols-3">
                                <RankedCountSection
                                    title="Architecture Domains"
                                    items={
                                        data.architectureDomains
                                    }
                                />

                                <RankedCountSection
                                    title="Repository Types"
                                    items={
                                        data.repositoryTypes
                                    }
                                />

                                <RankedCountSection
                                    title="Capabilities"
                                    items={data.capabilities}
                                />
                            </section>

                            <section className="rounded-xl border border-border bg-card p-6">
                                <h2 className="text-lg font-semibold">
                                    Related Technologies
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Technologies detected in the same
                                    repositories.
                                </p>

                                {data.relatedTechnologies
                                    .length === 0 ? (
                                    <SectionEmptyState message="No related technologies detected." />
                                ) : (
                                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                        {data.relatedTechnologies.map(
                                            (relatedTechnology, index) => {
                                                const relatedTechnologyName =
                                                    relatedTechnology.name ||
                                                    `related-technology-${index}`;

                                                return (
                                                    <Link
                                                        key={`${relatedTechnologyName}-${index}`}
                                                        href={`/portfolio/technologies/${encodeURIComponent(
                                                            relatedTechnologyName
                                                        )}`}
                                                        className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4 transition hover:border-primary/50 hover:bg-accent"
                                                    >
                                                        <div>
                                                            <p className="font-medium">
                                                                {relatedTechnology.name ||
                                                                    "Unknown technology"}
                                                            </p>

                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {(
                                                                    relatedTechnology.sharedRepositoryCount ??
                                                                    0
                                                                ).toLocaleString()}{" "}
                                                                shared{" "}
                                                                {relatedTechnology.sharedRepositoryCount ===
                                                                    1
                                                                    ? "repository"
                                                                    : "repositories"}
                                                            </p>
                                                        </div>

                                                        <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                                                    </Link>
                                                );
                                            }
                                        )}
                                    </div>
                                )}
                            </section>

                            <section className="rounded-xl border border-border bg-card p-6">
                                <h2 className="text-lg font-semibold">
                                    Technology Recommendations
                                </h2>

                                {data.recommendations.length ===
                                    0 ? (
                                    <SectionEmptyState message="No technology-specific recommendations detected." />
                                ) : (
                                    <div className="mt-6 space-y-4">
                                        {data.recommendations.map(
                                            (recommendation) => (
                                                <RecommendationCard
                                                    key={
                                                        recommendation.id
                                                    }
                                                    recommendation={
                                                        recommendation
                                                    }
                                                />
                                            )
                                        )}
                                    </div>
                                )}
                            </section>

                            <section className="rounded-xl border border-border bg-card p-6">
                                <h2 className="text-lg font-semibold">
                                    Detection History
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Chronological evidence of where and
                                    when ArcHive detected this
                                    technology.
                                </p>

                                {data.detectionHistory.length ===
                                    0 ? (
                                    <SectionEmptyState message="No detection history is available." />
                                ) : (
                                    <DetectionHistory
                                        items={
                                            data.detectionHistory
                                        }
                                    />
                                )}
                            </section>
                        </>
                    )}
            </PageContent>
        </AppShell>
    );
}

function TechnologyRepositoryCard({
    repository,
}: {
    repository: TechnologyIntelligenceRepository;
}) {
    return (
        <div className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h3 className="break-words font-semibold">
                        {repository.fullName ||
                            repository.name}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {repository.language ||
                            "Language unavailable"}
                    </p>
                </div>

                <Badge
                    variant={
                        repository.isTracked
                            ? "default"
                            : "outline"
                    }
                >
                    {repository.isTracked
                        ? "Tracked"
                        : "Not tracked"}
                </Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <SmallMetric
                    label="Architecture Changes"
                    value={
                        repository.matchingArchitectureChanges ??
                        0
                    }
                />

                <SmallMetric
                    label="Recommendations"
                    value={
                        repository.matchingRecommendations ??
                        0
                    }
                />
            </div>

            <div className="mt-4 space-y-4">
                <BadgeList
                    title="Architecture Domains"
                    items={
                        repository.architectureDomains
                    }
                />

                <BadgeList
                    title="Repository Types"
                    items={repository.repositoryTypes}
                />

                <BadgeList
                    title="Capabilities"
                    items={repository.capabilities}
                />
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>
                    First detected{" "}
                    {formatDate(
                        repository.firstDetectedAt
                    )}
                </span>

                <span>•</span>

                <span>
                    Last detected{" "}
                    {formatDate(
                        repository.lastDetectedAt
                    )}
                </span>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <RepositoryLink
                    href={`/repositories/${repository.id}`}
                    label="Overview"
                />

                <RepositoryLink
                    href={`/repositories/${repository.id}/intelligence`}
                    label="Intelligence"
                />

                <RepositoryLink
                    href={`/repositories/${repository.id}/architecture`}
                    label="Architecture"
                />

                <RepositoryLink
                    href={`/repositories/${repository.id}/timeline`}
                    label="Timeline"
                />

                <RepositoryLink
                    href={`/repositories/${repository.id}/knowledge-graph`}
                    label="Knowledge Graph"
                />

                <RepositoryLink
                    href={`/repositories/${repository.id}/intelligence/diff`}
                    label="Intelligence Diff"
                />
            </div>
        </div>
    );
}

function RecommendationCard({
    recommendation,
}: {
    recommendation: TechnologyRecommendation;
}) {
    const statusClassName =
        recommendation.status === "RESOLVED"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
            : recommendation.status === "DISMISSED"
                ? "border-border bg-muted text-muted-foreground"
                : "border-amber-500/30 bg-amber-500/10 text-amber-600";

    return (
        <article className="rounded-xl border border-border bg-background p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                    <h3 className="font-semibold">
                        {recommendation.title}
                    </h3>

                    {recommendation.repository && (
                        <Link
                            href={`/repositories/${recommendation.repository.id}/intelligence`}
                            className="mt-1 inline-block text-sm font-medium text-primary hover:underline"
                        >
                            {recommendation.repository
                                .fullName ||
                                recommendation.repository
                                    .name ||
                                "Repository"}
                        </Link>
                    )}
                </div>

                <Badge
                    variant="outline"
                    className={statusClassName}
                >
                    {formatIntelligenceLabel(
                        recommendation.status
                    )}
                </Badge>
            </div>

            {recommendation.description && (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {recommendation.description}
                </p>
            )}

            {recommendation.evidence && (
                <div className="mt-4 rounded-lg border border-border bg-card p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                        Evidence
                    </p>

                    <p className="mt-2 text-sm leading-6">
                        {recommendation.evidence}
                    </p>
                </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>
                    Created{" "}
                    {formatDateTime(
                        recommendation.createdAt
                    )}
                </span>

                {recommendation.resolvedAt && (
                    <span>
                        Resolved{" "}
                        {formatDateTime(
                            recommendation.resolvedAt
                        )}
                    </span>
                )}
            </div>
        </article>
    );
}

function DetectionHistory({
    items,
}: {
    items: TechnologyDetectionHistoryItem[];
}) {
    const sortedItems = [...items].sort(
        (first, second) =>
            new Date(
                second.detectedAt
            ).getTime() -
            new Date(
                first.detectedAt
            ).getTime()
    );

    return (
        <div className="mt-6 space-y-4">
            {sortedItems.map((item) => (
                <article
                    key={item.id}
                    className="rounded-xl border border-border bg-background p-5"
                >
                    <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-primary/10 p-2">
                            <History className="h-4 w-4 text-primary" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                {item.repository && (
                                    <Link
                                        href={`/repositories/${item.repository.id}`}
                                        className="font-medium text-primary hover:underline"
                                    >
                                        {item.repository.fullName ||
                                            item.repository.name ||
                                            "Repository"}
                                    </Link>
                                )}

                                {item.architectureDomain && (
                                    <Badge variant="secondary">
                                        {formatIntelligenceLabel(
                                            item.architectureDomain
                                        )}
                                    </Badge>
                                )}
                            </div>

                            {item.summary && (
                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                    {item.summary}
                                </p>
                            )}

                            {item.fileAffected && (
                                <div className="mt-3 rounded-lg border border-border bg-card px-3 py-2">
                                    <p className="break-all font-mono text-xs">
                                        {item.fileAffected}
                                    </p>
                                </div>
                            )}

                            <p className="mt-3 text-xs text-muted-foreground">
                                Detected{" "}
                                {formatDateTime(
                                    item.detectedAt
                                )}
                            </p>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}

function RankedCountSection({
    title,
    items,
}: {
    title: string;
    items: TechnologyNamedCount[];
}) {
    const sortedItems = [...items].sort(
        (first, second) =>
            second.count - first.count
    );

    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold">
                {title}
            </h2>

            {sortedItems.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                    No {title.toLowerCase()} detected.
                </p>
            ) : (
                <div className="mt-4 space-y-3">
                    {sortedItems.map((item) => (
                        <div
                            key={item.name}
                            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3"
                        >
                            <span className="min-w-0 truncate text-sm font-medium">
                                {formatIntelligenceLabel(
                                    item.name
                                )}
                            </span>

                            <Badge variant="secondary">
                                {item.count}
                            </Badge>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function BadgeList({
    title,
    items,
}: {
    title: string;
    items?: string[];
}) {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div>
            <p className="text-xs font-medium text-muted-foreground">
                {title}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
                {items.map((item) => (
                    <Badge
                        key={item}
                        variant="outline"
                    >
                        {formatIntelligenceLabel(item)}
                    </Badge>
                ))}
            </div>
        </div>
    );
}

function RepositoryLink({
    href,
    label,
}: {
    href: string;
    label: string;
}) {
    return (
        <Button
            asChild
            variant="outline"
            size="sm"
            className="justify-between"
        >
            <Link href={href}>
                {label}
                <ArrowRight className="h-3.5 w-3.5" />
            </Link>
        </Button>
    );
}

function DetailMetricCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number;
    icon: typeof Braces;
}) {
    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-muted-foreground">
                        {label}
                    </p>

                    <p className="mt-3 text-3xl font-bold">
                        {(value ?? 0).toLocaleString()}
                    </p>
                </div>

                <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
            </div>
        </div>
    );
}

function SmallMetric({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">
                {label}
            </p>

            <p className="mt-1 text-lg font-bold">
                {(value ?? 0).toLocaleString()}
            </p>
        </div>
    );
}

function SectionEmptyState({
    message,
}: {
    message: string;
}) {
    return (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-background p-8 text-center">
            <p className="text-sm text-muted-foreground">
                {message}
            </p>
        </div>
    );
}

function TechnologyDetailSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-52 rounded-xl" />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                {Array.from({ length: 6 }).map(
                    (_, index) => (
                        <Skeleton
                            key={index}
                            className="h-32 rounded-xl"
                        />
                    )
                )}
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                {Array.from({ length: 4 }).map(
                    (_, index) => (
                        <Skeleton
                            key={index}
                            className="h-72 rounded-xl"
                        />
                    )
                )}
            </div>

            <Skeleton className="h-96 rounded-xl" />

            <div className="grid gap-6 xl:grid-cols-3">
                {Array.from({ length: 3 }).map(
                    (_, index) => (
                        <Skeleton
                            key={index}
                            className="h-80 rounded-xl"
                        />
                    )
                )}
            </div>
        </div>
    );
}

function DetailErrorState({
    icon: Icon,
    title,
    description,
    action,
    onRetry,
    isRetrying,
}: {
    icon: typeof TriangleAlert;
    title: string;
    description: string;
    action?: React.ReactNode;
    onRetry?: () => void;
    isRetrying?: boolean;
}) {
    return (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
            <Icon className="mx-auto h-9 w-9 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-semibold">
                {title}
            </h2>

            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {description}
            </p>

            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}

            {onRetry && (
                <Button
                    type="button"
                    variant="outline"
                    className="mt-6"
                    onClick={onRetry}
                    disabled={isRetrying}
                >
                    <RefreshCcw
                        className={`mr-2 h-4 w-4 ${isRetrying
                            ? "animate-spin"
                            : ""
                            }`}
                    />

                    Retry
                </Button>
            )}
        </div>
    );
}
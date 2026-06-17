"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ShieldCheck, TriangleAlert } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepositoryIntelligenceAudit } from "@/hooks/useRepositories";
import { formatFilterLabel } from "@/lib/filters";
import { RepositoryIntelligenceNav } from "@/components/repositories/RepositoryIntelligenceNav";
import { PageContent } from "@/components/layout/PageContent";

function normalizeList(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.flatMap((item) => normalizeList(item));
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);

            if (Array.isArray(parsed)) {
                return parsed.map((item) => String(item));
            }
        } catch {
            return [value];
        }

        return [value];
    }

    if (value && typeof value === "object") {
        return Object.values(value).flatMap((item) => normalizeList(item));
    }

    return [];
}

function ListBlock({
    title,
    items,
    tone = "neutral",
}: {
    title: string;
    items?: string[];
    tone?: "neutral" | "success" | "warning";
}) {
    const normalizedItems = normalizeList(items);
    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">{title}</h2>

            {normalizedItems.length === 0 ? (<p className="mt-3 text-sm text-muted-foreground">
                No items detected yet.
            </p>
            ) : (
                <div className="mt-4 space-y-2">
                    {normalizedItems.map((item, index) => (<div
                        key={`${item}-${index}`}
                        className={`rounded-lg border p-3 text-sm ${tone === "warning"
                            ? "border-yellow-500/30 bg-yellow-500/10"
                            : tone === "success"
                                ? "border-emerald-500/30 bg-emerald-500/10"
                                : "border-border bg-background"
                            }`}
                    >
                        {item}
                    </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function RepositoryAuditPage() {
    const params = useParams<{ repoId: string }>();
    const repoId = params.repoId;

    const { data, isLoading, isError, error } =
        useRepositoryIntelligenceAudit(repoId);

    return (
        <AppShell>
            <PageContent>
                <Button asChild variant="ghost" className="px-0">
                    <Link href={`/repositories/${repoId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to repository overview
                    </Link>
                </Button>

                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Intelligence Quality Audit
                            </h1>

                            <p className="mt-2 max-w-3xl text-muted-foreground">
                                Shows how much ArcHive trusts its repository understanding,
                                which signals were used, and where the classification can
                                improve.
                            </p>
                        </div>
                    </div>
                </div>
                <RepositoryIntelligenceNav repositoryId={repoId} />

                {isLoading && <Skeleton className="h-80 rounded-xl" />}

                {isError && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
                        <p className="font-medium text-destructive">
                            Failed to load intelligence audit
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {error instanceof Error ? error.message : "Please check backend."}
                        </p>
                    </div>
                )}

                {!isLoading && !isError && data && (
                    <>
                        <div className="rounded-xl border border-border bg-card p-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <TriangleAlert className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold">Audit Status</h2>
                                <Badge variant="secondary">
                                    {data.auditStatus
                                        ? formatFilterLabel(data.auditStatus)
                                        : "Unknown"}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-2">
                            <ListBlock title="Strengths" items={data.strengths} tone="success" />
                            <ListBlock title="Warnings" items={data.warnings} tone="warning" />
                            <ListBlock title="Improvement Areas" items={data.improvementAreas} />
                            <ListBlock title="Signals Used" items={data.signals} />
                        </div>
                    </>
                )}
            </PageContent>
        </AppShell>
    );
}
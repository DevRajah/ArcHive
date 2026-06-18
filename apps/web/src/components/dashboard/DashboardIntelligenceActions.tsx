"use client";

import { useEffect, useState } from "react";
import { BriefcaseBusiness, GitCompareArrows, RefreshCcw, Sparkles, } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useReprocessAllRepositories } from "@/hooks/useRepositories";
import Link from "next/link";

export function DashboardIntelligenceActions() {
    const queryClient = useQueryClient();
    const reprocessAllMutation = useReprocessAllRepositories();

    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    function refreshAllIntelligence() {
        reprocessAllMutation.mutate(undefined, {
            onSuccess: async () => {
                setFeedback({
                    type: "success",
                    message:
                        "Portfolio intelligence refresh queued successfully. ArcHive will update repository intelligence after processing.",
                });

                await Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: QUERY_KEYS.INTELLIGENCE_OVERVIEW,
                    }),

                    queryClient.invalidateQueries({
                        queryKey: ["intelligence-search"],
                    }),

                    queryClient.invalidateQueries({
                        queryKey: ["repositories"],
                    }),

                    queryClient.invalidateQueries({
                        queryKey: ["dashboard"],
                    }),

                    // queryClient.invalidateQueries({
                    //     queryKey: QUERY_KEYS.REPOSITORIES,
                    // }),

                    // queryClient.invalidateQueries({
                    //     queryKey: QUERY_KEYS.TRACKED_REPOSITORIES,
                    // }),
                ]);
            },

            onError: (error) => {
                setFeedback({
                    type: "error",
                    message:
                        error instanceof Error
                            ? error.message
                            : "Failed to refresh portfolio intelligence.",
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
        <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold">
                            Portfolio Intelligence Actions
                        </h2>

                        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                            Refresh semantic intelligence, repository purpose, engineering
                            quality, maturity, architecture signals, and advisor
                            recommendations across all tracked repositories.
                        </p>
                    </div>
                </div>

                <Button asChild variant="outline">
                    <Link href="/portfolio">
                        <BriefcaseBusiness className="mr-2 h-4 w-4" />
                        Portfolio Intelligence
                    </Link>
                </Button>

                <div className="flex flex-wrap gap-3">
                    <Button asChild variant="outline">
                        <Link href="/compare">
                            <GitCompareArrows className="mr-2 h-4 w-4" />
                            Compare Repositories
                        </Link>
                    </Button>

                    <Button
                        onClick={refreshAllIntelligence}
                        disabled={reprocessAllMutation.isPending}
                    >
                        <RefreshCcw
                            className={`mr-2 h-4 w-4 ${reprocessAllMutation.isPending ? "animate-spin" : ""
                                }`}
                        />

                        {reprocessAllMutation.isPending
                            ? "Refreshing..."
                            : "Refresh All Intelligence"}
                    </Button>
                </div>
            </div>

            {feedback && (
                <div
                    className={`mt-5 rounded-xl border p-4 ${feedback.type === "success"
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
        </div>
    );
}
"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface AdvisorScoreCardProps {
    label: string;
    value: number | string;
    description: string;
    icon: LucideIcon;
    progress?: number;
}

function normalizeProgress(value?: number) {
    if (
        typeof value !== "number" ||
        !Number.isFinite(value)
    ) {
        return 0;
    }

    const normalized =
        value <= 1 ? value * 100 : value;

    return Math.max(
        0,
        Math.min(100, normalized)
    );
}

function displayScore(value: number | string) {
    if (typeof value === "string") {
        return value;
    }

    const normalized =
        value <= 1 ? value * 100 : value;

    return Math.round(normalized);
}

export function AdvisorScoreCard({
    label,
    value,
    description,
    icon: Icon,
    progress,
}: AdvisorScoreCardProps) {
    const progressValue = normalizeProgress(
        progress ??
            (typeof value === "number"
                ? value
                : undefined)
    );

    return (
        <motion.article
            initial={{
                opacity: 0,
                y: 12,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.35,
            }}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background">
                    <Icon className="h-5 w-5 text-primary" />
                </div>

                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Engineering signal
                </span>
            </div>

            <p className="mt-5 text-sm font-medium text-muted-foreground">
                {label}
            </p>

            <p
                className={cn(
                    "mt-1 break-words font-bold tracking-tight",
                    typeof value === "string"
                        ? "text-2xl"
                        : "text-4xl"
                )}
            >
                {displayScore(value)}

                {typeof value === "number" && (
                    <span className="ml-1 text-lg font-medium text-muted-foreground">
                        /100
                    </span>
                )}
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{
                        width: `${progressValue}%`,
                    }}
                    transition={{
                        duration: 0.7,
                        ease: "easeOut",
                    }}
                    className="h-full rounded-full bg-primary"
                />
            </div>

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {description}
            </p>
        </motion.article>
    );
}
"use client";

import { motion } from "framer-motion";
import {
    CircleHelp,
    FileSearch,
    Lightbulb,
    ShieldAlert,
    Sparkles,
} from "lucide-react";

import { AdvisorSeverityBadge } from "@/components/advisor/AdvisorSeverityBadge";
import { Badge } from "@/components/ui/badge";

import type {
    AdvisorFinding,
    ArchitectureAdvisorFindingKind,
} from "@/types/architecture-advisor.types";

function normalizeEvidence(
    evidence: string[] | string
) {
    if (Array.isArray(evidence)) {
        return evidence.filter(Boolean);
    }

    if (!evidence) {
        return [];
    }

    return [evidence];
}

/**
 * Presentation metadata for the backend-owned finding kind.
 *
 * Important:
 * This does not infer semantics from severity, title, category,
 * section name, or recommendation text.
 *
 * New Architecture Advisor assessments should always provide `kind`,
 * but older persisted assessments may predate that discriminator.
 *
 * In that legacy case, we deliberately show "Classification unavailable"
 * rather than guessing whether the finding means improvement,
 * unverified evidence, strength, or confirmed risk.
 */
function getFindingKindPresentation(
    kind?: ArchitectureAdvisorFindingKind
) {
    switch (kind) {
        case "STRENGTH":
            return {
                label: "Strength",
                icon: Sparkles,
                className:
                    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
            };

        case "IMPROVEMENT":
            return {
                label: "Improvement",
                icon: Lightbulb,
                className:
                    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
            };

        case "UNVERIFIED":
            return {
                label: "Unverified",
                icon: CircleHelp,
                className:
                    "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
            };

        case "CONFIRMED_RISK":
            return {
                label: "Confirmed Risk",
                icon: ShieldAlert,
                className:
                    "border-destructive/30 bg-destructive/10 text-destructive",
            };

        default:
            /*
             * Backward compatibility for persisted advisor assessments
             * generated before finding.kind was introduced.
             *
             * Missing semantic classification must never be translated into
             * CONFIRMED_RISK, IMPROVEMENT, UNVERIFIED, or STRENGTH by the UI.
             */
            return {
                label: "Classification unavailable",
                icon: CircleHelp,
                className:
                    "border-border bg-muted/50 text-muted-foreground",
            };
    }
}

export function AdvisorFindingCard({
    finding,
    index = 0,
}: {
    finding: AdvisorFinding;
    index?: number;
}) {
    const evidence = normalizeEvidence(
        finding.evidence
    );

    const kindPresentation =
        getFindingKindPresentation(
            finding.kind
        );

    /*
     * getFindingKindPresentation always returns a valid presentation
     * object, including for older persisted findings with no kind.
     */
    const KindIcon =
        kindPresentation.icon;

    return (
        <motion.article
            initial={{
                opacity: 0,
                y: 14,
            }}
            whileInView={{
                opacity: 1,
                y: 0,
            }}
            viewport={{
                once: true,
                margin: "-40px",
            }}
            transition={{
                duration: 0.35,
                delay: Math.min(
                    index * 0.04,
                    0.2
                ),
            }}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
        >
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        {/*
                         * `kind` is the primary semantic label.
                         *
                         * Severity remains visible, but severity alone must
                         * never be interpreted as confirmed risk.
                         */}
                        <Badge
                            variant="outline"
                            className={
                                kindPresentation.className
                            }
                        >
                            <KindIcon className="mr-1.5 h-3.5 w-3.5" />

                            {
                                kindPresentation.label
                            }
                        </Badge>

                        <AdvisorSeverityBadge
                            severity={
                                finding.severity
                            }
                        />

                        <Badge variant="outline">
                            {finding.category}
                        </Badge>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold leading-7">
                        {finding.title}
                    </h3>
                </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {finding.description}
            </p>

            {evidence.length > 0 && (
                <div className="mt-5 rounded-lg border border-border bg-background p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <FileSearch className="h-4 w-4 text-primary" />
                        Evidence
                    </div>

                    <ul className="mt-3 space-y-2">
                        {evidence.map(
                            (
                                item,
                                evidenceIndex
                            ) => (
                                <li
                                    key={`${item}-${evidenceIndex}`}
                                    className="flex gap-2 text-sm leading-6 text-muted-foreground"
                                >
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />

                                    <span>
                                        {item}
                                    </span>
                                </li>
                            )
                        )}
                    </ul>
                </div>
            )}

            {finding.recommendation && (
                <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        Engineering recommendation
                    </div>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {
                            finding.recommendation
                        }
                    </p>
                </div>
            )}
        </motion.article>
    );
}
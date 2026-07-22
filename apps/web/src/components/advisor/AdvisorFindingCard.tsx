"use client";

import { motion } from "framer-motion";
import {
    FileSearch,
    Lightbulb,
} from "lucide-react";

import { AdvisorSeverityBadge } from "@/components/advisor/AdvisorSeverityBadge";
import { Badge } from "@/components/ui/badge";

import type { AdvisorFinding } from "@/types/architecture-advisor.types";

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
                delay: Math.min(index * 0.04, 0.2),
            }}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
        >
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <AdvisorSeverityBadge
                            severity={finding.severity}
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
                            (item, evidenceIndex) => (
                                <li
                                    key={`${item}-${evidenceIndex}`}
                                    className="flex gap-2 text-sm leading-6 text-muted-foreground"
                                >
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                    <span>{item}</span>
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
                        {finding.recommendation}
                    </p>
                </div>
            )}
        </motion.article>
    );
}
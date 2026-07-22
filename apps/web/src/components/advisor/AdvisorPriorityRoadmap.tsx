"use client";

import { motion } from "framer-motion";

import { AdvisorSeverityBadge } from "@/components/advisor/AdvisorSeverityBadge";
import { Badge } from "@/components/ui/badge";

import type { AdvisorPriorityAction } from "@/types/architecture-advisor.types";

export function AdvisorPriorityRoadmap({
    actions,
}: {
    actions: AdvisorPriorityAction[];
}) {
    if (actions.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                <h3 className="font-semibold">
                    No priority actions identified
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                    The advisor did not identify an immediate
                    engineering action for this assessment.
                </p>
            </div>
        );
    }

    const sortedActions = [...actions].sort(
        (first, second) =>
            first.priority - second.priority
    );

    return (
        <div className="relative space-y-0">
            <div className="absolute bottom-6 left-6 top-6 hidden w-px bg-border sm:block" />

            {sortedActions.map((action, index) => (
                <motion.article
                    key={`${action.priority}-${action.title}`}
                    initial={{
                        opacity: 0,
                        x: -12,
                    }}
                    whileInView={{
                        opacity: 1,
                        x: 0,
                    }}
                    viewport={{ once: true }}
                    transition={{
                        duration: 0.35,
                        delay: Math.min(index * 0.06, 0.3),
                    }}
                    className="relative pb-6 sm:pl-16"
                >
                    <div className="absolute left-0 top-0 hidden h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-background text-lg font-bold text-primary shadow-sm sm:flex">
                        {action.priority}
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex flex-wrap gap-2">
                            <AdvisorSeverityBadge
                                severity={action.severity}
                            />

                            <Badge variant="outline">
                                {action.category}
                            </Badge>

                            <Badge
                                variant="secondary"
                                className="sm:hidden"
                            >
                                Priority {action.priority}
                            </Badge>
                        </div>

                        <h3 className="mt-4 text-lg font-semibold">
                            {action.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {action.description}
                        </p>

                        {action.rationale && (
                            <div className="mt-4 rounded-lg border border-border bg-background p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Why this matters
                                </p>

                                <p className="mt-2 text-sm leading-6">
                                    {action.rationale}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.article>
            ))}
        </div>
    );
}
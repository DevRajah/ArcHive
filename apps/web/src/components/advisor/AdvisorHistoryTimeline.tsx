import {
    CalendarClock,
    ShieldAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type {
    AdvisorHistoryItem,
} from "@/types/architecture-advisor.types";

function normalizePercentage(
    value: number
) {
    const normalized =
        value <= 1
            ? value * 100
            : value;

    return Math.round(normalized);
}

function formatDate(
    value: string
) {
    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return new Intl.DateTimeFormat(
        "en-GB",
        {
            dateStyle: "medium",
            timeStyle: "short",
        }
    ).format(date);
}

export function AdvisorHistoryTimeline({
    history,
}: {
    history: AdvisorHistoryItem[];
}) {
    if (
        history.length === 0
    ) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                <CalendarClock className="mx-auto h-9 w-9 text-muted-foreground" />

                <h3 className="mt-4 font-semibold">
                    No assessment history yet
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                    Refreshed advisor assessments will appear
                    here as the repository evolves.
                </p>
            </div>
        );
    }

    const sortedHistory =
        [...history].sort(
            (
                first,
                second
            ) =>
                new Date(
                    second.generatedAt
                ).getTime() -
                new Date(
                    first.generatedAt
                ).getTime()
        );

    return (
        <div className="relative">
            <div className="absolute bottom-4 left-[7px] top-4 w-px bg-border" />

            <div className="space-y-5">
                {sortedHistory.map(
                    (
                        item,
                        index
                    ) => (
                        <button
                            key={
                                item.id ??
                                `${item.generatedAt}-${index}`
                            }
                            type="button"
                            className="relative block w-full pl-8 text-left"
                        >
                            <span className="absolute left-0 top-5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />

                            <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/40">
                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                    <div>
                                        <p className="font-semibold">
                                            {
                                                item.maturityLabel
                                            }
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {formatDate(
                                                item.generatedAt
                                            )}
                                        </p>
                                    </div>

                                    <Badge variant="outline">
                                        Assessment{" "}
                                        {
                                            sortedHistory.length -
                                            index
                                        }
                                    </Badge>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    {/*
                                     * Historical Advisor items currently do
                                     * not expose evidenceSufficient.
                                     *
                                     * Therefore the frontend cannot safely
                                     * distinguish:
                                     *
                                     * assessed risk = 0
                                     *
                                     * from
                                     *
                                     * insufficient-evidence risk = 0.
                                     *
                                     * Do not reconstruct that semantic state
                                     * from the numeric score.
                                     */}
                                    <HistoryMetric
                                        label="Risk"
                                        value="Not available"
                                        description="Historical evidence sufficiency is not available for this assessment."
                                        icon={
                                            ShieldAlert
                                        }
                                    />

                                    <HistoryMetric
                                        label="Confidence"
                                        value={`${normalizePercentage(
                                            item.confidenceScore
                                        )}%`}
                                        icon={
                                            CalendarClock
                                        }
                                    />
                                </div>
                            </div>
                        </button>
                    )
                )}
            </div>
        </div>
    );
}

function HistoryMetric({
    label,
    value,
    description,
    icon: Icon,
}: {
    label: string;
    value: string;
    description?: string;
    icon: typeof ShieldAlert;
}) {
    return (
        <div className="rounded-lg border border-border bg-background p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>

            <p className="mt-1 font-bold">
                {value}
            </p>

            {description ? (
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {description}
                </p>
            ) : null}
        </div>
    );
}
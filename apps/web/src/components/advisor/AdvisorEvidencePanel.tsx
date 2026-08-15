import {
    Boxes,
    CheckCircle2,
    GitCommitHorizontal,
    Info,
    Layers3,
    Lightbulb,
    Network,
    PackageSearch,
} from "lucide-react";

import type { AdvisorEvidenceSummary } from "@/types/architecture-advisor.types";

export function AdvisorEvidencePanel({
    evidence,
}: {
    evidence: AdvisorEvidenceSummary;
}) {
    const metrics = [
        {
            label: "Intelligence Snapshot",
            value: evidence.intelligenceSnapshotAvailable
                ? "Available"
                : "Unavailable",
            icon: CheckCircle2,
        },
        {
            label: "Architecture Changes",
            value: evidence.architectureChanges,
            icon: GitCommitHorizontal,
        },
        {
            label: "Recommendations",
            value: evidence.recommendations,
            icon: Lightbulb,
        },
        {
            label: "Technologies",
            value: evidence.technologyCount,
            icon: PackageSearch,
        },
        {
            label: "Capabilities",
            value: evidence.capabilityCount,
            icon: Boxes,
        },
        {
            label: "Repository Types",
            value: evidence.repositoryTypes,
            icon: Layers3,
        },
        {
            label: "Architecture Domains",
            value: evidence.architectureDomains,
            icon: Network,
        },
    ];

    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <div>
                <h2 className="text-xl font-semibold">
                    Evidence Summary
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Intelligence signals available to the Architecture Advisor.
                </p>
            </div>

            {!evidence.evidenceSufficient && (
                <div className="mt-5 flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                    <div>
                        <p className="font-semibold">
                            Assessment evidence is still developing
                        </p>

                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            ArcHive has some repository intelligence available, but not yet enough evidence to produce a reliable architecture assessment.
                        </p>
                    </div>
                </div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => {
                    const Icon = metric.icon;

                    return (
                        <div
                            key={metric.label}
                            className="rounded-lg border border-border bg-background p-4"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                <Icon className="h-4 w-4 text-primary" />
                            </div>

                            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {metric.label}
                            </p>

                            <p className="mt-1 break-words text-xl font-bold">
                                {typeof metric.value ===
                                    "number"
                                    ? metric.value.toLocaleString()
                                    : metric.value}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
"use client";

import Link from "next/link";
import {
    ArrowRight,
    Brain,
    GitBranch,
    Layers3,
    Network,
    Radar,
    ShieldCheck,
    Lightbulb,
} from "lucide-react";

interface RepositoryIntelligenceCardsProps {
    repositoryId: string;
}

const cards = [
    {
        title: "Intelligence Report",
        description:
            "Open the AI Staff Engineer report with semantic profile, reasoning, audit, and recommendations.",
        hrefSuffix: "intelligence",
        icon: Brain,
    },
    {
        title: "Narrative Intelligence",
        description:
            "Understand repository purpose, engineering profile, reasoning signals, and specializations.",
        hrefSuffix: "narrative",
        icon: Brain,
    },
    {
        title: "Capability Intelligence",
        description:
            "Inspect maturity, complexity, infrastructure depth, technologies, and repository types.",
        hrefSuffix: "capabilities",
        icon: Layers3,
    },
    {
        title: "Architecture Intelligence",
        description:
            "Explore architecture changes, domains, evolution, radar, and engineering graph signals.",
        hrefSuffix: "architecture",
        icon: Network,
    },
    {
        title: "Engineering Timeline",
        description:
            "Review chronological engineering activity, events, and repository evolution history.",
        hrefSuffix: "timeline",
        icon: GitBranch,
    },
    {
        title: "Knowledge Graph",
        description:
            "Explore relationships between technologies, architecture domains, and repository types.",
        hrefSuffix: "knowledge-graph",
        icon: Network,
    },
    {
        title: "Intelligence Audit",
        description:
            "Review confidence, warnings, strengths, improvement areas, and signals used.",
        hrefSuffix: "audit",
        icon: ShieldCheck,
    },
    {
        title: "Recommendations",
        description:
            "View active, resolved, and dismissed engineering recommendations.",
        hrefSuffix: "recommendations",
        icon: Lightbulb,
    },
];

export function RepositoryIntelligenceCards({
    repositoryId,
}: RepositoryIntelligenceCardsProps) {
    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                    <h2 className="text-lg font-semibold">Explore Intelligence</h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Open focused intelligence workspaces instead of reading everything
                        on one long page.
                    </p>
                </div>

                <Radar className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <Link
                            key={card.hrefSuffix}
                            href={`/repositories/${repositoryId}/${card.hrefSuffix}`}
                            className="group rounded-xl border border-border bg-background p-4 transition hover:border-primary/50 hover:bg-accent"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <Icon className="h-4 w-4 text-primary" />
                                </div>

                                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                            </div>

                            <h3 className="mt-4 text-sm font-semibold">{card.title}</h3>

                            <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                {card.description}
                            </p>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
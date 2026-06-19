"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Activity,
    Brain,
    ChevronDown,
    FileSearch,
    GitBranch,
    Layers3,
    Lightbulb,
    Network,
    Radar,
    ShieldCheck,
    GitCompareArrows
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface RepositoryIntelligenceNavProps {
    repositoryId: string;
}

const primaryItems = [
    {
        label: "Overview",
        href: "",
        icon: Radar,
    },
    {
        label: "Report",
        href: "intelligence",
        icon: Brain,
    },
    {
        label: "Narrative",
        href: "narrative",
        icon: FileSearch,
    },
    {
        label: "Architecture",
        href: "architecture",
        icon: Network,
    },
];

const moreItems = [
    {
        label: "Capabilities",
        href: "capabilities",
        icon: Layers3,
    },
    {
        label: "Evolution",
        href: "architecture/evolution",
        icon: GitBranch,
    },
    {
        label: "Timeline",
        href: "timeline",
        icon: Activity,
    },
    {
        label: "Recommendations",
        href: "recommendations",
        icon: Lightbulb,
    },
    {
        label: "Audit",
        href: "audit",
        icon: ShieldCheck,
    },
    {
        label: "Knowledge Graph",
        href: "knowledge-graph",
        icon: Network,
    },
    {
        label: "Related",
        href: "related",
        icon: GitBranch,
    },
    {
        label: "Diff",
        href: "intelligence/diff",
        icon: GitCompareArrows,
    },
];

function getHref(repositoryId: string, href: string) {
    return href ? `/repositories/${repositoryId}/${href}` : `/repositories/${repositoryId}`;
}

function isItemActive(pathname: string, href: string) {
    return href === "" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function RepositoryIntelligenceNav({
    repositoryId,
}: RepositoryIntelligenceNavProps) {
    const pathname = usePathname();

    const moreIsActive = moreItems.some((item) => {
        const href = getHref(repositoryId, item.href);
        return pathname === href || pathname.startsWith(`${href}/`);
    });

    return (
        <div className="w-full max-w-full overflow-hidden rounded-xl border border-border bg-card p-3">
            <div className="flex max-w-full flex-wrap items-center gap-2">
                {primaryItems.map((item) => {
                    const Icon = item.icon;
                    const href = getHref(repositoryId, item.href);
                    const active = isItemActive(pathname, href);

                    return (
                        <Link
                            key={item.href || "overview"}
                            href={href}
                            className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground",
                                active && "bg-primary/10 text-primary"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant={moreIsActive ? "secondary" : "ghost"}
                            size="sm"
                            className={cn(
                                "gap-2",
                                moreIsActive && "bg-primary/10 text-primary hover:bg-primary/10"
                            )}
                        >
                            More
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56">
                        {moreItems.map((item) => {
                            const Icon = item.icon;
                            const href = getHref(repositoryId, item.href);
                            const active = pathname === href || pathname.startsWith(`${href}/`);

                            return (
                                <DropdownMenuItem key={item.href} asChild>
                                    <Link
                                        href={href}
                                        className={cn(
                                            "flex cursor-pointer items-center gap-2",
                                            active && "text-primary"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
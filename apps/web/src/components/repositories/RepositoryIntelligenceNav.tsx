"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Brain,
  FileSearch,
  GitBranch,
  Layers3,
  Lightbulb,
  Network,
  Radar,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface RepositoryIntelligenceNavProps {
  repositoryId: string;
}

const items = [
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
    label: "Capabilities",
    href: "capabilities",
    icon: Layers3,
  },
  {
    label: "Architecture",
    href: "architecture",
    icon: Network,
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
];

export function RepositoryIntelligenceNav({
  repositoryId,
}: RepositoryIntelligenceNavProps) {
  const pathname = usePathname();

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex gap-2 overflow-x-auto">
        {items.map((item) => {
          const Icon = item.icon;

          const href = item.href
            ? `/repositories/${repositoryId}/${item.href}`
            : `/repositories/${repositoryId}`;

          const isActive =
            item.href === ""
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={item.href || "overview"}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground",
                isActive && "bg-primary/10 text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
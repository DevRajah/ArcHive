"use client";

import { Activity, Brain, GitBranch, Network, Radar, ShieldCheck } from "lucide-react";

const sections = [
  {
    label: "Summary",
    href: "#intelligence-summary",
    icon: Brain,
  },
  {
    label: "Capabilities",
    href: "#capabilities",
    icon: ShieldCheck,
  },
  {
    label: "Radar",
    href: "#architecture-radar",
    icon: Radar,
  },
  {
    label: "Activity",
    href: "#recent-activity",
    icon: Activity,
  },
  {
    label: "Architecture",
    href: "#architecture-preview",
    icon: Network,
  },
  {
    label: "Timeline",
    href: "#timeline-preview",
    icon: GitBranch,
  },
];

export function RepositoryDetailNav() {
  return (
    <div className="sticky top-16 z-20 rounded-xl border border-border bg-background/90 p-3 backdrop-blur">
      <div className="flex gap-2 overflow-x-auto">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <a
              key={section.href}
              href={section.href}
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
              {section.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
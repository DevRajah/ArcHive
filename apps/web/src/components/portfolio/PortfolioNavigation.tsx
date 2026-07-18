"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  LayoutDashboard,
  Network,
} from "lucide-react";

import { cn } from "@/lib/utils";

const portfolioNavigationItems = [
  {
    label: "Portfolio Overview",
    href: "/portfolio",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Portfolio Timeline",
    href: "/portfolio/timeline",
    icon: Activity,
  },
  {
    label: "Engineering Trends",
    href: "/portfolio/trends",
    icon: BarChart3,
  },
  {
    label: "Knowledge Graph",
    href: "/portfolio/knowledge-graph",
    icon: Network,
  },
];

export function PortfolioNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-2">
      {portfolioNavigationItems.map(
        (item) => {
          const Icon = item.icon;

          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href ||
              pathname.startsWith(
                `${item.href}/`
              );

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />

              {item.label}
            </Link>
          );
        }
      )}
    </nav>
  );
}
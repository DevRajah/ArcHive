"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FolderGit2,
  GitBranch,
  BrainCircuit,
} from "lucide-react";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Repositories",
    href: "/repositories",
    icon: FolderGit2,
  },
  {
    label: "Timeline",
    href: "/timeline",
    icon: GitBranch,
  },
  {
    label: "Architecture",
    href: "/architecture",
    icon: BrainCircuit,
  },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 border-r border-border bg-card h-screen flex-col">
      {/* Logo Section */}
      <div className="border-b border-border px-6 py-5">
        <h1 className="text-xl font-bold tracking-tight">
          Arc<span className="text-primary">Hive</span>
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          Engineering Intelligence
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Icon className="h-4 w-4" />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
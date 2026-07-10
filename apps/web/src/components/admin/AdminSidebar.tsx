"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Database,
  Gauge,
  ListTodo,
  Server,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const adminItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: Gauge,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Repositories",
    href: "/admin/repositories",
    icon: Database,
  },
  {
    label: "Activity",
    href: "/admin/activity",
    icon: Activity,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Queue",
    href: "/admin/queue",
    icon: ListTodo,
  },
  {
    label: "System",
    href: "/admin/system",
    icon: Server,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-xl border border-border bg-card p-3">
      <div className="px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Admin Operations
        </p>
      </div>

      <nav className="space-y-1">
        {adminItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
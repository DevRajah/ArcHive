"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/constants/navigation";

export function Sidebar() {
  const pathname = usePathname();

  return (
<aside className="hidden h-screen w-64 shrink-0 flex-col border-r bg-card md:flex">      <div className="border-b border-border px-6 py-5">
        <h1 className="text-xl font-bold tracking-tight">
          Arc<span className="text-primary">Hive</span>
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Engineering Intelligence
        </p>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm font-medium">Architecture Memory</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Track how your systems evolve across time.
          </p>
        </div>
      </div>
    </aside>
  );
}
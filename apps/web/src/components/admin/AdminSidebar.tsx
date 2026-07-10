"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Database,
  Gauge,
  ListTodo,
  Menu,
  Server,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

interface AdminNavigationProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

function AdminNavigation({
  mobile = false,
  onNavigate,
}: AdminNavigationProps) {
  const pathname = usePathname();

  return (
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
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
              mobile && "py-3"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close the mobile sidebar whenever navigation completes.
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="xl:hidden">
        <Sheet
          open={isMobileMenuOpen}
          onOpenChange={setIsMobileMenuOpen}
        >
          <SheetTrigger asChild>
            <Button type="button" variant="outline">
              <Menu className="mr-2 h-4 w-4" />
              Admin Menu
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Admin Operations
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6">
              <AdminNavigation
                mobile
                onNavigate={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden rounded-xl border border-border bg-card p-3 xl:block">
        <div className="px-3 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Admin Operations
            </p>
          </div>
        </div>

        <AdminNavigation />
      </aside>
    </>
  );
}
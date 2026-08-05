"use client";

import { useEffect } from "react";

import { RequireSession } from "@/components/auth/RequireSession";

import { useLiveDashboardUpdates } from "@/hooks/useLiveDashboardUpdates";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({
  children,
}: AppShellProps) {
  useLiveDashboardUpdates();

  useEffect(() => {
    if (
      "scrollRestoration" in
      window.history
    ) {
      window.history.scrollRestoration =
        "auto";
    }
  }, []);

  return (
    <RequireSession>
      <div className="flex min-h-screen w-full max-w-full overflow-x-hidden bg-background">
        <Sidebar />

        {/*
         * min-w-0 allows this flex child to shrink beside the sidebar.
         * Without it, wide cards, charts, or tables can force the entire
         * application beyond the browser width.
         */}
        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          <Topbar />

          <main className="min-w-0 flex-1 overflow-x-hidden">
            <div className="w-full min-w-0 max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RequireSession>
  );
}
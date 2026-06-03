"use client";

import { RequireSession } from "@/components/auth/RequireSession";
import { useLiveDashboardUpdates } from "@/hooks/useLiveDashboardUpdates";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  useLiveDashboardUpdates();

  return (
    <RequireSession>
      <div className="flex min-h-screen bg-background">
        <Sidebar />

        <div className="flex flex-1 flex-col">
          <Topbar />

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </RequireSession>
  );
}
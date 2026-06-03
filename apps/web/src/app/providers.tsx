"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LiveNotificationsProvider } from "@/components/live/LiveNotificationsProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{children}
        <LiveNotificationsProvider />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
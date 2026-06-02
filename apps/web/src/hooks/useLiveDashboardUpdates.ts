"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "@/lib/socket";
import { QUERY_KEYS } from "@/constants/query-keys";

export function useLiveDashboardUpdates() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    function refreshDashboard() {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DASHBOARD_SUMMARY,
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.QUEUE_METRICS,
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.QUEUE_RECENT_JOBS,
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.REPOSITORIES,
      });
    }

    socket.on("engineering-event:processed", refreshDashboard);
    socket.on("architecture-change:detected", refreshDashboard);
    socket.on("queue-job:completed", refreshDashboard);
    socket.on("repository:updated", refreshDashboard);

    return () => {
      socket.off("engineering-event:processed", refreshDashboard);
      socket.off("architecture-change:detected", refreshDashboard);
      socket.off("queue-job:completed", refreshDashboard);
      socket.off("repository:updated", refreshDashboard);
    };
  }, [queryClient]);
}
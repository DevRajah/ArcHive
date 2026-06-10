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

        function refreshDashboard(payload?: { repositoryId?: string }) {
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

            if (payload?.repositoryId) {
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.REPOSITORY_OVERVIEW(payload.repositoryId),
                });

                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.REPOSITORY_TIMELINE(payload.repositoryId),
                });

                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.REPOSITORY_ARCHITECTURE(payload.repositoryId),
                });

                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.REPOSITORY_PURPOSE(payload.repositoryId),
                });

                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.REPOSITORY_NARRATIVE(payload.repositoryId),
                });

                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.REPOSITORY_CAPABILITIES(payload.repositoryId),
                });

                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.REPOSITORY_ARCHITECTURE_RADAR(payload.repositoryId),
                });

                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.ARCHITECTURE_EVOLUTION(payload.repositoryId),
                });

                queryClient.invalidateQueries({
                    queryKey:
                        QUERY_KEYS.REPOSITORY_INTELLIGENCE_SUMMARY(
                            payload.repositoryId
                        ),
                });

                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.REPOSITORY_INTELLIGENCE_REPORT(payload.repositoryId),
                });

                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.REPOSITORY_INTELLIGENCE_TIMELINE(payload.repositoryId),
                });

                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.REPOSITORY_RELATED(payload.repositoryId),
                });

                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.REPOSITORY_KNOWLEDGE_GRAPH(payload.repositoryId),
                });

                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.REPOSITORY_ENGINEERING_REASONING(payload.repositoryId),
                });

                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.REPOSITORY_RECOMMENDATIONS(payload.repositoryId),
                });

                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.REPOSITORY_INTELLIGENCE_AUDIT(payload.repositoryId),
                });

                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.REPOSITORY_SEMANTIC_PROFILE(payload.repositoryId),
                });

                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.INTELLIGENCE_OVERVIEW,
                });

                queryClient.invalidateQueries({
                    queryKey: ["intelligence-search"],
                });


            }
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
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { organizationService } from "@/services/organization.service";
import { QUERY_KEYS } from "@/constants/query-keys";

import type {
  OrganizationIntelligenceQuery,
  ReprocessAllRepositoriesResponse,
} from "@/types/organization.types";

interface UseOrganizationIntelligenceOptions {
  userId: string;
  query?: OrganizationIntelligenceQuery;
  enabled?: boolean;
}

/**
 * Fetch the complete Organization Intelligence dashboard.
 *
 * The backend returns the entire dashboard in one request:
 * - overview
 * - rankings
 * - technology
 * - recommendations
 * - risks
 * - activity
 * - trends
 */
export function useOrganizationDashboard({
  userId,
  query,
  enabled = true,
}: UseOrganizationIntelligenceOptions) {
  return useQuery({
    queryKey: QUERY_KEYS.ORGANIZATION_DASHBOARD(userId, query),

    queryFn: () =>
      organizationService.getOrganizationDashboard(userId),

    enabled: enabled && !!userId,

    staleTime: 1000 * 60 * 5,

    refetchOnWindowFocus: false,
  });
}

/**
 * Reprocess every tracked repository.
 *
 * This regenerates engineering intelligence for the
 * user's entire portfolio.
 *
 * After completion we invalidate the organization dashboard
 * so every section refreshes automatically.
 */
export function useReprocessRepositories(
  userId: string,
  query?: OrganizationIntelligenceQuery
) {
  const queryClient = useQueryClient();

  return useMutation<
    ReprocessAllRepositoriesResponse,
    Error,
    void
  >({
    mutationFn: () =>
      organizationService.reprocessRepositories(),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ORGANIZATION_DASHBOARD(
          userId,
          query
        ),
      });
    },
  });
}
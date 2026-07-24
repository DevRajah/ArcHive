import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/query-keys";
import { timelineService } from "@/services/timeline.service";
import { RepositoryTimelineQuery } from "@/types/timeline.types";

/**
 * Loads one page of repository timeline events.
 *
 * Every filter is included in the query key.
 * This means React Query stores separate cached results for:
 *
 * page 1
 * page 2
 * HIGH severity
 * ARCHITECTURE_CHANGE events
 * search results
 * date ranges
 */
export function useRepositoryTimeline(
  repositoryId: string,
  query: RepositoryTimelineQuery = {},
) {
  return useQuery({
    queryKey: [
      ...QUERY_KEYS.REPOSITORY_TIMELINE(repositoryId),
      query,
    ],

    queryFn: () =>
      timelineService.getRepositoryTimeline(repositoryId, query),

    enabled: Boolean(repositoryId),

    /**
     * Keeps the previous page visible while the next page loads.
     *
     * This prevents the entire timeline from flashing empty when the
     * user changes page or applies a filter.
     */
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Loads only timeline summary information.
 *
 * This hook is available for dashboards and other pages.
 * The main Timeline page can use the summary included in its main response.
 */
export function useRepositoryTimelineSummary(repositoryId: string) {
  return useQuery({
    queryKey: [
      ...QUERY_KEYS.REPOSITORY_TIMELINE(repositoryId),
      "summary",
    ],

    queryFn: () =>
      timelineService.getRepositoryTimelineSummary(repositoryId),

    enabled: Boolean(repositoryId),
  });
}

/**
 * Rebuilds the timeline and then refreshes all cached timeline queries.
 */
export function useRefreshRepositoryTimeline(repositoryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      timelineService.refreshRepositoryTimeline(repositoryId),

    onSuccess: async () => {
      /**
       * This invalidates:
       * the main timeline
       * filtered timeline results
       * paginated results
       * summary queries
       */
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.REPOSITORY_TIMELINE(repositoryId),
      });
    },
  });
}
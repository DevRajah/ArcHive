import { api } from "@/lib/api";
import { ApiResponse } from "@/types/api.types";
import {
  RefreshTimelineResponse,
  RepositoryTimelineQuery,
  RepositoryTimelineResponse,
  TimelineSummary,
} from "@/types/timeline.types";

/**
 * Removes query values that should not be sent to the backend.
 *
 * For example:
 * search=""
 * from=""
 * type=undefined
 *
 * Sending only real values keeps the URL clean and prevents the backend
 * from receiving empty filters.
 */
function cleanTimelineQuery(query: RepositoryTimelineQuery) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false;
      }

      if (typeof value === "string" && value.trim() === "") {
        return false;
      }

      return true;
    }),
  );
}

export const timelineService = {
  /**
   * Loads the complete repository timeline.
   *
   * This includes:
   * repository details
   * summary
   * timeline events
   * pagination
   * generatedAt
   */
  async getRepositoryTimeline(
    repositoryId: string,
    query: RepositoryTimelineQuery = {},
  ) {
    const response = await api.get<
      ApiResponse<RepositoryTimelineResponse>
    >(`/repositories/${repositoryId}/timeline`, {
      params: cleanTimelineQuery(query),
    });

    return response.data.data;
  },

  /**
   * Loads only the summary information.
   *
   * The main Timeline endpoint already returns a summary, so this method
   * is mainly useful on other pages that need the cards without loading
   * the complete timeline.
   */
  async getRepositoryTimelineSummary(repositoryId: string) {
    const response = await api.get<ApiResponse<TimelineSummary>>(
      `/repositories/${repositoryId}/timeline/summary`,
    );

    return response.data.data;
  },

  /**
   * Rebuilds the timeline from evidence ArcHive already stores.
   *
   * Important:
   * This does not generate new intelligence.
   * It only reconstructs the timeline from existing records.
   */
  async refreshRepositoryTimeline(repositoryId: string) {
    const response = await api.post<
      ApiResponse<RefreshTimelineResponse>
    >(`/repositories/${repositoryId}/timeline/refresh`);

    return response.data.data;
  },
};
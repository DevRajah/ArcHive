import { api } from "@/lib/api";
import { ApiResponse } from "@/types/api.types";
import { TimelineEntry } from "@/types/timeline.types";

export const timelineService = {
  async getRepositoryTimeline(repositoryId: string) {
    const response = await api.get<ApiResponse<TimelineEntry[]>>(
      `/repositories/${repositoryId}/timeline`
    );

    return response.data.data;
  },
};
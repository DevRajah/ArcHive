import { api } from "@/lib/api";

import type { ApiResponse } from "@/types/api.types";
import type { PortfolioKnowledgeGraphResponse } from "@/types/portfolio-knowledge-graph.types";

export const knowledgeGraphService = {
  async getPortfolioKnowledgeGraph(
    userId: string
  ): Promise<PortfolioKnowledgeGraphResponse> {
    const response = await api.get<
      ApiResponse<PortfolioKnowledgeGraphResponse>
    >(`/users/${userId}/knowledge-graph`);

    return response.data.data;
  },
};
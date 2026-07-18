import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/query-keys";
import { knowledgeGraphService } from "@/services/knowledge-graph.service";

export function usePortfolioKnowledgeGraph(
  userId?: string
) {
  return useQuery({
    queryKey:
      QUERY_KEYS.PORTFOLIO_KNOWLEDGE_GRAPH(
        userId || ""
      ),

    queryFn: () =>
      knowledgeGraphService.getPortfolioKnowledgeGraph(
        userId as string
      ),

    enabled: Boolean(userId),

    retry: false,
  });
}
import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import { portfolioService } from "@/services/portfolio.service";
import type { PortfolioTimelineParams } from "@/types/portfolio.types";

export const PORTFOLIO_TIMELINE_QUERY_KEY = (
  userId: string,
  params: PortfolioTimelineParams
) => ["portfolio-timeline", userId, params] as const;

export function usePortfolioTimeline(
  userId?: string,
  params: PortfolioTimelineParams = {}
) {
  return useQuery({
    queryKey: PORTFOLIO_TIMELINE_QUERY_KEY(
      userId || "",
      params
    ),

    queryFn: () =>
      portfolioService.getPortfolioTimeline(
        userId as string,
        params
      ),

    enabled: Boolean(userId),

    placeholderData: keepPreviousData,

    retry: 1,
  });
}
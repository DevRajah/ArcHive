import { useQuery } from "@tanstack/react-query";

import { portfolioService } from "@/services/portfolio.service";
import type { PortfolioTrendPeriod } from "@/types/portfolio.types";

export const PORTFOLIO_TRENDS_QUERY_KEY = (
  userId: string,
  period: PortfolioTrendPeriod
) => ["portfolio-trends", userId, period] as const;

export function usePortfolioTrends(
  userId?: string,
  period: PortfolioTrendPeriod = "30d"
) {
  return useQuery({
    queryKey: PORTFOLIO_TRENDS_QUERY_KEY(
      userId || "",
      period
    ),

    queryFn: () =>
      portfolioService.getPortfolioTrends(
        userId as string,
        period
      ),

    enabled: Boolean(userId),

    retry: 1,
  });
}
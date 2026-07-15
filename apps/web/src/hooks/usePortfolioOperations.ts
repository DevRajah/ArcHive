import { useQuery } from "@tanstack/react-query";

import { portfolioService } from "@/services/portfolio.service";

export const PORTFOLIO_OPERATIONS_QUERY_KEY = (
  userId: string
) => ["user-portfolio", userId] as const;

export function usePortfolioOperations(userId?: string) {
  return useQuery({
    queryKey: PORTFOLIO_OPERATIONS_QUERY_KEY(userId || ""),
    queryFn: () => portfolioService.getUserPortfolio(userId as string),

    enabled: Boolean(userId),

    /*
     * A temporary network failure should not affect the existing semantic
     * portfolio intelligence. The workspace handles this query independently.
     */
    retry: 1,
  });
}
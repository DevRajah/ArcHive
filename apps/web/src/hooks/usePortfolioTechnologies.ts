import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/query-keys";
import { portfolioTechnologyService } from "@/services/portfolio-technology.service";

export function useTechnologyOverview(
  userId?: string
) {
  return useQuery({
    queryKey:
      QUERY_KEYS.PORTFOLIO_TECHNOLOGIES(
        userId || ""
      ),

    queryFn: () =>
      portfolioTechnologyService.getTechnologyOverview(
        userId as string
      ),

    enabled: Boolean(userId),

    retry: false,
  });
}

export function useTechnologyDetail(
  userId?: string,
  technology?: string
) {
  return useQuery({
    queryKey:
      QUERY_KEYS.PORTFOLIO_TECHNOLOGY_DETAIL(
        userId || "",
        technology || ""
      ),

    queryFn: () =>
      portfolioTechnologyService.getTechnologyDetail(
        userId as string,
        technology as string
      ),

    enabled:
      Boolean(userId) &&
      Boolean(technology),

    retry: false,
  });
}
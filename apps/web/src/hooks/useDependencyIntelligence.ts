import { useQuery } from "@tanstack/react-query";

import { dependencyIntelligenceService } from "@/services/dependency-intelligence.service";

export function useDependencyOverview(userId?: string) {
  return useQuery({
    queryKey: ["dependency-overview", userId || ""],

    queryFn: () =>
      dependencyIntelligenceService.getDependencyOverview(
        userId as string
      ),

    enabled: Boolean(userId),
    retry: false,
  });
}

export function useTechnologyDependencyDetail(
  userId?: string,
  technology?: string
) {
  return useQuery({
    queryKey: [
      "technology-dependency-detail",
      userId || "",
      technology || "",
    ],

    queryFn: () =>
      dependencyIntelligenceService.getTechnologyDependencyDetail(
        userId as string,
        technology as string
      ),

    enabled: Boolean(userId) && Boolean(technology),
    retry: false,
  });
}

export function useTechnologyImpact(
  userId?: string,
  technology?: string
) {
  return useQuery({
    queryKey: [
      "technology-impact-report",
      userId || "",
      technology || "",
    ],

    queryFn: () =>
      dependencyIntelligenceService.getTechnologyImpact(
        userId as string,
        technology as string
      ),

    enabled: Boolean(userId) && Boolean(technology),
    retry: false,
  });
}
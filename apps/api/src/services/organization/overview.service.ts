import { prisma } from "@archive/database";
import {
  OrganizationOverview,
  OrganizationQueryOptions,
  OrganizationRiskLevel,
} from "../../types/organization.types";


import {
  getRepositoriesForScope,
} from "../intelligence/repository-scope.service";

import {
  RepositoryScopeType,
} from "../../types/repository-scope.types";

/**
 * Returns a high-level engineering summary for all repositories
 * tracked by a single ArcHive user.
 */
export const getOrganizationOverview = async (
  options: OrganizationQueryOptions,
): Promise<OrganizationOverview> => {
  const repositories = await prisma.repository.findMany({
    where: {
      userId: options.userId,
      isTracked: true,
    },

    include: {
      intelligenceSnapshots: {
        orderBy: {
          createdAt: "desc",
        },
      },

      architectureAdvisorSnapshots: {
        orderBy: {
          generatedAt: "desc",
        },
      },
    },
  });

  const totalRepositories = repositories.length;

  const analyzedRepositories = repositories.filter(
    (repository) => repository.intelligenceSnapshots.length > 0,
  ).length;

  const unanalyzedRepositories =
    totalRepositories - analyzedRepositories;

  let architectureTotal = 0;
  let engineeringTotal = 0;
  let productionTotal = 0;
  let maturityTotal = 0;
  let confidenceTotal = 0;
  let riskTotal = 0;

  let architectureCount = 0;
  let engineeringCount = 0;
  let productionCount = 0;
  let maturityCount = 0;
  let confidenceCount = 0;
  let riskCount = 0;

  let healthyRepositories = 0;
  let warningRepositories = 0;
  let criticalRepositories = 0;

  for (const repository of repositories) {
    const latestSnapshot = repository.intelligenceSnapshots[0];
    const latestAdvisor =
      repository.architectureAdvisorSnapshots[0];

    if (latestSnapshot?.architectureScore != null) {
      architectureTotal += latestSnapshot.architectureScore;
      architectureCount++;
    }

    if (latestSnapshot?.engineeringQualityScore != null) {
      engineeringTotal += latestSnapshot.engineeringQualityScore;
      engineeringCount++;
    }

    if (latestSnapshot?.productionReadinessScore != null) {
      productionTotal += latestSnapshot.productionReadinessScore;
      productionCount++;
    }

    if (latestSnapshot?.maturityScore != null) {
      maturityTotal += latestSnapshot.maturityScore;
      maturityCount++;
    }

    if (latestSnapshot?.confidenceScore != null) {
      confidenceTotal += latestSnapshot.confidenceScore;
      confidenceCount++;
    }

    if (latestAdvisor) {
      riskTotal += latestAdvisor.overallRiskScore;
      riskCount++;

      /**
       * Classify repositories by their overall risk.
       *
       * Lower risk means healthier repositories.
       */
      if (latestAdvisor.overallRiskScore < 30) {
        healthyRepositories++;
      } else if (latestAdvisor.overallRiskScore < 70) {
        warningRepositories++;
      } else {
        criticalRepositories++;
      }
    }
  }

  const average = (
    total: number,
    count: number,
  ): number | null => {
    if (count === 0) {
      return null;
    }

    return Number((total / count).toFixed(1));
  };

  const averageRiskScore = average(riskTotal, riskCount);

  let overallRiskLevel: OrganizationRiskLevel = "LOW";

  if (averageRiskScore !== null) {
    if (averageRiskScore >= 80) {
      overallRiskLevel = "CRITICAL";
    } else if (averageRiskScore >= 60) {
      overallRiskLevel = "HIGH";
    } else if (averageRiskScore >= 30) {
      overallRiskLevel = "MEDIUM";
    }
  }

  return {
    totalRepositories,

    analyzedRepositories,

    unanalyzedRepositories,

    healthyRepositories,

    warningRepositories,

    criticalRepositories,

    decliningRepositories: 0,

    improvingRepositories: 0,

    stableRepositories: 0,

    averageArchitectureScore: average(
      architectureTotal,
      architectureCount,
    ),

    averageEngineeringQualityScore: average(
      engineeringTotal,
      engineeringCount,
    ),

    averageProductionReadinessScore: average(
      productionTotal,
      productionCount,
    ),

    averageMaturityScore: average(
      maturityTotal,
      maturityCount,
    ),

    averageRiskScore,

    overallRiskLevel,

    analysisCoveragePercentage:
      totalRepositories === 0
        ? 0
        : Number(
            (
              (analyzedRepositories / totalRepositories) *
              100
            ).toFixed(1),
          ),
  };
};
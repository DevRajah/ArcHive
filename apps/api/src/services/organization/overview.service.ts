import { prisma } from "@archive/database";

import {
  OrganizationOverview,
  OrganizationQueryOptions,
  OrganizationRiskLevel,
} from "../../types/organization.types";

import {
  hasSufficientAdvisorRiskEvidence,
} from "./organization.utils";


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

  const totalRepositories =
    repositories.length;

  /**
   * This remains repository-intelligence analysis coverage.
   *
   * It is deliberately separate from Architecture Advisor
   * risk-assessment coverage.
   */
  const analyzedRepositories =
    repositories.filter(
      (repository) =>
        repository.intelligenceSnapshots.length > 0,
    ).length;

  const unanalyzedRepositories =
    totalRepositories -
    analyzedRepositories;

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

  /**
   * A repository can already have an Advisor snapshot while ArcHive
   * still lacks enough canonical evidence to make a reliable risk
   * judgement.
   *
   * Future me:
   * overallRiskScore = 0 with insufficient evidence does NOT mean
   * "healthy" or "LOW risk".
   */
  let unassessedRiskRepositories = 0;

  for (const repository of repositories) {
    const latestSnapshot =
      repository.intelligenceSnapshots[0];

    const latestAdvisor =
      repository.architectureAdvisorSnapshots[0];

    /**
     * Repository intelligence assessment scores.
     *
     * These remain independent of Advisor risk semantics.
     */
    if (
      latestSnapshot?.architectureScore != null
    ) {
      architectureTotal +=
        latestSnapshot.architectureScore;

      architectureCount++;
    }

    if (
      latestSnapshot
        ?.engineeringQualityScore != null
    ) {
      engineeringTotal +=
        latestSnapshot.engineeringQualityScore;

      engineeringCount++;
    }

    if (
      latestSnapshot
        ?.productionReadinessScore != null
    ) {
      productionTotal +=
        latestSnapshot.productionReadinessScore;

      productionCount++;
    }

    if (
      latestSnapshot?.maturityScore != null
    ) {
      maturityTotal +=
        latestSnapshot.maturityScore;

      maturityCount++;
    }

    if (
      latestSnapshot?.confidenceScore != null
    ) {
      confidenceTotal +=
        latestSnapshot.confidenceScore;

      confidenceCount++;
    }

    /**
     * Risk assessment coverage.
     *
     * A repository is unassessed when:
     *
     * - no Architecture Advisor snapshot exists yet, or
     * - an Advisor snapshot exists but does not contain enough evidence
     *   for a trustworthy risk judgement.
     *
     * Only evidence-sufficient assessments may contribute to risk averages
     * and health/risk buckets.
     */
    if (!latestAdvisor) {
      unassessedRiskRepositories++;
    } else {
      const evidenceIsSufficient =
        hasSufficientAdvisorRiskEvidence(
          latestAdvisor.evidenceSummary,
        );

      if (!evidenceIsSufficient) {
        unassessedRiskRepositories++;
      } else {
        riskTotal +=
          latestAdvisor.overallRiskScore;

        riskCount++;

        if (
          latestAdvisor.overallRiskScore < 30
        ) {
          healthyRepositories++;
        } else if (
          latestAdvisor.overallRiskScore < 70
        ) {
          warningRepositories++;
        } else {
          criticalRepositories++;
        }
      }
    }
  }

  /**
   * Safely average only values that actually exist.
   */
  const average = (
    total: number,
    count: number,
  ): number | null => {
    if (count === 0) {
      return null;
    }

    return Number(
      (total / count).toFixed(1),
    );
  };

  /**
   * Only evidence-sufficient Advisor assessments contributed
   * to riskTotal/riskCount above.
   */
  const averageRiskScore =
    average(
      riskTotal,
      riskCount,
    );
  /**
 * Percentage of tracked repositories that currently have an
 * evidence-sufficient Architecture Advisor risk assessment.
 *
 * This is intentionally separate from analysisCoveragePercentage.
 *
 * analysisCoveragePercentage:
 *   "Has ArcHive generated repository intelligence?"
 *
 * riskAssessmentCoveragePercentage:
 *   "Can ArcHive currently make a trustworthy risk judgement?"
 */
  const riskAssessmentCoveragePercentage =
    totalRepositories === 0
      ? 0
      : Number(
        (
          (riskCount / totalRepositories) *
          100
        ).toFixed(1),
      );

  /**
   * null means:
   *
   * "There is currently no organization-level risk classification
   * because no evidence-sufficient repository risk assessments exist."
   *
   * This is intentionally different from LOW.
   */
  let overallRiskLevel:
    OrganizationRiskLevel | null =
    null;

  if (averageRiskScore !== null) {
    if (averageRiskScore >= 80) {
      overallRiskLevel =
        "CRITICAL";
    } else if (
      averageRiskScore >= 60
    ) {
      overallRiskLevel =
        "HIGH";
    } else if (
      averageRiskScore >= 30
    ) {
      overallRiskLevel =
        "MEDIUM";
    } else {
      overallRiskLevel =
        "LOW";
    }
  }

  return {
    totalRepositories,

    analyzedRepositories,

    unanalyzedRepositories,

    healthyRepositories,

    warningRepositories,

    criticalRepositories,


    /**
     * Advisor snapshots that exist but cannot yet support
     * a reliable risk judgement.
     */
    unassessedRiskRepositories,

    decliningRepositories: 0,

    improvingRepositories: 0,

    stableRepositories: 0,

    averageArchitectureScore:
      average(
        architectureTotal,
        architectureCount,
      ),

    averageEngineeringQualityScore:
      average(
        engineeringTotal,
        engineeringCount,
      ),

    averageProductionReadinessScore:
      average(
        productionTotal,
        productionCount,
      ),

    averageMaturityScore:
      average(
        maturityTotal,
        maturityCount,
      ),

    averageRiskScore,

    overallRiskLevel,

    /**
     * This remains repository-intelligence coverage,
     * not Advisor risk-assessment coverage.
     */
    analysisCoveragePercentage:
      totalRepositories === 0
        ? 0
        : Number(
          (
            (
              analyzedRepositories /
              totalRepositories
            ) *
            100
          ).toFixed(1),
        ),
    riskAssessmentCoveragePercentage,
  };
};
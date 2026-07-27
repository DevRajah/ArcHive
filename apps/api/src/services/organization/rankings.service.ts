import {
  OrganizationQueryOptions,
  OrganizationRepositoryScore,
} from "../../types/organization.types";

import {
  latestAdvisor,
  latestSnapshot,
  loadOrganizationRepositories,
} from "./organization.utils";

/**
 * Builds a scorecard for every tracked repository.
 *
 * The frontend uses this endpoint to display the strongest
 * and weakest repositories across an organisation.
 */
export const getRepositoryRankings = async (
  options: OrganizationQueryOptions,
): Promise<OrganizationRepositoryScore[]> => {
  const repositories = await loadOrganizationRepositories(
    options.userId,
  );

  const rankings: OrganizationRepositoryScore[] = [];

  for (const repository of repositories) {
    const snapshot = latestSnapshot(repository);
    const advisor = latestAdvisor(repository);

    const architectureScore =
      snapshot?.architectureScore ?? 0;

    const engineeringScore =
      snapshot?.engineeringQualityScore ?? 0;

    const productionScore =
      snapshot?.productionReadinessScore ?? 0;

    const maturityScore =
      snapshot?.maturityScore ?? 0;

    const confidenceScore =
      snapshot?.confidenceScore ?? 0;

    const riskScore =
      advisor?.overallRiskScore ?? 100;

    /**
     * Overall score is simply the average of the
     * positive engineering metrics.
     *
     * Risk is kept separate because a repository
     * may have good engineering quality while still
     * carrying architectural risk.
     */
    const overallScore = Number(
      (
        (
          architectureScore +
          engineeringScore +
          productionScore +
          maturityScore +
          confidenceScore
        ) / 5
      ).toFixed(1),
    );

    rankings.push({
      repositoryId: repository.id,

      repositoryName: repository.name,

      repositoryFullName: repository.fullName,

      language: repository.language,

      architectureScore,

      engineeringQualityScore: engineeringScore,

      productionReadinessScore: productionScore,

      maturityScore,

      confidenceScore,

      riskScore,

      overallScore,

      recommendationCount:
        repository.engineeringRecommendations.filter(
          (recommendation) =>
            recommendation.status === "ACTIVE",
        ).length,

      architectureChangeCount:
        repository.architectureChanges.length,

      engineeringEventCount:
        repository.events.length,
    });
  }

  /**
   * Highest scoring repositories appear first.
   */
  rankings.sort(
    (left, right) =>
      right.overallScore - left.overallScore,
  );

  return rankings;
};
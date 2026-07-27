import {
  OrganizationQueryOptions,
  OrganizationTrendPoint,
  OrganizationTrends,
} from "../../types/organization.types";

import {
  average,
  collectScores,
  latestAdvisor,
  latestSnapshot,
  loadOrganizationRepositories,
} from "./organization.utils";

/**
 * Produces the latest organization trend snapshot.
 *
 * Initially this returns a single point representing the
 * latest state of the engineering organisation.
 *
 * Later we'll evolve this into historical trend analysis.
 */
export const getOrganizationTrends = async (
  options: OrganizationQueryOptions,
): Promise<OrganizationTrends> => {
  const repositories =
    await loadOrganizationRepositories(
      options.userId,
    );

  const architecture = collectScores(
    repositories.map(
      (repository) =>
        latestSnapshot(repository)
          ?.architectureScore,
    ),
  );

  const engineering = collectScores(
    repositories.map(
      (repository) =>
        latestSnapshot(repository)
          ?.engineeringQualityScore,
    ),
  );

  const production = collectScores(
    repositories.map(
      (repository) =>
        latestSnapshot(repository)
          ?.productionReadinessScore,
    ),
  );

  const maturity = collectScores(
    repositories.map(
      (repository) =>
        latestSnapshot(repository)
          ?.maturityScore,
    ),
  );

  const risks = collectScores(
    repositories.map(
      (repository) =>
        latestAdvisor(repository)
          ?.overallRiskScore,
    ),
  );

  const now = new Date();

  const point: OrganizationTrendPoint = {
    period: "Current",

    periodStart: now,

    periodEnd: now,

    repositoryCount: repositories.length,

    averageArchitectureScore:
      average(architecture),

    averageEngineeringQualityScore:
      average(engineering),

    averageProductionReadinessScore:
      average(production),

    averageMaturityScore:
      average(maturity),

    averageRiskScore:
      average(risks),
  };

  return {
    interval: "MONTH",

    from: now,

    to: now,

    direction: "STABLE",

    architectureScoreChange: null,

    engineeringQualityScoreChange:
      null,

    productionReadinessScoreChange:
      null,

    maturityScoreChange: null,

    riskScoreChange: null,

    points: [point],
  };
};
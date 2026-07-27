import {
  OrganizationQueryOptions,
  OrganizationRepositoryRisk,
  OrganizationRiskSummary,
} from "../../types/organization.types";

import {
  getRiskLevel,
  latestAdvisor,
  loadOrganizationRepositories,
} from "./organization.utils";

/**
 * Produces a ranked list of repositories based on
 * architectural risk.
 *
 * Engineering managers can immediately identify
 * which repositories need attention first.
 */
export const getOrganizationRisks = async (
  options: OrganizationQueryOptions,
): Promise<OrganizationRiskSummary> => {
  const repositories =
    await loadOrganizationRepositories(
      options.userId,
    );

  const risks: OrganizationRepositoryRisk[] =
    [];

  let critical = 0;
  let high = 0;
  let medium = 0;
  let low = 0;

  for (const repository of repositories) {
    const advisor = latestAdvisor(repository);

    if (!advisor) {
      continue;
    }

    const level = getRiskLevel(
      advisor.overallRiskScore,
    );

    switch (level) {
      case "CRITICAL":
        critical++;
        break;

      case "HIGH":
        high++;
        break;

      case "MEDIUM":
        medium++;
        break;

      default:
        low++;
    }

    risks.push({
      repositoryId: repository.id,

      repositoryName: repository.name,

      repositoryFullName:
        repository.fullName,

      overallRiskScore:
        advisor.overallRiskScore,

      overallAssessment:
        advisor.overallAssessment,

      maturityLabel:
        advisor.maturityLabel,

      riskLevel: level,

      generatedAt:
        advisor.generatedAt,
    });
  }

  risks.sort(
    (left, right) =>
      right.overallRiskScore -
      left.overallRiskScore,
  );

  return {
    totalRepositories: risks.length,

    criticalRepositories: critical,

    highRiskRepositories: high,

    mediumRiskRepositories: medium,

    lowRiskRepositories: low,

    repositories: risks,
  };
};
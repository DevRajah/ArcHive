import {
  OrganizationQueryOptions,
  OrganizationRecommendation,
} from "../../types/organization.types";

import {
  latestAdvisor,
  loadOrganizationRepositories,
} from "./organization.utils";

/**
 * Returns every ACTIVE engineering recommendation
 * across all tracked repositories.
 *
 * This becomes the organisation-wide engineering
 * backlog shown on the dashboard.
 */
export const getOrganizationRecommendations =
  async (
    options: OrganizationQueryOptions,
  ): Promise<OrganizationRecommendation[]> => {
    const repositories =
      await loadOrganizationRepositories(
        options.userId,
      );

    const recommendations: OrganizationRecommendation[] =
      [];

    for (const repository of repositories) {
      /**
       * Recommendations detected directly by ArcHive.
       */
      for (const recommendation of repository.engineeringRecommendations) {
        if (recommendation.status !== "ACTIVE") {
          continue;
        }

        recommendations.push({
          repositoryId: repository.id,

          repositoryName: repository.name,

          recommendationKey:
            recommendation.recommendationKey,

          title: recommendation.title,

          description:
            recommendation.description,

          evidence:
            recommendation.evidence ?? null,

          createdAt: recommendation.createdAt,
        });
      }

      /**
       * AI Advisor priority actions are also surfaced
       * as engineering recommendations.
       */
      const advisor = latestAdvisor(repository);

      if (!advisor) {
        continue;
      }

      if (
        Array.isArray(advisor.priorityActions)
      ) {
        for (const action of advisor.priorityActions) {
          if (typeof action !== "string") {
            continue;
          }

          recommendations.push({
            repositoryId: repository.id,

            repositoryName: repository.name,

            recommendationKey: `${repository.id}-${action}`,

            title: action,

            description: action,

            evidence: "AI Architecture Advisor",

            createdAt: advisor.generatedAt,
          });
        }
      }
    }

    recommendations.sort(
      (left, right) =>
        right.createdAt.getTime() -
        left.createdAt.getTime(),
    );

    return recommendations;
  };
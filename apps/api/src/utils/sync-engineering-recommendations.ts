import { Prisma } from "@prisma/client";
import { prisma } from "@archive/database";
import {
  reconcileRecommendationState,
} from "./recommendation-reconciliation";

type RecommendationInput = {
  key: string;
  title: string;
  description: string;
  resolvesWhenDomainAppears?: string;
};

type SyncEngineeringRecommendationsInput = {
  repositoryId: string;
  recommendations: RecommendationInput[];

  /**
   * Future me:
   * Canonical intelligence generation already runs inside a Prisma
   * transaction. Passing that transaction through keeps recommendation
   * lifecycle changes and the intelligence snapshot in the same atomic
   * refresh.
   */
  tx?: Prisma.TransactionClient;
};

export const syncEngineeringRecommendations = async ({
  repositoryId,
  recommendations,
  tx,
}: SyncEngineeringRecommendationsInput) => {
  const db = tx ?? prisma;

  /**
   * These are the recommendations the latest intelligence generation
   * believes are currently applicable to this repository.
   *
   * We use the keys for reconciliation because recommendationKey is the
   * stable identity of a recommendation across intelligence refreshes.
   */
  const currentRecommendationKeys = new Set(
    recommendations.map((recommendation) => recommendation.key)
  );

  /**
   * Read the current persisted state before applying the new generation.
   *
   * This lets us detect recommendations that used to be ACTIVE but are no
   * longer produced by the canonical intelligence engine.
   */
  const existingRecommendations =
    await db.engineeringRecommendation.findMany({
      where: {
        repositoryId,
      },
    });

  /**
   * A recommendation that was ACTIVE previously but is absent from the
   * current generation is no longer supported by current intelligence.
   *
   * Resolve it instead of deleting it. Keeping the row preserves the
   * lifecycle history while ensuring current Team Intelligence no longer
   * treats stale advice as active.
   */
const {
  staleActiveIds,
} = reconcileRecommendationState({
  existingRecommendations,

  currentRecommendationKeys,
});

  if (staleActiveIds.length > 0) {
    await db.engineeringRecommendation.updateMany({
      where: {
        id: {
          in: staleActiveIds,
        },
      },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
      },
    });
  }

  for (const recommendation of recommendations) {
    const existing = existingRecommendations.find(
      (item) =>
        item.recommendationKey === recommendation.key
    );

    /**
     * Preserve explicit lifecycle decisions.
     *
     * A dismissed or resolved recommendation should not silently become
     * ACTIVE again just because another intelligence refresh produced the
     * same recommendation key.
     */
    if (
      existing?.status === "DISMISSED" ||
      existing?.status === "RESOLVED"
    ) {
      continue;
    }

    await db.engineeringRecommendation.upsert({
      where: {
        repositoryId_recommendationKey: {
          repositoryId,
          recommendationKey: recommendation.key,
        },
      },

      update: {
        title: recommendation.title,
        description: recommendation.description,
      },

      create: {
        repositoryId,
        recommendationKey: recommendation.key,
        title: recommendation.title,
        description: recommendation.description,
        status: "ACTIVE",
      },
    });
  }

  /**
   * Return the complete lifecycle state.
   *
   * The immutable RepositoryIntelligenceSnapshot stores this result so a
   * historical snapshot continues to describe the recommendation state that
   * existed when that intelligence generation completed.
   */
  return db.engineeringRecommendation.findMany({
    where: {
      repositoryId,
    },

    orderBy: [
      {
        status: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
};
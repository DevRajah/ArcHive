import { Prisma } from "@prisma/client";
import { prisma } from "@archive/database";

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
   * transaction. Allow the caller to pass that transaction through so
   * recommendation state and the immutable intelligence snapshot cannot
   * accidentally be written as two separate database operations.
   *
   * Existing callers do not need to pass this. They will continue using
   * the normal Prisma client until those read paths are cleaned up.
   */
  tx?: Prisma.TransactionClient;
};

export const syncEngineeringRecommendations = async ({
  repositoryId,
  recommendations,
  tx,
}: SyncEngineeringRecommendationsInput) => {
  /**
   * Use the caller's transaction when one exists.
   *
   * This is important during canonical intelligence generation because
   * recommendation lifecycle state and the snapshot should describe the
   * same completed intelligence refresh.
   */
  const db = tx ?? prisma;

  for (const recommendation of recommendations) {
    const existing =
      await db.engineeringRecommendation.findUnique({
        where: {
          repositoryId_recommendationKey: {
            repositoryId,
            recommendationKey: recommendation.key,
          },
        },
      });

    /**
     * A user's explicit lifecycle decision must not be silently undone by
     * another intelligence refresh.
     *
     * DISMISSED recommendations stay dismissed.
     * RESOLVED recommendations stay resolved.
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
   * Return the complete persisted lifecycle state.
   *
   * The canonical intelligence generator will use this result to capture
   * an immutable recommendation state inside the corresponding snapshot.
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
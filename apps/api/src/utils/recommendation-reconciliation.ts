export type ExistingRecommendationState = {
  id: string;
  recommendationKey: string;
  status: string;
};

export type RecommendationReconciliation = {
  staleActiveIds: string[];
};

/**
 * Determines which previously-active recommendations are no longer supported
 * by the current canonical intelligence generation.
 *
 * Future me:
 * Keep this function pure. Persistence belongs in
 * sync-engineering-recommendations.ts.
 */
export const reconcileRecommendationState = ({
  existingRecommendations,
  currentRecommendationKeys,
}: {
  existingRecommendations:
    ExistingRecommendationState[];

  currentRecommendationKeys:
    Iterable<string>;
}): RecommendationReconciliation => {
  const currentKeys =
    new Set(
      currentRecommendationKeys,
    );

  const staleActiveIds =
    existingRecommendations
      .filter(
        (recommendation) =>
          recommendation.status ===
            "ACTIVE" &&
          !currentKeys.has(
            recommendation.recommendationKey,
          ),
      )
      .map(
        (recommendation) =>
          recommendation.id,
      );

  return {
    staleActiveIds,
  };
};
import assert from "node:assert/strict";
import {
  describe,
  it,
} from "node:test";

import {
  reconcileRecommendationState,
} from "../../utils/recommendation-reconciliation";

// Command to run this test file:
// npx tsx --test apps/api/src/services/__tests__/recommendation-reconciliation.test.ts
describe(
  "Engineering recommendation reconciliation",
  () => {
    it(
      "keeps an active recommendation when it remains applicable",
      () => {
        const result =
          reconcileRecommendationState({
            existingRecommendations: [
              {
                id: "rec-1",
                recommendationKey:
                  "financial-safety",
                status: "ACTIVE",
              },
            ],

            currentRecommendationKeys: [
              "financial-safety",
            ],
          });

        assert.deepEqual(
          result.staleActiveIds,
          [],
        );
      },
    );

    it(
      "marks an obsolete active recommendation as stale",
      () => {
        const result =
          reconcileRecommendationState({
            existingRecommendations: [
              {
                id: "rec-1",
                recommendationKey:
                  "developer-tooling-docs",
                status: "ACTIVE",
              },
            ],

            currentRecommendationKeys: [
              "financial-safety",
            ],
          });

        assert.deepEqual(
          result.staleActiveIds,
          [
            "rec-1",
          ],
        );
      },
    );

    it(
      "reconciles multiple recommendations after repository identity changes",
      () => {
        const result =
          reconcileRecommendationState({
            existingRecommendations: [
              {
                id: "devtool",
                recommendationKey:
                  "developer-tooling-docs",
                status: "ACTIVE",
              },
              {
                id: "realtime",
                recommendationKey:
                  "realtime-operational-updates",
                status: "ACTIVE",
              },
              {
                id: "finance",
                recommendationKey:
                  "financial-safety",
                status: "ACTIVE",
              },
            ],

            currentRecommendationKeys: [
              "financial-safety",
            ],
          });

        assert.deepEqual(
          result.staleActiveIds,
          [
            "devtool",
            "realtime",
          ],
        );
      },
    );

    it(
      "does not alter dismissed recommendations",
      () => {
        const result =
          reconcileRecommendationState({
            existingRecommendations: [
              {
                id: "dismissed-1",
                recommendationKey:
                  "old-recommendation",
                status: "DISMISSED",
              },
            ],

            currentRecommendationKeys:
              [],
          });

        assert.deepEqual(
          result.staleActiveIds,
          [],
        );
      },
    );

    it(
      "does not alter already resolved recommendations",
      () => {
        const result =
          reconcileRecommendationState({
            existingRecommendations: [
              {
                id: "resolved-1",
                recommendationKey:
                  "old-recommendation",
                status: "RESOLVED",
              },
            ],

            currentRecommendationKeys:
              [],
          });

        assert.deepEqual(
          result.staleActiveIds,
          [],
        );
      },
    );

    it(
      "resolves all active recommendations when current intelligence produces none",
      () => {
        const result =
          reconcileRecommendationState({
            existingRecommendations: [
              {
                id: "rec-1",
                recommendationKey:
                  "one",
                status: "ACTIVE",
              },
              {
                id: "rec-2",
                recommendationKey:
                  "two",
                status: "ACTIVE",
              },
            ],

            currentRecommendationKeys:
              [],
          });

        assert.deepEqual(
          result.staleActiveIds,
          [
            "rec-1",
            "rec-2",
          ],
        );
      },
    );

    it(
      "does nothing for a repository with no persisted recommendations",
      () => {
        const result =
          reconcileRecommendationState({
            existingRecommendations:
              [],

            currentRecommendationKeys: [
              "financial-safety",
            ],
          });

        assert.deepEqual(
          result.staleActiveIds,
          [],
        );
      },
    );

    it(
      "uses recommendation keys rather than titles to determine applicability",
      () => {
        const result =
          reconcileRecommendationState({
            existingRecommendations: [
              {
                id: "rec-1",
                recommendationKey:
                  "financial-safety",
                status: "ACTIVE",
              },
            ],

            currentRecommendationKeys: [
              "financial-safety",
            ],
          });

        assert.equal(
          result.staleActiveIds.length,
          0,
        );
      },
    );

    it(
      "preserves existing recommendation ordering when identifying stale rows",
      () => {
        const result =
          reconcileRecommendationState({
            existingRecommendations: [
              {
                id: "first",
                recommendationKey:
                  "old-one",
                status: "ACTIVE",
              },
              {
                id: "second",
                recommendationKey:
                  "old-two",
                status: "ACTIVE",
              },
              {
                id: "third",
                recommendationKey:
                  "current",
                status: "ACTIVE",
              },
            ],

            currentRecommendationKeys: [
              "current",
            ],
          });

        assert.deepEqual(
          result.staleActiveIds,
          [
            "first",
            "second",
          ],
        );
      },
    );

    it(
      "is deterministic for identical recommendation state",
      () => {
        const input = {
          existingRecommendations: [
            {
              id: "rec-1",
              recommendationKey:
                "old",
              status: "ACTIVE",
            },
            {
              id: "rec-2",
              recommendationKey:
                "current",
              status: "ACTIVE",
            },
          ],

          currentRecommendationKeys: [
            "current",
          ],
        };

        assert.deepEqual(
          reconcileRecommendationState(
            input,
          ),
          reconcileRecommendationState(
            input,
          ),
        );
      },
    );
  },
);
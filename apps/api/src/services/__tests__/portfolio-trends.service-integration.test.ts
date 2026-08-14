import assert from "node:assert/strict";
import test from "node:test";

import {
  prisma,
} from "@archive/database";

import {
  portfolioTrendsService,
} from "../portfolio-trends.service";

/**
 * Service-level Portfolio Trends regression.
 *
 * Future me:
 *
 * This test deliberately patches Prisma methods directly instead of using
 * node:test mock.method().
 *
 * Prisma's generated delegate methods are callable at runtime, but they do
 * not behave like ordinary object methods when Node's MockTracker attempts
 * to replace them.
 *
 * Always restore the original methods in finally.
 */
test(
  "keeps historical architecture activity separate from canonical current portfolio composition",
  async () => {
    const activityDate =
      new Date();

    /**
     * Keep the real Prisma methods so this test cannot leak mocked behaviour
     * into another test.
     */
    const originalUserFindUnique =
      prisma.user.findUnique;

    const originalRepositoryFindMany =
      prisma.repository.findMany;

    try {
      /**
       * ---------------------------------------------------------------
       * MOCK PORTFOLIO OWNER
       * ---------------------------------------------------------------
       */
      Object.defineProperty(
        prisma.user,
        "findUnique",
        {
          configurable: true,

          value: async () => ({
            id:
              "user-1",

            username:
              "DevRajah",

            avatarUrl:
              null,
          }),
        },
      );

      /**
       * ---------------------------------------------------------------
       * MOCK REPOSITORY DATA
       * ---------------------------------------------------------------
       *
       * This repository intentionally has two different stories:
       *
       * HISTORICAL ACTIVITY:
       *
       * ArchitectureChange exists today and must count as one activity item.
       *
       * CURRENT COMPOSITION:
       *
       * RepositoryIntelligenceSnapshot says the repository is currently a
       * FINTECH_PLATFORM using PostgreSQL, Redis and BullMQ.
       *
       * The historical classification must never replace current truth.
       */
      Object.defineProperty(
        prisma.repository,
        "findMany",
        {
          configurable: true,

          value: async () => [
            {
              id:
                "repo-1",

              name:
                "Ledger_Flow",

              fullName:
                "DevRajah/Ledger_Flow",

              language:
                "TypeScript",

              isTracked:
                true,

              updatedAt:
                activityDate,

              /**
               * CURRENT repository intelligence.
               */
              intelligenceSnapshots: [
                {
                  primaryRepositoryType:
                    "FINTECH_PLATFORM",

                  /**
                   * Deliberately stale/incomplete dedicated values.
                   *
                   * The complete nested intelligence below should win.
                   */
                  repositoryTypes: [
                    "JAVASCRIPT_TYPESCRIPT_PROJECT",
                  ],

                  technologies: [
                    "Node.js",
                  ],

                  architectureDomains: [
                    "BACKEND_SYSTEMS",
                  ],

                  capabilities:
                    [],

                  intelligence: {
                    identity: {
                      repositoryTypes: [
                        "FINTECH_PLATFORM",
                      ],
                    },

                    signals: {
                      technologies: [
                        "Node.js",
                        "PostgreSQL",
                        "Redis",
                        "BullMQ",
                      ],

                      architectureDomains: [
                        "BACKEND_SYSTEMS",
                        "DATABASE_LAYER",
                        "QUEUE_INFRASTRUCTURE",
                      ],

                      engineeringSignals: [
                        "DATABASE_PERSISTENCE",
                        "QUEUE_PROCESSING",
                      ],

                      reasoningSignals: [
                        "Detected implemented financial processing domains",
                        "Detected background job and queue processing patterns",
                      ],

                      capabilities:
                        [],
                    },
                  },
                },
              ],

              /**
               * No other activity types are required for this regression.
               */
              events:
                [],

              timelineEntries:
                [],

              /**
               * HISTORICAL activity.
               *
               * The actual Portfolio Trends query currently needs only
               * reasoningSignals and createdAt from ArchitectureChange.
               *
               * These extra stale fields are deliberately present to prove
               * they cannot contaminate current composition.
               */
              architectureChanges: [
                {
                  reasoningSignals:
                    "Historical generic backend evidence",

                  createdAt:
                    activityDate,

                  architectureDomain:
                    "LEGACY_DOMAIN",

                  detectedTechnology:
                    "Legacy Technology",

                  repositoryTypes:
                    "JAVASCRIPT_TYPESCRIPT_PROJECT",
                },
              ],

              engineeringRecommendations:
                [],
            },
          ],
        },
      );

      /**
       * ---------------------------------------------------------------
       * EXECUTE THE REAL SERVICE
       * ---------------------------------------------------------------
       */
      const result =
        await portfolioTrendsService.getTrends({
          userId:
            "user-1",

          period:
            "30d",
        });

      assert.ok(
        result,
        "Expected Portfolio Trends to return a result.",
      );

      /**
       * ===============================================================
       * 1. HISTORICAL ARCHITECTURE ACTIVITY STILL COUNTS
       * ===============================================================
       */
      assert.equal(
        result.totals.architectureChanges,
        1,
      );

      assert.equal(
        result.totals.totalActivity,
        1,
      );

      const activityDateKey =
        activityDate
          .toISOString()
          .slice(
            0,
            10,
          );

      const trendPoint =
        result.trend.find(
          (point) =>
            point.date ===
            activityDateKey,
        );

      assert.ok(
        trendPoint,
        "Expected a daily trend bucket for the ArchitectureChange date.",
      );

      assert.equal(
        trendPoint.architectureChanges,
        1,
      );

      /**
       * The repository-level activity calculation must independently agree
       * with the daily trend.
       */
      assert.equal(
        result.repositoryActivity.length,
        1,
      );

      assert.equal(
        result.repositoryActivity[0]
          .activity
          .architectureChanges,
        1,
      );

      assert.equal(
        result.repositoryActivity[0]
          .activity
          .total,
        1,
      );

      /**
       * ===============================================================
       * 2. CURRENT REPOSITORY TYPE COMES FROM THE SNAPSHOT
       * ===============================================================
       */
      assert.deepEqual(
        result.distributions.repositoryTypes,
        [
          {
            name:
              "FINTECH_PLATFORM",

            count:
              1,
          },
        ],
      );

      /**
       * This stale historical/general identity must not return.
       */
      assert.equal(
        result.distributions.repositoryTypes.some(
          (item) =>
            item.name ===
            "JAVASCRIPT_TYPESCRIPT_PROJECT",
        ),
        false,
      );

      /**
       * ===============================================================
       * 3. CURRENT TECHNOLOGIES COME FROM THE SNAPSHOT
       * ===============================================================
       *
       * All counts are equal, therefore Portfolio Trends sorts alphabetically.
       */
      assert.deepEqual(
        result.distributions.technologies,
        [
          {
            name:
              "BullMQ",

            count:
              1,
          },

          {
            name:
              "Node.js",

            count:
              1,
          },

          {
            name:
              "PostgreSQL",

            count:
              1,
          },

          {
            name:
              "Redis",

            count:
              1,
          },
        ],
      );

      /**
       * Historical technology classification must not leak into current
       * portfolio composition.
       */
      assert.equal(
        result.distributions.technologies.some(
          (item) =>
            item.name ===
            "Legacy Technology",
        ),
        false,
      );

      /**
       * ===============================================================
       * 4. CURRENT ARCHITECTURE DOMAINS COME FROM THE SNAPSHOT
       * ===============================================================
       */
      assert.deepEqual(
        result.distributions.architectureDomains,
        [
          {
            name:
              "BACKEND_SYSTEMS",

            count:
              1,
          },

          {
            name:
              "DATABASE_LAYER",

            count:
              1,
          },

          {
            name:
              "QUEUE_INFRASTRUCTURE",

            count:
              1,
          },
        ],
      );

      assert.equal(
        result.distributions.architectureDomains.some(
          (item) =>
            item.name ===
            "LEGACY_DOMAIN",
        ),
        false,
      );

      /**
       * ===============================================================
       * 5. LANGUAGE REMAINS CURRENT REPOSITORY METADATA
       * ===============================================================
       */
      assert.deepEqual(
        result.distributions.languages,
        [
          {
            name:
              "TypeScript",

            count:
              1,
          },
        ],
      );

      /**
       * ===============================================================
       * FINAL SEMANTIC INVARIANT
       * ===============================================================
       *
       * ArchitectureChange:
       *
       *     historical activity ✅
       *
       * RepositoryIntelligenceSnapshot:
       *
       *     current repository type ✅
       *     current technologies ✅
       *     current architecture domains ✅
       */
    } finally {
      /**
       * ---------------------------------------------------------------
       * RESTORE REAL PRISMA METHODS
       * ---------------------------------------------------------------
       *
       * This executes even when an assertion fails.
       */
      Object.defineProperty(
        prisma.user,
        "findUnique",
        {
          configurable: true,
          value:
            originalUserFindUnique,
        },
      );

      Object.defineProperty(
        prisma.repository,
        "findMany",
        {
          configurable: true,
          value:
            originalRepositoryFindMany,
        },
      );
    }
  },
);
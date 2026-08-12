import assert from "node:assert/strict";
import {
  describe,
  it,
} from "node:test";

import {
  compareRepositories,
} from "../repository-comparison-engine";

// Command to run this test file:
// npx tsx --test packages/detectors/src/repository-comparison/__tests__/repository-comparison-engine.test.ts
describe(
  "Repository comparison",
  () => {
    it(
      "returns low similarity for coincidental overlap",
      () => {
        const result =
          compareRepositories({
            source: {
              name: "Source",

              repositoryTypes: [
                "DEVTOOL_PLATFORM",
              ],

              architectureDomains: [
                "DEVELOPER_INFRASTRUCTURE",
                "QUEUE_INFRASTRUCTURE",
                "DEVOPS_INFRASTRUCTURE",
              ],

              technologies: [
                "Node.js",
                "BullMQ",
                "Docker",
                "Redis",
              ],

              capabilities: [
                "QUEUE_INFRASTRUCTURE",
                "DEVOPS_INFRASTRUCTURE",
                "CACHE_INFRASTRUCTURE",
              ],
            },

            target: {
              name: "Target",

              repositoryTypes: [
                "FINTECH_PLATFORM",
              ],

              architectureDomains: [
                "FINANCIAL_SYSTEMS",
                "SECURITY_SYSTEMS",
                "PAYMENT_INFRASTRUCTURE",
              ],

              technologies: [
                "Node.js",
                "PostgreSQL",
                "Stripe",
                "Prisma ORM",
              ],

              capabilities: [
                "DATABASE_LAYER",
                "AUTHENTICATION",
                "OBSERVABILITY",
              ],
            },
          });

        assert.ok(
          result.similarityScore < 40
        );

        assert.equal(
          result.similarityLevel,
          "LOW"
        );

        assert.deepEqual(
          result.sharedSignals.repositoryTypes,
          []
        );

        assert.deepEqual(
          result.sharedSignals.architectureDomains,
          []
        );

        assert.deepEqual(
          result.sharedSignals.capabilities,
          []
        );

        assert.deepEqual(
          result.sharedSignals.technologies,
          ["Node.js"]
        );
      }
    );

    it(
      "returns medium similarity for meaningful engineering overlap",
      () => {
        const result =
          compareRepositories({
            source: {
              name: "Backend Forge",

              repositoryTypes: [
                "DEVTOOL_PLATFORM",
              ],

              architectureDomains: [
                "BACKEND_SYSTEMS",
                "QUEUE_INFRASTRUCTURE",
                "DATABASE_LAYER",
                "CACHING_LAYER",
                "SERVICE_ARCHITECTURE",
              ],

              technologies: [
                "Node.js",
                "TypeScript",
                "Redis",
                "BullMQ",
                "Fastify",
              ],

              capabilities: [
                "API_LAYER",
                "QUEUE_INFRASTRUCTURE",
                "DATABASE_LAYER",
                "CACHE_INFRASTRUCTURE",
                "REALTIME_SYSTEMS",
              ],
            },

            target: {
              name: "Ledger Flow",

              repositoryTypes: [
                "FINTECH_PLATFORM",
              ],

              architectureDomains: [
                "BACKEND_SYSTEMS",
                "DATABASE_LAYER",
                "CACHING_LAYER",
                "SERVICE_ARCHITECTURE",
                "FINANCIAL_SYSTEMS",
              ],

              technologies: [
                "Node.js",
                "TypeScript",
                "Redis",
                "Fastify",
                "PostgreSQL",
              ],

              capabilities: [
                "API_LAYER",
                "DATABASE_LAYER",
                "CACHE_INFRASTRUCTURE",
                "OBSERVABILITY",
              ],
            },
          });

        assert.ok(
          result.similarityScore >= 40
        );

        assert.ok(
          result.similarityScore < 70
        );

        assert.equal(
          result.similarityLevel,
          "MEDIUM"
        );
      }
    );

    it(
      "returns high similarity for strongly related repositories",
      () => {
        const result =
          compareRepositories({
            source: {
              name: "Source",

              repositoryTypes: [
                "DEVTOOL_PLATFORM",
              ],

              architectureDomains: [
                "BACKEND_SYSTEMS",
                "QUEUE_INFRASTRUCTURE",
                "DATABASE_LAYER",
                "CACHING_LAYER",
                "DEVOPS_INFRASTRUCTURE",
              ],

              technologies: [
                "Node.js",
                "TypeScript",
                "Redis",
                "BullMQ",
                "Docker",
              ],

              capabilities: [
                "API_LAYER",
                "QUEUE_INFRASTRUCTURE",
                "DATABASE_LAYER",
                "CACHE_INFRASTRUCTURE",
                "DEVOPS_INFRASTRUCTURE",
              ],
            },

            target: {
              name: "Target",

              repositoryTypes: [
                "DEVTOOL_PLATFORM",
              ],

              architectureDomains: [
                "BACKEND_SYSTEMS",
                "QUEUE_INFRASTRUCTURE",
                "DATABASE_LAYER",
                "CACHING_LAYER",
                "DEVOPS_INFRASTRUCTURE",
              ],

              technologies: [
                "Node.js",
                "TypeScript",
                "Redis",
                "BullMQ",
                "Docker",
              ],

              capabilities: [
                "API_LAYER",
                "QUEUE_INFRASTRUCTURE",
                "DATABASE_LAYER",
                "CACHE_INFRASTRUCTURE",
                "DEVOPS_INFRASTRUCTURE",
              ],
            },
          });

        assert.ok(
          result.similarityScore >= 70
        );

        assert.equal(
          result.similarityLevel,
          "HIGH"
        );

        assert.equal(
          result.similarityScore,
          100
        );
      }
    );

    it(
      "normalizes case without fuzzy matching",
      () => {
        const result =
          compareRepositories({
            source: {
              name: "Source",

              repositoryTypes: [
                "DEVTOOL_PLATFORM",
              ],

              architectureDomains: [
                "BACKEND_SYSTEMS",
              ],

              technologies: [
                "Node.js",
              ],

              capabilities: [
                "API_LAYER",
              ],
            },

            target: {
              name: "Target",

              repositoryTypes: [
                "devtool_platform",
              ],

              architectureDomains: [
                "backend_systems",
              ],

              technologies: [
                "node.js",
              ],

              capabilities: [
                "api_layer",
              ],
            },
          });

        assert.deepEqual(
          result.sharedSignals.repositoryTypes,
          ["DEVTOOL_PLATFORM"]
        );

        assert.deepEqual(
          result.sharedSignals.architectureDomains,
          ["BACKEND_SYSTEMS"]
        );

        assert.deepEqual(
          result.sharedSignals.technologies,
          ["Node.js"]
        );

        assert.deepEqual(
          result.sharedSignals.capabilities,
          ["API_LAYER"]
        );
      }
    );

    it(
      "treats 2 shared technologies out of 2 as stronger than 2 shared out of 20",
      () => {
        const compact =
          compareRepositories({
            source: {
              name: "Compact Source",

              repositoryTypes: [],
              architectureDomains: [],
              capabilities: [],

              technologies: [
                "Node.js",
                "Redis",
              ],
            },

            target: {
              name: "Compact Target",

              repositoryTypes: [],
              architectureDomains: [],
              capabilities: [],

              technologies: [
                "Node.js",
                "Redis",
              ],
            },
          });

        const broad =
          compareRepositories({
            source: {
              name: "Broad Source",

              repositoryTypes: [],
              architectureDomains: [],
              capabilities: [],

              technologies: [
                "Node.js",
                "Redis",
                ...Array.from(
                  { length: 18 },
                  (_, index) =>
                    `Source-${index}`
                ),
              ],
            },

            target: {
              name: "Broad Target",

              repositoryTypes: [],
              architectureDomains: [],
              capabilities: [],

              technologies: [
                "Node.js",
                "Redis",
                ...Array.from(
                  { length: 18 },
                  (_, index) =>
                    `Target-${index}`
                ),
              ],
            },
          });

        assert.ok(
          compact.similarityScore >
            broad.similarityScore
        );

        assert.equal(
          compact.scoreBreakdown.technologyScore,
          20
        );

        assert.ok(
          broad.scoreBreakdown.technologyScore <
            20
        );
      }
    );

    it(
      "allows strong engineering overlap despite different repository identities",
      () => {
        const result =
          compareRepositories({
            source: {
              name: "Backend Forge",

              repositoryTypes: [
                "DEVTOOL_PLATFORM",
              ],

              architectureDomains: [
                "BACKEND_SYSTEMS",
                "DEVOPS_INFRASTRUCTURE",
                "QUEUE_INFRASTRUCTURE",
                "CACHING_LAYER",
                "DATABASE_LAYER",
                "SERVICE_ARCHITECTURE",
              ],

              technologies: [
                "Node.js",
                "TypeScript",
                "Docker",
                "Redis",
                "BullMQ",
                "Socket.IO",
                "JWT",
                "Fastify",
              ],

              capabilities: [
                "QUEUE_INFRASTRUCTURE",
                "DATABASE_LAYER",
                "REALTIME_SYSTEMS",
                "API_LAYER",
                "AUTHENTICATION",
                "DEVOPS_INFRASTRUCTURE",
                "CACHE_INFRASTRUCTURE",
                "TESTING",
              ],
            },

            target: {
              name: "ArcHive",

              repositoryTypes: [
                "ENGINEERING_INTELLIGENCE_PLATFORM",
              ],

              architectureDomains: [
                "BACKEND_SYSTEMS",
                "DEVOPS_INFRASTRUCTURE",
                "REALTIME_SYSTEMS",
                "QUEUE_INFRASTRUCTURE",
                "CACHING_LAYER",
                "DATABASE_LAYER",
                "SERVICE_ARCHITECTURE",
                "FRONTEND_ARCHITECTURE",
              ],

              technologies: [
                "Node.js",
                "TypeScript",
                "Docker",
                "Redis",
                "BullMQ",
                "Socket.IO",
                "JWT",
                "Fastify",
                "Next.js",
              ],

              capabilities: [
                "QUEUE_INFRASTRUCTURE",
                "DATABASE_LAYER",
                "REALTIME_SYSTEMS",
                "API_LAYER",
                "AUTHENTICATION",
                "DEVOPS_INFRASTRUCTURE",
                "CACHE_INFRASTRUCTURE",
                "TESTING",
                "OBSERVABILITY",
              ],
            },
          });

        /**
         * Product identity is completely different.
         */
        assert.equal(
          result.scoreBreakdown.repositoryTypeScore,
          0
        );

        assert.deepEqual(
          result.sharedSignals.repositoryTypes,
          []
        );

        /**
         * But engineering structure is still strongly related.
         */
        assert.ok(
          result.similarityScore >= 40
        );

        assert.ok(
          result.sharedSignals.capabilities.length >= 7
        );

        assert.ok(
          result.sharedSignals.technologies.length >= 7
        );
      }
    );

    it(
      "is deterministic for identical inputs",
      () => {
        const input = {
          source: {
            name: "Source",

            repositoryTypes: [
              "DEVTOOL_PLATFORM",
            ],

            architectureDomains: [
              "BACKEND_SYSTEMS",
              "QUEUE_INFRASTRUCTURE",
            ],

            technologies: [
              "Node.js",
              "BullMQ",
            ],

            capabilities: [
              "API_LAYER",
              "QUEUE_INFRASTRUCTURE",
            ],
          },

          target: {
            name: "Target",

            repositoryTypes: [
              "DEVTOOL_PLATFORM",
            ],

            architectureDomains: [
              "BACKEND_SYSTEMS",
              "QUEUE_INFRASTRUCTURE",
            ],

            technologies: [
              "Node.js",
              "BullMQ",
            ],

            capabilities: [
              "API_LAYER",
              "QUEUE_INFRASTRUCTURE",
            ],
          },
        };

        assert.deepEqual(
          compareRepositories(input),
          compareRepositories(input)
        );
      }
    );
  }
);
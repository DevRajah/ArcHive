import assert from "node:assert/strict";
import {
  describe,
  it,
} from "node:test";

import {
  calculateRepositorySimilarity,
} from "../repository-similarity";

// Command to run this test file:
//npx tsx --test packages/detectors/src/__tests__/repository-similarity.test.ts

describe(
  "Repository similarity",
  () => {
    it(
      "returns low similarity for coincidental technology overlap",
      () => {
        const result =
          calculateRepositorySimilarity({
            sourceRepositoryTypes: [
              "DEVTOOL_PLATFORM",
            ],

            sourceDomains: [
              "DEVELOPER_INFRASTRUCTURE",
              "QUEUE_INFRASTRUCTURE",
              "DEVOPS_INFRASTRUCTURE",
            ],

            sourceTechnologies: [
              "Node.js",
              "BullMQ",
              "Docker",
              "Redis",
            ],

            sourceCapabilities: [
              "QUEUE_INFRASTRUCTURE",
              "DEVOPS_INFRASTRUCTURE",
              "CACHE_INFRASTRUCTURE",
            ],

            targetRepositoryTypes: [
              "FINTECH_PLATFORM",
            ],

            targetDomains: [
              "FINANCIAL_SYSTEMS",
              "SECURITY_SYSTEMS",
              "PAYMENT_INFRASTRUCTURE",
            ],

            targetTechnologies: [
              "Node.js",
              "PostgreSQL",
              "Stripe",
              "Prisma ORM",
            ],

            targetCapabilities: [
              "DATABASE_LAYER",
              "AUTHENTICATION",
              "OBSERVABILITY",
            ],
          });

        /**
         * Node.js is the only shared implementation technology.
         *
         * The repositories do not share repository identity,
         * architecture domains, or capabilities, so one common
         * runtime should not make them meaningfully related.
         */
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
          result.sharedSignals.domains,
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
      "returns medium similarity for meaningful structural overlap",
      () => {
        const result =
          calculateRepositorySimilarity({
            sourceRepositoryTypes: [
              "DEVTOOL_PLATFORM",
            ],
            sourceDomains: [
              "BACKEND_SYSTEMS",
              "QUEUE_INFRASTRUCTURE",
              "DATABASE_LAYER",
              "CACHING_LAYER",
            ],
            sourceTechnologies: [
              "Node.js",
              "Redis",
              "BullMQ",
              "Fastify",
            ],
            sourceCapabilities: [
              "API_LAYER",
              "QUEUE_INFRASTRUCTURE",
              "DATABASE_LAYER",
              "CACHE_INFRASTRUCTURE",
            ],

            targetRepositoryTypes: [
              "FINTECH_PLATFORM",
            ],
            targetDomains: [
              "BACKEND_SYSTEMS",
              "DATABASE_LAYER",
              "CACHING_LAYER",
            ],
            targetTechnologies: [
              "Node.js",
              "Redis",
              "Fastify",
              "PostgreSQL",
            ],
            targetCapabilities: [
              "API_LAYER",
              "DATABASE_LAYER",
              "CACHE_INFRASTRUCTURE",
            ],
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
          calculateRepositorySimilarity({
            sourceRepositoryTypes: [
              "DEVTOOL_PLATFORM",
            ],
            sourceDomains: [
              "BACKEND_SYSTEMS",
              "QUEUE_INFRASTRUCTURE",
              "DATABASE_LAYER",
              "CACHING_LAYER",
              "DEVOPS_INFRASTRUCTURE",
            ],
            sourceTechnologies: [
              "Node.js",
              "TypeScript",
              "Redis",
              "BullMQ",
              "Docker",
            ],
            sourceCapabilities: [
              "API_LAYER",
              "QUEUE_INFRASTRUCTURE",
              "DATABASE_LAYER",
              "CACHE_INFRASTRUCTURE",
              "DEVOPS_INFRASTRUCTURE",
            ],

            targetRepositoryTypes: [
              "DEVTOOL_PLATFORM",
            ],
            targetDomains: [
              "BACKEND_SYSTEMS",
              "QUEUE_INFRASTRUCTURE",
              "DATABASE_LAYER",
              "CACHING_LAYER",
              "DEVOPS_INFRASTRUCTURE",
            ],
            targetTechnologies: [
              "Node.js",
              "TypeScript",
              "Redis",
              "BullMQ",
              "Docker",
            ],
            targetCapabilities: [
              "API_LAYER",
              "QUEUE_INFRASTRUCTURE",
              "DATABASE_LAYER",
              "CACHE_INFRASTRUCTURE",
              "DEVOPS_INFRASTRUCTURE",
            ],
          });

        assert.ok(
          result.similarityScore >= 70
        );

        assert.equal(
          result.similarityLevel,
          "HIGH"
        );
      }
    );

    it(
      "treats 2 shared technologies out of 2 as stronger overlap than 2 out of 20",
      () => {
        const compact =
          calculateRepositorySimilarity({
            sourceRepositoryTypes: [],
            sourceDomains: [],
            sourceTechnologies: [
              "Node.js",
              "Redis",
            ],
            sourceCapabilities: [],

            targetRepositoryTypes: [],
            targetDomains: [],
            targetTechnologies: [
              "Node.js",
              "Redis",
            ],
            targetCapabilities: [],
          });

        const broad =
          calculateRepositorySimilarity({
            sourceRepositoryTypes: [],
            sourceDomains: [],
            sourceTechnologies: [
              "Node.js",
              "Redis",
              ...Array.from(
                { length: 18 },
                (_, index) =>
                  `Source-${index}`
              ),
            ],
            sourceCapabilities: [],

            targetRepositoryTypes: [],
            targetDomains: [],
            targetTechnologies: [
              "Node.js",
              "Redis",
              ...Array.from(
                { length: 18 },
                (_, index) =>
                  `Target-${index}`
              ),
            ],
            targetCapabilities: [],
          });

        assert.ok(
          compact.similarityScore >
          broad.similarityScore
        );
      }
    );

    it(
      "normalizes case without fuzzy matching",
      () => {
        const result =
          calculateRepositorySimilarity({
            sourceRepositoryTypes: [
              "DEVTOOL_PLATFORM",
            ],
            sourceDomains: [
              "BACKEND_SYSTEMS",
            ],
            sourceTechnologies: [
              "Node.js",
            ],
            sourceCapabilities: [
              "API_LAYER",
            ],

            targetRepositoryTypes: [
              "devtool_platform",
            ],
            targetDomains: [
              "backend_systems",
            ],
            targetTechnologies: [
              "node.js",
            ],
            targetCapabilities: [
              "api_layer",
            ],
          });

        assert.deepEqual(
          result.sharedSignals.repositoryTypes,
          ["DEVTOOL_PLATFORM"]
        );

        assert.deepEqual(
          result.sharedSignals.domains,
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
      "is deterministic for identical inputs",
      () => {
        const input = {
          sourceRepositoryTypes: [
            "DEVTOOL_PLATFORM",
          ],
          sourceDomains: [
            "BACKEND_SYSTEMS",
          ],
          sourceTechnologies: [
            "Node.js",
          ],
          sourceCapabilities: [
            "API_LAYER",
          ],

          targetRepositoryTypes: [
            "DEVTOOL_PLATFORM",
          ],
          targetDomains: [
            "BACKEND_SYSTEMS",
          ],
          targetTechnologies: [
            "Node.js",
          ],
          targetCapabilities: [
            "API_LAYER",
          ],
        };

        assert.deepEqual(
          calculateRepositorySimilarity(
            input
          ),
          calculateRepositorySimilarity(
            input
          )
        );
      }
    );
  }
);
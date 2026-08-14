import assert from "node:assert/strict";

import {
  describe,
  it,
} from "node:test";

import {
  buildCanonicalPortfolioDistributions,
} from "../portfolio-canonical-aggregation";


// Command to run this test file:
// npx node --test apps/api/src/services/__tests__/portfolio-canonical-aggregation.test.ts

describe(
  "Portfolio canonical aggregation",
  () => {
    it(
      "aggregates the full canonical architecture-domain arrays",
      () => {
        const result =
          buildCanonicalPortfolioDistributions([
            {
              repositoryTypes: [
                "FINTECH_PLATFORM",
              ],

              architectureDomains: [
                "BACKEND_SYSTEMS",
                "REALTIME_SYSTEMS",
                "QUEUE_INFRASTRUCTURE",
                "DATABASE_LAYER",
              ],

              technologies: [],
            },

            {
              repositoryTypes: [
                "DEVTOOL_PLATFORM",
              ],

              architectureDomains: [
                "BACKEND_SYSTEMS",
                "QUEUE_INFRASTRUCTURE",
                "DATABASE_LAYER",
                "DEVELOPER_INFRASTRUCTURE",
              ],

              technologies: [],
            },
          ]);

        assert.deepEqual(
          result.architectureDomains,
          [
            {
              name:
                "BACKEND_SYSTEMS",
              count: 2,
            },
            {
              name:
                "DATABASE_LAYER",
              count: 2,
            },
            {
              name:
                "QUEUE_INFRASTRUCTURE",
              count: 2,
            },
            {
              name:
                "DEVELOPER_INFRASTRUCTURE",
              count: 1,
            },
            {
              name:
                "REALTIME_SYSTEMS",
              count: 1,
            },
          ],
        );
      },
    );

    it(
      "aggregates the full canonical technology arrays",
      () => {
        const result =
          buildCanonicalPortfolioDistributions([
            {
              repositoryTypes: [],

              architectureDomains: [],

              technologies: [
                "Node.js",
                "TypeScript",
                "Redis",
                "BullMQ",
              ],
            },

            {
              repositoryTypes: [],

              architectureDomains: [],

              technologies: [
                "Node.js",
                "TypeScript",
                "Redis",
                "PostgreSQL",
              ],
            },
          ]);

        assert.deepEqual(
          result.technologies,
          [
            {
              name: "Node.js",
              count: 2,
            },
            {
              name: "Redis",
              count: 2,
            },
            {
              name: "TypeScript",
              count: 2,
            },
            {
              name: "BullMQ",
              count: 1,
            },
            {
              name: "PostgreSQL",
              count: 1,
            },
          ],
        );
      },
    );

    it(
      "counts repository coverage rather than duplicate occurrences inside one repository",
      () => {
        const result =
          buildCanonicalPortfolioDistributions([
            {
              repositoryTypes: [
                "FINTECH_PLATFORM",
                "FINTECH_PLATFORM",
              ],

              architectureDomains: [
                "BACKEND_SYSTEMS",
                "BACKEND_SYSTEMS",
                "DATABASE_LAYER",
              ],

              technologies: [
                "Node.js",
                "Node.js",
                "Redis",
                "Redis",
              ],
            },
          ]);

        assert.deepEqual(
          result.repositoryTypes,
          [
            {
              name:
                "FINTECH_PLATFORM",
              count: 1,
            },
          ],
        );

        assert.deepEqual(
          result.architectureDomains,
          [
            {
              name:
                "BACKEND_SYSTEMS",
              count: 1,
            },
            {
              name:
                "DATABASE_LAYER",
              count: 1,
            },
          ],
        );

        assert.deepEqual(
          result.technologies,
          [
            {
              name: "Node.js",
              count: 1,
            },
            {
              name: "Redis",
              count: 1,
            },
          ],
        );
      },
    );

    it(
      "allows one repository to contribute many different canonical signals",
      () => {
        const result =
          buildCanonicalPortfolioDistributions([
            {
              repositoryTypes: [
                "FINTECH_PLATFORM",
              ],

              architectureDomains: [
                "BACKEND_SYSTEMS",
                "REALTIME_SYSTEMS",
                "QUEUE_INFRASTRUCTURE",
                "CACHING_LAYER",
                "DATABASE_LAYER",
                "DOCUMENTATION_SYSTEM",
                "FINANCIAL_SYSTEMS",
                "SERVICE_ARCHITECTURE",
              ],

              technologies: [
                "Node.js",
                "TypeScript",
                "Redis",
                "Express",
                "PostgreSQL",
                "Prisma ORM",
                "BullMQ",
                "express-rate-limit",
                "Fastify",
                "NestJS",
              ],
            },
          ]);

        assert.equal(
          result.architectureDomains.length,
          8,
        );

        assert.equal(
          result.technologies.length,
          10,
        );

        assert.ok(
          result.architectureDomains.some(
            (item) =>
              item.name ===
                "REALTIME_SYSTEMS" &&
              item.count === 1,
          ),
        );

        assert.ok(
          result.technologies.some(
            (item) =>
              item.name ===
                "express-rate-limit" &&
              item.count === 1,
          ),
        );
      },
    );

    it(
      "aggregates repository identities from canonical repository types",
      () => {
        const result =
          buildCanonicalPortfolioDistributions([
            {
              repositoryTypes: [
                "FINTECH_PLATFORM",
              ],

              architectureDomains: [],

              technologies: [],
            },

            {
              repositoryTypes: [
                "DEVTOOL_PLATFORM",
              ],

              architectureDomains: [],

              technologies: [],
            },

            {
              repositoryTypes: [
                "ENGINEERING_INTELLIGENCE_PLATFORM",
              ],

              architectureDomains: [],

              technologies: [],
            },
          ]);

        assert.deepEqual(
          result.repositoryTypes,
          [
            {
              name:
                "DEVTOOL_PLATFORM",
              count: 1,
            },
            {
              name:
                "ENGINEERING_INTELLIGENCE_PLATFORM",
              count: 1,
            },
            {
              name:
                "FINTECH_PLATFORM",
              count: 1,
            },
          ],
        );
      },
    );

    it(
      "handles repositories with empty canonical signal arrays",
      () => {
        const result =
          buildCanonicalPortfolioDistributions([
            {
              repositoryTypes: [],
              architectureDomains: [],
              technologies: [],
            },

            {
              repositoryTypes: [
                "FINTECH_PLATFORM",
              ],

              architectureDomains: [
                "BACKEND_SYSTEMS",
              ],

              technologies: [
                "Node.js",
              ],
            },
          ]);

        assert.deepEqual(
          result.repositoryTypes,
          [
            {
              name:
                "FINTECH_PLATFORM",
              count: 1,
            },
          ],
        );

        assert.deepEqual(
          result.architectureDomains,
          [
            {
              name:
                "BACKEND_SYSTEMS",
              count: 1,
            },
          ],
        );

        assert.deepEqual(
          result.technologies,
          [
            {
              name: "Node.js",
              count: 1,
            },
          ],
        );
      },
    );

    it(
      "returns empty distributions for an empty portfolio",
      () => {
        const result =
          buildCanonicalPortfolioDistributions(
            [],
          );

        assert.deepEqual(
          result,
          {
            repositoryTypes: [],
            architectureDomains: [],
            technologies: [],
          },
        );
      },
    );

    it(
      "sorts by repository count descending and then alphabetically",
      () => {
        const result =
          buildCanonicalPortfolioDistributions([
            {
              repositoryTypes: [],

              architectureDomains: [],

              technologies: [
                "Redis",
                "Node.js",
                "BullMQ",
              ],
            },

            {
              repositoryTypes: [],

              architectureDomains: [],

              technologies: [
                "Redis",
                "Node.js",
                "PostgreSQL",
              ],
            },

            {
              repositoryTypes: [],

              architectureDomains: [],

              technologies: [
                "Redis",
              ],
            },
          ]);

        assert.deepEqual(
          result.technologies,
          [
            {
              name: "Redis",
              count: 3,
            },
            {
              name: "Node.js",
              count: 2,
            },
            {
              name: "BullMQ",
              count: 1,
            },
            {
              name: "PostgreSQL",
              count: 1,
            },
          ],
        );
      },
    );

    it(
      "does not mix architecture domains into technologies",
      () => {
        const result =
          buildCanonicalPortfolioDistributions([
            {
              repositoryTypes: [
                "FINTECH_PLATFORM",
              ],

              architectureDomains: [
                "BACKEND_SYSTEMS",
                "DATABASE_LAYER",
                "FINANCIAL_SYSTEMS",
              ],

              technologies: [
                "Node.js",
                "PostgreSQL",
              ],
            },
          ]);

        assert.deepEqual(
          result.technologies,
          [
            {
              name: "Node.js",
              count: 1,
            },
            {
              name: "PostgreSQL",
              count: 1,
            },
          ],
        );

        assert.equal(
          result.technologies.some(
            (item) =>
              item.name ===
              "BACKEND_SYSTEMS",
          ),
          false,
        );

        assert.equal(
          result.technologies.some(
            (item) =>
              item.name ===
              "FINANCIAL_SYSTEMS",
          ),
          false,
        );
      },
    );

    it(
      "is deterministic for identical portfolio input",
      () => {
        const input = [
          {
            repositoryTypes: [
              "FINTECH_PLATFORM",
            ],

            architectureDomains: [
              "BACKEND_SYSTEMS",
              "DATABASE_LAYER",
            ],

            technologies: [
              "Node.js",
              "PostgreSQL",
            ],
          },

          {
            repositoryTypes: [
              "DEVTOOL_PLATFORM",
            ],

            architectureDomains: [
              "BACKEND_SYSTEMS",
              "DEVELOPER_INFRASTRUCTURE",
            ],

            technologies: [
              "Node.js",
              "Redis",
            ],
          },
        ];

        assert.deepEqual(
          buildCanonicalPortfolioDistributions(
            input,
          ),

          buildCanonicalPortfolioDistributions(
            input,
          ),
        );
      },
    );
  },
);
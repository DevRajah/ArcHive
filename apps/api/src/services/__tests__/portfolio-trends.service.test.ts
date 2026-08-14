import assert from "node:assert/strict";
import test from "node:test";

import {
  extractCanonicalRepositoryIntelligenceSignals,
} from "../canonical-repository-intelligence-signals.service";

// Command to run this test file:
// npx node --test apps/api/src/services/__tests__/portfolio-trends.service.test.ts

/**
 * Portfolio Trends canonical aggregation regression suite.
 *
 * Future me:
 * Portfolio Trends contains two different kinds of information:
 *
 * 1. Historical activity
 *    ArchitectureChange belongs here because it records something that
 *    happened at a particular point in repository history.
 *
 * 2. Current portfolio composition
 *    Repository types, technologies, and architecture domains must come
 *    from the latest RepositoryIntelligenceSnapshot.
 *
 * Never use historical ArchitectureChange classification fields to rebuild
 * current portfolio composition.
 */

test(
  "Portfolio Trends uses canonical snapshot signals for current composition instead of historical ArchitectureChange classification",
  () => {
    /**
     * Imagine this is LedgerFlow's latest canonical repository snapshot.
     *
     * The repository has evolved into a fintech platform with queue,
     * database, caching, realtime, and backend infrastructure.
     */
    const latestSnapshot = {
      primaryRepositoryType:
        "FINTECH_PLATFORM",

      repositoryTypes: [
        "FINTECH_PLATFORM",
      ],

      technologies: [
        "Node.js",
        "TypeScript",
        "PostgreSQL",
        "Prisma ORM",
        "Redis",
        "BullMQ",
      ],

      architectureDomains: [
        "BACKEND_SYSTEMS",
        "DATABASE_LAYER",
        "CACHING_LAYER",
        "QUEUE_INFRASTRUCTURE",
        "REALTIME_SYSTEMS",
      ],

      capabilities: [],

      intelligence: {
        identity: {
          repositoryTypes: [
            "FINTECH_PLATFORM",
          ],
        },

        signals: {
          technologies: [
            "Node.js",
            "TypeScript",
            "PostgreSQL",
            "Prisma ORM",
            "Redis",
            "BullMQ",
          ],

          architectureDomains: [
            "BACKEND_SYSTEMS",
            "DATABASE_LAYER",
            "CACHING_LAYER",
            "QUEUE_INFRASTRUCTURE",
            "REALTIME_SYSTEMS",
          ],

          engineeringSignals: [
            "QUEUE_PROCESSING",
            "DATABASE_PERSISTENCE",
          ],

          reasoningSignals: [
            "Detected implemented ledger and payment lifecycle architecture",
            "Detected background job and queue processing patterns",
          ],

          capabilities: [
            {
              key: "QUEUE_INFRASTRUCTURE",
              confidence: 92,
              reason:
                "Repository supports background job and queue processing.",
            },
          ],
        },
      },
    };

    /**
     * These records represent older repository history.
     *
     * They are still legitimate historical evidence, but they must not
     * redefine what the repository currently is.
     */
    const historicalArchitectureChanges = [
      {
        reasoningSignals:
          "Detected generic TypeScript project | Detected backend application",
      },
      {
        reasoningSignals:
          "Detected queue infrastructure | Detected Redis usage",
      },
    ];

    const canonical =
      extractCanonicalRepositoryIntelligenceSignals({
        latestSnapshot,
        architectureChanges:
          historicalArchitectureChanges,
      });

    assert.deepEqual(
      canonical.repositoryTypes,
      [
        "FINTECH_PLATFORM",
      ]
    );

    assert.deepEqual(
      canonical.technologies,
      [
        "Node.js",
        "TypeScript",
        "PostgreSQL",
        "Prisma ORM",
        "Redis",
        "BullMQ",
      ]
    );

    assert.deepEqual(
      canonical.domains,
      [
        "BACKEND_SYSTEMS",
        "DATABASE_LAYER",
        "CACHING_LAYER",
        "QUEUE_INFRASTRUCTURE",
        "REALTIME_SYSTEMS",
      ]
    );

    /**
     * The old generic classification must never leak back into current
     * portfolio composition.
     */
    assert.equal(
      canonical.repositoryTypes.includes(
        "JAVASCRIPT_TYPESCRIPT_PROJECT"
      ),
      false
    );
  }
);

test(
  "Portfolio Trends canonical extraction prefers nested intelligence signals over stale dedicated snapshot arrays",
  () => {
    /**
     * This protects us from an older/inconsistent snapshot where the
     * dedicated columns contain stale values but the complete persisted
     * intelligence payload contains the authoritative detector result.
     */
    const latestSnapshot = {
      primaryRepositoryType:
        "FINTECH_PLATFORM",

      repositoryTypes: [
        "JAVASCRIPT_TYPESCRIPT_PROJECT",
      ],

      technologies: [
        "Node.js",
      ],

      architectureDomains: [
        "BACKEND_SYSTEMS",
      ],

      capabilities: [],

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

          engineeringSignals: [],

          reasoningSignals: [
            "Detected implemented financial processing domains",
          ],

          capabilities: [],
        },
      },
    };

    const canonical =
      extractCanonicalRepositoryIntelligenceSignals({
        latestSnapshot,
      });

    assert.deepEqual(
      canonical.repositoryTypes,
      [
        "FINTECH_PLATFORM",
      ]
    );

    assert.deepEqual(
      canonical.technologies,
      [
        "Node.js",
        "PostgreSQL",
        "Redis",
        "BullMQ",
      ]
    );

    assert.deepEqual(
      canonical.domains,
      [
        "BACKEND_SYSTEMS",
        "DATABASE_LAYER",
        "QUEUE_INFRASTRUCTURE",
      ]
    );

    assert.equal(
      canonical.repositoryTypes.includes(
        "JAVASCRIPT_TYPESCRIPT_PROJECT"
      ),
      false
    );
  }
);

test(
  "Portfolio Trends canonical extraction falls back to dedicated snapshot columns when nested signals are unavailable",
  () => {
    /**
     * Not every historical snapshot necessarily has the complete modern
     * intelligence JSON shape.
     *
     * The dedicated RepositoryIntelligenceSnapshot columns are therefore
     * the safe fallback, not ArchitectureChange classification fields.
     */
    const latestSnapshot = {
      primaryRepositoryType:
        "FINTECH_PLATFORM",

      repositoryTypes: [
        "FINTECH_PLATFORM",
      ],

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

      capabilities: [
        {
          key: "QUEUE_INFRASTRUCTURE",
          confidence: 92,
          reason:
            "Detected background job infrastructure.",
        },
      ],

      intelligence: {},
    };

    const canonical =
      extractCanonicalRepositoryIntelligenceSignals({
        latestSnapshot,
      });

    assert.deepEqual(
      canonical.repositoryTypes,
      [
        "FINTECH_PLATFORM",
      ]
    );

    assert.deepEqual(
      canonical.technologies,
      [
        "Node.js",
        "PostgreSQL",
        "Redis",
        "BullMQ",
      ]
    );

    assert.deepEqual(
      canonical.domains,
      [
        "BACKEND_SYSTEMS",
        "DATABASE_LAYER",
        "QUEUE_INFRASTRUCTURE",
      ]
    );

    assert.deepEqual(
      canonical.capabilities,
      [
        {
          key: "QUEUE_INFRASTRUCTURE",
          confidence: 92,
          reason:
            "Detected background job infrastructure.",
        },
      ]
    );
  }
);

test(
  "historical reasoning may remain fallback evidence without becoming canonical repository composition",
  () => {
    /**
     * This distinction is subtle but important.
     *
     * Historical ArchitectureChange reasoning is still useful evidence when
     * an older snapshot does not contain structured reasoningSignals.
     *
     * That does NOT mean ArchitectureChange may redefine technologies,
     * domains, or repository types.
     */
    const latestSnapshot = {
      primaryRepositoryType:
        "FINTECH_PLATFORM",

      repositoryTypes: [
        "FINTECH_PLATFORM",
      ],

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

      capabilities: [],

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

          reasoningSignals: [],
          engineeringSignals: [],
          capabilities: [],
        },
      },
    };

    const canonical =
      extractCanonicalRepositoryIntelligenceSignals({
        latestSnapshot,

        architectureChanges: [
          {
            reasoningSignals:
              "Historical queue evidence | Historical payment evidence",
          },
        ],
      });

    /**
     * Historical reasoning remains available as supporting evidence.
     */
    assert.deepEqual(
      canonical.reasoningSignals,
      [
        "Historical queue evidence",
        "Historical payment evidence",
      ]
    );

    /**
     * But current composition remains completely snapshot-owned.
     */
    assert.deepEqual(
      canonical.repositoryTypes,
      [
        "FINTECH_PLATFORM",
      ]
    );

    assert.deepEqual(
      canonical.domains,
      [
        "BACKEND_SYSTEMS",
        "DATABASE_LAYER",
        "QUEUE_INFRASTRUCTURE",
      ]
    );

    assert.deepEqual(
      canonical.technologies,
      [
        "Node.js",
        "PostgreSQL",
        "Redis",
        "BullMQ",
      ]
    );
  }
);
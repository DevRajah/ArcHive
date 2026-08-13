import assert from "node:assert/strict";
import {
  describe,
  it,
} from "node:test";

import {
  extractCanonicalRepositoryIntelligenceSignals,
} from "../canonical-repository-intelligence-signals.service";


// Command to run this test file:
// npx tsx --test apps/api/src/services/__tests__/canonical-repository-intelligence-signals.test.ts

describe(
  "Canonical repository intelligence signals",
  () => {
    it(
      "prefers canonical snapshot domains over historical architecture-change domains",
      () => {
        const result =
          extractCanonicalRepositoryIntelligenceSignals({
            latestSnapshot: {
              primaryRepositoryType:
                "FINTECH_PLATFORM",

              repositoryTypes: [
                "FINTECH_PLATFORM",
              ],

              technologies: [
                "Node.js",
                "PostgreSQL",
              ],

              architectureDomains: [
                "BACKEND_SYSTEMS",
                "REALTIME_SYSTEMS",
                "DATABASE_LAYER",
              ],

              capabilities: [],

              intelligence: {
                signals: {
                  architectureDomains: [
                    "BACKEND_SYSTEMS",
                    "REALTIME_SYSTEMS",
                    "DATABASE_LAYER",
                  ],
                },
              },
            },

            architectureChanges: [
              {
                reasoningSignals:
                  "Historical signal",
              },
            ],
          });

        assert.deepEqual(
          result.domains,
          [
            "BACKEND_SYSTEMS",
            "REALTIME_SYSTEMS",
            "DATABASE_LAYER",
          ],
        );
      },
    );

    it(
      "prefers canonical technologies over historical technology fragments",
      () => {
        const result =
          extractCanonicalRepositoryIntelligenceSignals({
            latestSnapshot: {
              primaryRepositoryType:
                "FINTECH_PLATFORM",

              repositoryTypes: [
                "FINTECH_PLATFORM",
              ],

              technologies: [
                "Node.js",
                "PostgreSQL",
                "BullMQ",
              ],

              architectureDomains: [],

              capabilities: [],

              intelligence: {
                signals: {
                  technologies: [
                    "Node.js",
                    "PostgreSQL",
                    "BullMQ",
                  ],
                },
              },
            },

            architectureChanges: [],
          });

        assert.deepEqual(
          result.technologies,
          [
            "Node.js",
            "PostgreSQL",
            "BullMQ",
          ],
        );
      },
    );

    it(
      "uses canonical capabilities from persisted intelligence",
      () => {
        const result =
          extractCanonicalRepositoryIntelligenceSignals({
            latestSnapshot: {
              primaryRepositoryType:
                "FINTECH_PLATFORM",

              repositoryTypes: [
                "FINTECH_PLATFORM",
              ],

              technologies: [],

              architectureDomains: [],

              capabilities: [],

              intelligence: {
                signals: {
                  capabilities: [
                    {
                      key:
                        "REALTIME_SYSTEMS",
                      confidence: 92,
                      reason:
                        "Realtime evidence detected",
                    },
                  ],
                },
              },
            },

            architectureChanges: [],
          });

        assert.equal(
          result.capabilities[0]?.key,
          "REALTIME_SYSTEMS",
        );
      },
    );

    it(
      "falls back to snapshot columns when nested intelligence signals are absent",
      () => {
        const result =
          extractCanonicalRepositoryIntelligenceSignals({
            latestSnapshot: {
              primaryRepositoryType:
                "FINTECH_PLATFORM",

              repositoryTypes: [
                "FINTECH_PLATFORM",
              ],

              technologies: [
                "Node.js",
              ],

              architectureDomains: [
                "BACKEND_SYSTEMS",
              ],

              capabilities: [
                {
                  key:
                    "API_LAYER",
                  confidence: 90,
                  reason:
                    "API evidence",
                },
              ],

              intelligence: {},
            },

            architectureChanges: [],
          });

        assert.deepEqual(
          result.repositoryTypes,
          [
            "FINTECH_PLATFORM",
          ],
        );

        assert.deepEqual(
          result.technologies,
          [
            "Node.js",
          ],
        );

        assert.deepEqual(
          result.domains,
          [
            "BACKEND_SYSTEMS",
          ],
        );

        assert.equal(
          result.capabilities[0]?.key,
          "API_LAYER",
        );
      },
    );

    it(
      "uses historical reasoning only as a fallback",
      () => {
        const result =
          extractCanonicalRepositoryIntelligenceSignals({
            latestSnapshot: {
              primaryRepositoryType:
                "FINTECH_PLATFORM",

              repositoryTypes: [
                "FINTECH_PLATFORM",
              ],

              technologies: [],

              architectureDomains: [],

              capabilities: [],

              intelligence: {},
            },

            architectureChanges: [
              {
                reasoningSignals:
                  "Historical one | Historical two",
              },
            ],
          });

        assert.deepEqual(
          result.reasoningSignals,
          [
            "Historical one",
            "Historical two",
          ],
        );
      },
    );

    it(
      "is deterministic for identical snapshot input",
      () => {
        const input = {
          latestSnapshot: {
            primaryRepositoryType:
              "FINTECH_PLATFORM",

            repositoryTypes: [
              "FINTECH_PLATFORM",
            ],

            technologies: [
              "Node.js",
            ],

            architectureDomains: [
              "BACKEND_SYSTEMS",
            ],

            capabilities: [],

            intelligence: {},
          },

          architectureChanges: [],
        };

        assert.deepEqual(
          extractCanonicalRepositoryIntelligenceSignals(
            input,
          ),

          extractCanonicalRepositoryIntelligenceSignals(
            input,
          ),
        );
      },
    );
  },
);
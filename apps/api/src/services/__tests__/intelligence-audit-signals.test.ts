import assert from "node:assert/strict";
import {
  describe,
  it,
} from "node:test";

import {
  readAuditReasoningSignals,
  readAuditStringArray,
} from "../intelligence-audit-signals.service";
// Command to run this test file:
// npx tsx --test apps/api/src/services/__tests__/intelligence-audit-signals.test.ts

describe(
  "Intelligence Audit signal normalization",
  () => {
    it(
      "preserves multiple reasoning signals as separate array items",
      () => {
        const intelligence = {
          signals: {
            reasoningSignals: [
              "Detected Dockerfiles and containerization patterns",
              "Detected background job and queue processing patterns",
              "Detected database schema and migration patterns",
            ],
          },
        };

        const result =
          readAuditReasoningSignals(
            intelligence
          );

        assert.deepEqual(result, [
          "Detected Dockerfiles and containerization patterns",
          "Detected background job and queue processing patterns",
          "Detected database schema and migration patterns",
        ]);
      }
    );

    it(
      "preserves commas inside one logical reasoning signal",
      () => {
        const intelligence = {
          signals: {
            reasoningSignals: [
              "Detected PostgreSQL, Prisma, and migration infrastructure",
              "Detected Docker containerization",
            ],
          },
        };

        const result =
          readAuditReasoningSignals(
            intelligence
          );

        assert.deepEqual(result, [
          "Detected PostgreSQL, Prisma, and migration infrastructure",
          "Detected Docker containerization",
        ]);

        assert.equal(
          result.length,
          2
        );
      }
    );

    it(
      "deduplicates identical reasoning signals while preserving order",
      () => {
        const intelligence = {
          signals: {
            reasoningSignals: [
              "Detected Docker containerization",
              "Detected queue infrastructure",
              "Detected Docker containerization",
              "Detected database infrastructure",
              "Detected queue infrastructure",
            ],
          },
        };

        const result =
          readAuditReasoningSignals(
            intelligence
          );

        assert.deepEqual(result, [
          "Detected Docker containerization",
          "Detected queue infrastructure",
          "Detected database infrastructure",
        ]);
      }
    );

    it(
      "trims signals and removes empty values",
      () => {
        const intelligence = {
          signals: {
            reasoningSignals: [
              "  Detected Docker containerization  ",
              "",
              "   ",
              "Detected queue infrastructure",
            ],
          },
        };

        const result =
          readAuditReasoningSignals(
            intelligence
          );

        assert.deepEqual(result, [
          "Detected Docker containerization",
          "Detected queue infrastructure",
        ]);
      }
    );

    it(
      "returns an empty array when canonical reasoning signals are unavailable",
      () => {
        assert.deepEqual(
          readAuditReasoningSignals({}),
          []
        );

        assert.deepEqual(
          readAuditReasoningSignals(null),
          []
        );
      }
    );

    it(
      "normalizes canonical snapshot string arrays without changing logical values",
      () => {
        const result =
          readAuditStringArray([
            "DEVTOOL_PLATFORM",
            " FINTECH_PLATFORM ",
            "",
            "DEVTOOL_PLATFORM",
          ]);

        assert.deepEqual(result, [
          "DEVTOOL_PLATFORM",
          "FINTECH_PLATFORM",
        ]);
      }
    );
  }
);
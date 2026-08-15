import assert from "node:assert/strict";
import {
  describe,
  test,
} from "node:test";

import {
  __architectureAdvisorTestUtils,
} from "../architecture-advisor.service";

//commans to run this file:
// node `
//   --env-file=packages/database/.env `
//   --import tsx `
//   --test `
//   apps/api/src/services/__tests__/architecture-advisor-evidence-regression.test.ts

/**
 * These regression tests protect a subtle but important Advisor rule:
 *
 * Missing evidence must lower confidence.
 * Missing evidence must NOT manufacture repository risk.
 *
 * This bug previously allowed a fresh repository to receive:
 *
 *   finding risk cap          = 65
 *   missing readiness penalty = 10
 *   missing architecture      =  8
 *                             ----
 *   overall risk              = 83
 *
 * even though Advisor confidence was only around 23%.
 */
describe(
  "Architecture Advisor evidence semantics",
  () => {
    test(
      "missing architecture and production-readiness scores do not create risk",
      () => {
        const risk =
          __architectureAdvisorTestUtils
            .calculateOverallRiskScore(
              [],
              {
                confidenceScore: null,
                maturityScore: null,
                architectureScore: null,
                capabilityScore: null,
                engineeringQualityScore: null,
                productionReadinessScore: null,
              }
            );

        assert.equal(
          risk,
          0,
          "Unknown scores must contribute zero risk instead of the old +18 missing-data penalty."
        );
      }
    );

    test(
      "fresh repository without canonical intelligence is classified as insufficient evidence",
      () => {
        const repository = {
          architectureChanges: [],
          engineeringRecommendations: [],
        } as any;

        const signals = {
          snapshotId: null,
          snapshotCreatedAt: null,

          technologies: [
            "TypeScript",
            "Node.js",
            "Fastify",
          ],

          architectureDomains: [],
          repositoryTypes: [],
          capabilities: [],

          scores: {
            confidenceScore: null,
            maturityScore: null,
            architectureScore: null,
            capabilityScore: null,
            engineeringQualityScore: null,
            productionReadinessScore: null,
          },
        } as any;

        const sufficient =
          __architectureAdvisorTestUtils
            .hasSufficientAdvisorEvidence({
              repository,
              signals,
            });

        assert.equal(
          sufficient,
          false,
          "Technologies alone must not make a fresh repository sufficient for an architecture risk judgement."
        );

        const maturity =
          __architectureAdvisorTestUtils
            .getMaturityLabel(
              signals.scores,
              sufficient
            );

        assert.equal(
          maturity,
          "INSUFFICIENT_EVIDENCE",
          "No evidence must not silently become EMERGING maturity."
        );
      }
    );

    test(
      "insufficient evidence does not manufacture observability or delivery concerns",
      () => {
        const repository = {
          id: "repo-fresh",
          name: "FreshRepository",
          fullName: "example/FreshRepository",
          description: null,
          language: "TypeScript",
          defaultBranch: "main",
          isTracked: true,
          updatedAt: new Date(),

          architectureChanges: [],
          engineeringRecommendations: [],
        } as any;

        const signals = {
          snapshotId: null,
          snapshotCreatedAt: null,

          technologies: [
            "TypeScript",
            "Node.js",
            "Fastify",
          ],

          architectureDomains: [],
          repositoryTypes: [],
          capabilities: [],

          scores: {
            confidenceScore: null,
            maturityScore: null,
            architectureScore: null,
            capabilityScore: null,
            engineeringQualityScore: null,
            productionReadinessScore: null,
          },
        } as any;

        const result =
          __architectureAdvisorTestUtils
            .buildEvidenceAwareFindingBuckets({
              repository,
              signals,
            });

        assert.equal(
          result.evidenceIsSufficient,
          false
        );

        assert.deepEqual(
          result.buckets.observabilityConcerns,
          [],
          "Missing observability evidence must not become a HIGH observability finding."
        );

        assert.deepEqual(
          result.buckets.deliveryConcerns,
          [],
          "Missing CI/CD evidence must not become a delivery concern before evidence is sufficient."
        );

        assert.deepEqual(
          result.buckets.architectureConcerns,
          []
        );

        assert.deepEqual(
          result.buckets.productionRisks,
          []
        );

        assert.deepEqual(
          result.buckets.securityObservations,
          []
        );

        assert.deepEqual(
          result.buckets.scalabilityConcerns,
          []
        );

        assert.deepEqual(
          result.buckets.reliabilityConcerns,
          []
        );

        assert.deepEqual(
          result.buckets.maintainabilityConcerns,
          []
        );

        assert.deepEqual(
          result.buckets.dataConcerns,
          []
        );

        assert.equal(
          Object.values(
            result.buckets
          ).flat().length,
          0,
          "A fresh low-evidence repository must produce no Advisor findings."
        );
      }
    );

    test(
      "known low scores still create real risk when evidence exists",
      () => {
        const risk =
          __architectureAdvisorTestUtils
            .calculateOverallRiskScore(
              [],
              {
                confidenceScore: 80,
                maturityScore: 70,
                architectureScore: 40,
                capabilityScore: 70,
                engineeringQualityScore: 70,
                productionReadinessScore: 50,
              }
            );

        /**
         * Production readiness:
         *   (100 - 50) * 0.20 = 10
         *
         * Architecture:
         *   (100 - 40) * 0.15 = 9
         *
         * Total = 19
         *
         * This proves the fix does NOT remove legitimate score-based risk.
         * It removes only risk caused by missing data.
         */
        assert.equal(
          risk,
          19
        );
      }
    );
  }
);
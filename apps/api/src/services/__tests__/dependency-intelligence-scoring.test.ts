import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calculateCentralityScore,
  calculateImpactScore,
  getImpactLevel,
} from "../dependency-intelligence-scoring";

//Command to run this test file:
// npx tsx --test apps/api/src/services/__tests__/dependency-intelligence-scoring.test.ts

/**
 * Dependency Intelligence scoring regression tests.
 *
 * Future me:
 * These scenarios protect the confidence-aware coverage model from
 * regressing back to raw percentage-only scoring.
 *
 * All non-repository graph inputs are intentionally kept constant.
 * That isolates the effect of repository coverage and sample size.
 */
const sharedGraphInputs = {
  connectedTechnologyCount: 8,
  totalTechnologies: 20,
  architectureDomainCount: 4,
  capabilityCount: 5,
};

const calculateScores = ({
  repositoryCount,
  totalRepositories,
}: {
  repositoryCount: number;
  totalRepositories: number;
}) => {
  const centralityScore =
    calculateCentralityScore({
      repositoryCount,
      totalRepositories,
      ...sharedGraphInputs,
    });

  const impactScore =
    calculateImpactScore({
      repositoryCount,
      totalRepositories,
      ...sharedGraphInputs,
    });

  return {
    centralityScore,
    impactScore,
    impactLevel:
      getImpactLevel(impactScore),
  };
};

describe(
  "Dependency Intelligence small-portfolio scoring",
  () => {
    /**
     * Scenario A
     * Technology appears in all 3 repositories.
     */
    const scenarioA = calculateScores({
      repositoryCount: 3,
      totalRepositories: 3,
    });

    /**
     * Scenario B
     * Technology appears in 3 of 10 repositories.
     */
    const scenarioB = calculateScores({
      repositoryCount: 3,
      totalRepositories: 10,
    });

    /**
     * Scenario C
     * Technology appears in all 10 repositories.
     */
    const scenarioC = calculateScores({
      repositoryCount: 10,
      totalRepositories: 10,
    });

    /**
     * Scenario D
     * Technology appears in only 3 of 100 repositories.
     */
    const scenarioD = calculateScores({
      repositoryCount: 3,
      totalRepositories: 100,
    });

    /**
     * Scenario E
     * Technology appears in 80 of 100 repositories.
     */
    const scenarioE = calculateScores({
      repositoryCount: 80,
      totalRepositories: 100,
    });

    it(
      "keeps scores inside the public 0-100 contract",
      () => {
        const scenarios = [
          scenarioA,
          scenarioB,
          scenarioC,
          scenarioD,
          scenarioE,
        ];

        for (const scenario of scenarios) {
          assert.ok(
            scenario.centralityScore >= 0
          );

          assert.ok(
            scenario.centralityScore <= 100
          );

          assert.ok(
            scenario.impactScore >= 0
          );

          assert.ok(
            scenario.impactScore <= 100
          );
        }
      }
    );

    it(
      "distinguishes 3/3 from 10/10 despite identical observed coverage",
      () => {
        assert.ok(
          scenarioC.centralityScore >
            scenarioA.centralityScore
        );

        assert.ok(
          scenarioC.impactScore >
            scenarioA.impactScore
        );
      }
    );

    it(
      "treats 80/100 as stronger evidence than 3/10",
      () => {
        assert.ok(
          scenarioE.centralityScore >
            scenarioB.centralityScore
        );

        assert.ok(
          scenarioE.impactScore >
            scenarioB.impactScore
        );
      }
    );

    it(
      "treats 3/10 as broader portfolio exposure than 3/100",
      () => {
        assert.ok(
          scenarioB.centralityScore >
            scenarioD.centralityScore
        );

        assert.ok(
          scenarioB.impactScore >
            scenarioD.impactScore
        );
      }
    );

    it(
      "does not collapse 3/3 into a low-exposure result merely because the sample is small",
      () => {
        assert.ok(
          scenarioA.centralityScore >
            scenarioB.centralityScore
        );

        assert.ok(
          scenarioA.impactScore >
            scenarioB.impactScore
        );
      }
    );

    it(
      "remains deterministic for identical inputs",
      () => {
        const first = calculateScores({
          repositoryCount: 3,
          totalRepositories: 3,
        });

        const second = calculateScores({
          repositoryCount: 3,
          totalRepositories: 3,
        });

        assert.deepEqual(
          second,
          first
        );
      }
    );

    it(
      "maps impact tiers from blast-radius score boundaries",
      () => {
        assert.equal(
          getImpactLevel(20),
          "LOW"
        );

        assert.equal(
          getImpactLevel(21),
          "MEDIUM"
        );

        assert.equal(
          getImpactLevel(46),
          "HIGH"
        );

        assert.equal(
          getImpactLevel(71),
          "CRITICAL"
        );
      }
    );

    it(
      "preserves sensible relative ordering across A-E scenarios",
      () => {
        /**
         * We intentionally assert relationships instead of arbitrary exact
         * scores. This allows the model to be calibrated later without
         * weakening the semantic guarantees these tests protect.
         */
        assert.ok(
          scenarioC.impactScore >
            scenarioA.impactScore
        );

        assert.ok(
          scenarioA.impactScore >
            scenarioB.impactScore
        );

        assert.ok(
          scenarioE.impactScore >
            scenarioB.impactScore
        );

        assert.ok(
          scenarioB.impactScore >
            scenarioD.impactScore
        );
      }
    );
  }
);
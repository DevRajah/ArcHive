import assert from "node:assert/strict";
import {
  describe,
  test,
} from "node:test";

import {
  getRiskLevel,
  hasSufficientAdvisorRiskEvidence,
} from "../organization/organization.utils";

// command to run this:
// node `
//   --env-file=packages/database/.env `
//   --import tsx `
//   --test `
//   apps/api/src/services/__tests__/advisor-risk-consumer-semantics.test.ts

describe(
  "Advisor downstream risk semantics",
  () => {
    test(
      "insufficient evidence is not a LOW risk assessment",
      () => {
        const assessable =
          hasSufficientAdvisorRiskEvidence({
            evidenceSufficient: false,
          });

        assert.equal(
          assessable,
          false,
        );
      }
    );

    test(
      "missing or malformed evidence summary is not assessable",
      () => {
        assert.equal(
          hasSufficientAdvisorRiskEvidence(null),
          false,
        );

        assert.equal(
          hasSufficientAdvisorRiskEvidence({}),
          false,
        );

        assert.equal(
          hasSufficientAdvisorRiskEvidence([]),
          false,
        );
      }
    );

    test(
      "sufficient evidence with risk score zero is legitimately LOW risk",
      () => {
        const assessable =
          hasSufficientAdvisorRiskEvidence({
            evidenceSufficient: true,
          });

        assert.equal(
          assessable,
          true,
        );

        assert.equal(
          getRiskLevel(0),
          "LOW",
        );
      }
    );
  }
);
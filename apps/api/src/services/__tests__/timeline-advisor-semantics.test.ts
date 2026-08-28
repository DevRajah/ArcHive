import assert from "node:assert/strict";
import {
  describe,
  test,
} from "node:test";

import {
  hasSufficientAdvisorRiskEvidence,
} from "../organization/organization.utils";


// command to run this:
// node `
//   --env-file=packages/database/.env `
//   --import tsx `
//   --test `
//   apps/api/src/services/__tests__/timeline-advisor-semantics.test.ts
/**
 * Mirrors the Architecture Advisor timeline severity rule.
 *
 * Future me:
 * Timeline severity describes event significance.
 * It must not treat an insufficient-evidence Advisor score as a
 * trustworthy repository risk classification.
 */
const resolveAdvisorTimelineSeverity = ({
  overallRiskScore,
  evidenceSummary,
}: {
  overallRiskScore: number;
  evidenceSummary: unknown;
}) => {
  const evidenceIsSufficient =
    hasSufficientAdvisorRiskEvidence(
      evidenceSummary,
    );

  if (!evidenceIsSufficient) {
    return "INFO";
  }

  if (overallRiskScore >= 80) {
    return "CRITICAL";
  }

  if (overallRiskScore >= 60) {
    return "HIGH";
  }

  if (overallRiskScore >= 30) {
    return "MEDIUM";
  }

  return "LOW";
};

describe(
  "Architecture Advisor timeline semantics",
  () => {
    test(
      "insufficient evidence prevents a high stored score from becoming a high-severity risk event",
      () => {
        const severity =
          resolveAdvisorTimelineSeverity({
            overallRiskScore: 90,
            evidenceSummary: {
              evidenceSufficient: false,
            },
          });

        assert.equal(
          severity,
          "LOW",
        );
      }
    );

    test(
      "sufficient evidence allows a high Advisor risk score to drive timeline severity",
      () => {
        const severity =
          resolveAdvisorTimelineSeverity({
            overallRiskScore: 90,
            evidenceSummary: {
              evidenceSufficient: true,
            },
          });

        assert.equal(
          severity,
          "CRITICAL",
        );
      }
    );

    test(
      "sufficient evidence with zero confirmed risk remains a low-severity Advisor event",
      () => {
        const severity =
          resolveAdvisorTimelineSeverity({
            overallRiskScore: 0,
            evidenceSummary: {
              evidenceSufficient: true,
            },
          });

        assert.equal(
          severity,
          "LOW",
        );
      }
    );
  }
);
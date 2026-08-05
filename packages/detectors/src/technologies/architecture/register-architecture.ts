import type {
  EvidenceContext,
} from "../../evidence";

import type {
  ArchitectureEvaluationResult,
} from "./architecture-score";

/**
 * Adds a confirmed architecture to the official intelligence inventory.
 *
 * Unconfirmed evaluations stay out of repository scores and reports.
 */
export const registerArchitecture = (
  context: EvidenceContext,
  architecture: string,
  result: ArchitectureEvaluationResult,
): void => {
  if (!result.confirmed) {
    return;
  }

  const evidence =
    result.evidence
      .map((signal) => signal.evidence)
      .filter(
        (value): value is string =>
          Boolean(value),
      )
      .join(", ");

  context.addTechnology({
    name: architecture,

    reason:
      `Architecture score ${result.score}/100 from ` +
      `${result.matchedGroups} independent signal groups.`,

    weight: result.score,

    strength: "STRONG",

    source: "FILE_PATH",

    evidence:
      evidence ||
      "Multiple structural architecture signals detected.",

    status: "CONFIRMED",
  });
};
import { includesAny } from "../evidence/evidence-utils";
import { CapabilityContext } from "./types";

export const detectTestingCapability = (context: CapabilityContext) => {
  const {
  evidenceContext,
  addCapability,
} = context;

const {
  combinedText,
} = evidenceContext;

  if (
    includesAny(combinedText, [
      "vitest",
      "jest",
      "playwright",
      "cypress",
      "supertest",
      "mocha",
      "chai",
      ".test.",
      ".spec.",
    ])
  ) {
    addCapability(
      "TESTING",
      82,
      "Repository contains automated testing framework or test file evidence."
    );
  }
};
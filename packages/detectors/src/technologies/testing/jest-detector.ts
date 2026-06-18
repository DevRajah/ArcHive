import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectJestTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "jest",
      "jest.config",
      "@jest",
      "describe(",
      "expect(",
    ])
  ) {
    context.addTechnology(
      "Jest",
      "Detected Jest testing framework.",
      20,
      "STRONG"
    );
  }
};
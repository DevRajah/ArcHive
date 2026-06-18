import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectVitestTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "vitest",
      "vitest.config",
      "vi.fn",
      "vi.mock",
    ])
  ) {
    context.addTechnology(
      "Vitest",
      "Detected Vitest testing framework.",
      20,
      "STRONG"
    );
  }
};
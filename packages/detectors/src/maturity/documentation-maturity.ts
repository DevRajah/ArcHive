import { MaturityInput } from "./maturity-types";
import { buildAssessment, includesAny, textIncludesAny } from "./maturity-utils";

export const assessDocumentationMaturity = (input: MaturityInput) => {
  let score = 15;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (
    input.repositoryTypes.includes("DOCUMENTATION_HEAVY_REPOSITORY") ||
    includesAny(input.technologies, ["Technical Documentation"])
  ) {
    score += 45;
    strengths.push("Strong documentation evidence was detected.");
  } else {
    weaknesses.push("Documentation evidence is limited.");
    recommendations.push("Add setup, architecture, API, and usage documentation.");
  }

  if (
    includesAny(input.architectureDomains, ["KNOWLEDGE_MANAGEMENT"]) ||
    textIncludesAny(input.reasoningSignals, ["documentation", "readme", "guide"])
  ) {
    score += 30;
    strengths.push("Knowledge management or documentation reasoning signals exist.");
  }

  return buildAssessment({
    area: "DOCUMENTATION",
    score,
    strengths,
    weaknesses,
    recommendations,
  });
};
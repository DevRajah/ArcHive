import { MaturityInput } from "./maturity-types";
import { buildAssessment, includesAny } from "./maturity-utils";

export const assessMaintainabilityMaturity = (input: MaturityInput) => {
  let score = 25;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (
    includesAny(input.technologies, [
      "TypeScript",
      "TypeScript Contracts",
      "Clean Architecture",
      "Domain-Driven Design",
      "Hexagonal Architecture",
    ])
  ) {
    score += 35;
    strengths.push("Type safety or maintainable architecture patterns were detected.");
  } else {
    recommendations.push("Improve maintainability through stronger typing, boundaries, or architecture patterns.");
  }

  if (
    includesAny(input.architectureDomains, [
      "TYPE_CONTRACTS",
      "SERVICE_ARCHITECTURE",
      "LIBRARY_ARCHITECTURE",
    ])
  ) {
    score += 25;
    strengths.push("Type contracts, service architecture, or library architecture support maintainability.");
  }

  if (input.repositoryTypes.includes("DOCUMENTATION_HEAVY_REPOSITORY")) {
    score += 15;
    strengths.push("Documentation evidence improves maintainability and onboarding.");
  }

  return buildAssessment({
    area: "MAINTAINABILITY",
    score,
    strengths,
    weaknesses,
    recommendations,
  });
};
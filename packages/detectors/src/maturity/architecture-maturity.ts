import { MaturityInput } from "./maturity-types";
import { buildAssessment, includesAny } from "./maturity-utils";

export const assessArchitectureMaturity = (input: MaturityInput) => {
  let score = 20;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (input.architectureDomains.length >= 5) {
    score += 25;
    strengths.push("Repository shows multiple architecture domains.");
  } else {
    weaknesses.push("Architecture domain coverage is limited.");
    recommendations.push("Document or introduce clearer architectural boundaries.");
  }

  if (
    includesAny(input.technologies, [
      "Clean Architecture",
      "Domain-Driven Design",
      "Hexagonal Architecture",
      "CQRS",
      "Microservices",
      "Event-Driven Architecture",
    ])
  ) {
    score += 35;
    strengths.push("Advanced architecture patterns were detected.");
  } else {
    recommendations.push("Consider documenting architecture style and module boundaries.");
  }

  if (
    includesAny(input.architectureDomains, [
      "SERVICE_ARCHITECTURE",
      "API_LAYER",
      "DATABASE_LAYER",
      "EVENT_DRIVEN_ARCHITECTURE",
      "QUEUE_INFRASTRUCTURE",
    ])
  ) {
    score += 20;
    strengths.push("Core service, API, persistence, or event architecture signals exist.");
  }

  return buildAssessment({
    area: "ARCHITECTURE",
    score,
    strengths,
    weaknesses,
    recommendations,
  });
};
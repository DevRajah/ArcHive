import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectDddTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "domain driven design",
      "domain-driven design",
      "ddd",
      "aggregate root",
      "bounded context",
      "value object",
      "domain service",
      "entity model",
    ])
  ) {
    context.addTechnology(
      "Domain-Driven Design",
      "Detected Domain-Driven Design terminology and architecture patterns.",
      30,
      "STRONG"
    );
  }
};
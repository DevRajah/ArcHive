import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectCqrsTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "cqrs",
      "command handler",
      "query handler",
      "command bus",
      "query bus",
      "read model",
      "write model",
    ])
  ) {
    context.addTechnology(
      "CQRS",
      "Detected Command Query Responsibility Segregation architecture.",
      30,
      "STRONG"
    );
  }
};
import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectCleanArchitectureTechnology: TechnologyDetector = (
  context
) => {
  if (
    hasKeyword(context, [
      "clean architecture",
      "usecase",
      "use case",
      "use-cases",
      "entities/",
      "repositories/",
      "application layer",
      "domain layer",
      "infrastructure layer",
    ])
  ) {
    context.addTechnology(
      "Clean Architecture",
      "Detected clean architecture layering or use-case driven structure.",
      25,
      "STRONG"
    );
  }
};
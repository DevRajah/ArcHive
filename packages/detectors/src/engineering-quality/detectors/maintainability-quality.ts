import { QualityDetector } from "../quality-registry";

const hasTechnology = (
  context: Parameters<QualityDetector>[0],
  values: string[]
) => values.some((value) => context.technologies.includes(value));

export const detectMaintainabilityQuality: QualityDetector = (context) => {
  const { addQuality } = context;

  if (
    hasTechnology(context, [
      "TypeScript Contracts",
      "TypeScript",
      "Clean Architecture",
      "Domain-Driven Design",
      "Hexagonal Architecture",
    ])
  ) {
    addQuality(
      "MAINTAINABILITY",
      30,
      "Repository shows type-safety or maintainable architecture patterns."
    );
  }

  if (
    context.architectureDomains.includes("TYPE_CONTRACTS") ||
    context.architectureDomains.includes("SERVICE_ARCHITECTURE")
  ) {
    addQuality(
      "MAINTAINABILITY",
      25,
      "Repository includes type contracts or service architecture signals that improve maintainability."
    );
  }

  if (context.repositoryDNA.complexityScore >= 50) {
    addQuality(
      "MAINTAINABILITY",
      20,
      "Repository DNA indicates meaningful complexity that benefits from structured engineering practices."
    );
  }

  if (context.repositoryTypes.includes("DOCUMENTATION_HEAVY_REPOSITORY")) {
    addQuality(
      "MAINTAINABILITY",
      20,
      "Documentation-heavy evidence improves maintainability and onboarding."
    );
  }
};
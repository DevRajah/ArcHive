import { QualityDetector } from "../quality-registry";

const hasAny = (items: string[], values: string[]) =>
  values.some((value) => items.includes(value));

export const detectArchitectureQuality: QualityDetector = (context) => {
  const { architectureDomains, technologies, repositoryTypes, addQuality } =
    context;

  if (architectureDomains.length >= 5) {
    addQuality(
      "ARCHITECTURE",
      30,
      "Repository shows multiple architecture domains, suggesting meaningful architectural depth."
    );
  }

  if (
    hasAny(architectureDomains, [
      "SERVICE_ARCHITECTURE",
      "API_LAYER",
      "DATABASE_LAYER",
      "EVENT_DRIVEN_ARCHITECTURE",
      "QUEUE_INFRASTRUCTURE",
    ])
  ) {
    addQuality(
      "ARCHITECTURE",
      25,
      "Repository contains service, API, database, queue, or event-driven architecture signals."
    );
  }

  if (
    hasAny(technologies, [
      "Clean Architecture",
      "Domain-Driven Design",
      "Hexagonal Architecture",
      "CQRS",
      "Microservices",
    ])
  ) {
    addQuality(
      "ARCHITECTURE",
      30,
      "Repository demonstrates advanced architecture patterns such as clean architecture, DDD, CQRS, hexagonal architecture, or microservices."
    );
  }

  if (repositoryTypes.length >= 2) {
    addQuality(
      "ARCHITECTURE",
      15,
      "Repository has more than one coherent engineering identity, showing broader architectural scope."
    );
  }
};
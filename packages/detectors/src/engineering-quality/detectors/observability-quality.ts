import { QualityDetector } from "../quality-registry";

const hasTechnology = (
  context: Parameters<QualityDetector>[0],
  values: string[]
) => values.some((value) => context.technologies.includes(value));

const hasCapability = (context: Parameters<QualityDetector>[0], key: string) =>
  context.capabilities.some((capability) => capability.key === key);

export const detectObservabilityQuality: QualityDetector = (context) => {
  const { addQuality } = context;

  if (hasCapability(context, "OBSERVABILITY")) {
    addQuality(
      "OBSERVABILITY",
      35,
      "Observability capability was detected from monitoring, metrics, tracing, or runtime health signals."
    );
  }

  if (
    hasTechnology(context, [
      "Observability",
      "GitHub Actions",
      "OpenTelemetry",
      "Prometheus",
      "Grafana",
    ])
  ) {
    addQuality(
      "OBSERVABILITY",
      30,
      "Repository includes monitoring, metrics, tracing, or operational visibility technologies."
    );
  }

  if (hasTechnology(context, ["BullMQ", "Kafka", "RabbitMQ"])) {
    addQuality(
      "OBSERVABILITY",
      15,
      "Queue or messaging infrastructure benefits from operational monitoring and job visibility."
    );
  }

  if (context.architectureDomains.includes("OBSERVABILITY_SYSTEMS")) {
    addQuality(
      "OBSERVABILITY",
      20,
      "Architecture domains include observability systems."
    );
  }
};
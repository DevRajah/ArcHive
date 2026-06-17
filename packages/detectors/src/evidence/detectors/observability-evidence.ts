import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectObservabilityEvidence = (context: EvidenceContext) => {
  const { combinedText, addEvidence } = context;

  if (
    includesAny(combinedText, [
      "observability",
      "telemetry",
      "opentelemetry",
      "prometheus",
      "grafana",
      "jaeger",
      "distributed tracing",
    ])
  ) {
    addEvidence(
      "OBSERVABILITY_PLATFORM",
      "Detected observability or telemetry tooling",
      35,
      "DEPENDENCY",
      "STRONG"
    );
  }

  if (
    includesAny(combinedText, [
      "metrics pipeline",
      "system monitoring",
      "queue monitoring",
      "worker health",
      "runtime metrics",
    ])
  ) {
    addEvidence(
      "OBSERVABILITY_PLATFORM",
      "Detected operational monitoring or metrics pipeline evidence",
      30,
      "ARCHITECTURE_PATTERN",
      "STRONG"
    );
  }

  if (
    includesAny(combinedText, ["monitoring", "metrics", "health"]) &&
    includesAny(combinedText, [
      "queue",
      "worker",
      "service",
      "infrastructure",
      "system",
      "runtime",
    ])
  ) {
    addEvidence(
      "OBSERVABILITY_PLATFORM",
      "Detected monitoring terminology connected to infrastructure/runtime systems",
      25,
      "ARCHITECTURE_PATTERN",
      "MEDIUM"
    );
  }
};
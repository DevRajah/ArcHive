import { includesAny } from "../evidence/evidence-utils";
import { CapabilityContext } from "./types";

export const detectObservabilityCapability = (context: CapabilityContext) => {
  const { combinedText, addCapability } = context;

  if (
    includesAny(combinedText, [
      "grafana",
      "prometheus",
      "opentelemetry",
      "otel",
      "metrics",
      "traces",
      "distributed tracing",
      "queue monitoring",
      "worker health",
      "runtime metrics",
    ])
  ) {
    addCapability(
      "OBSERVABILITY",
      88,
      "Repository contains observability, metrics, tracing, or operational monitoring evidence."
    );
  }
};
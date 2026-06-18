import { MaturityInput } from "./maturity-types";
import { buildAssessment, includesAny, textIncludesAny } from "./maturity-utils";

export const assessObservabilityMaturity = (input: MaturityInput) => {
  let score = 15;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (
    includesAny(input.technologies, [
      "Observability",
      "OpenTelemetry",
      "Prometheus",
      "Grafana",
    ]) ||
    input.architectureDomains.includes("OBSERVABILITY_SYSTEMS")
  ) {
    score += 40;
    strengths.push("Monitoring, metrics, tracing, or observability signals were detected.");
  } else {
    weaknesses.push("Observability evidence is weak.");
    recommendations.push("Add metrics, structured logs, tracing, and health visibility.");
  }

  if (includesAny(input.technologies, ["BullMQ", "Kafka", "RabbitMQ"])) {
    score += 20;
    strengths.push("Queue or messaging systems create a strong need for operational visibility.");
  }

  if (textIncludesAny(input.reasoningSignals, ["health", "metrics", "monitoring", "worker"])) {
    score += 25;
    strengths.push("Reasoning signals mention health, metrics, monitoring, or worker visibility.");
  }

  return buildAssessment({
    area: "OBSERVABILITY",
    score,
    strengths,
    weaknesses,
    recommendations,
  });
};
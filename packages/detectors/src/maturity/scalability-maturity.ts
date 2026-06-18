import { MaturityInput } from "./maturity-types";
import { buildAssessment, includesAny } from "./maturity-utils";

export const assessScalabilityMaturity = (input: MaturityInput) => {
  let score = 20;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (includesAny(input.technologies, ["BullMQ", "Kafka", "RabbitMQ"])) {
    score += 30;
    strengths.push("Queue or messaging infrastructure supports async scaling.");
  } else {
    recommendations.push("Add queue or worker infrastructure for long-running workloads.");
  }

  if (includesAny(input.technologies, ["Redis", "Kubernetes", "Microservices"])) {
    score += 30;
    strengths.push("Caching, orchestration, or distributed architecture signals were detected.");
  } else {
    weaknesses.push("Caching or orchestration evidence is weak.");
  }

  if (includesAny(input.architectureDomains, ["REALTIME_SYSTEMS", "CACHE_INFRASTRUCTURE"])) {
    score += 20;
    strengths.push("Realtime or cache infrastructure improves responsiveness and scalability.");
  }

  return buildAssessment({
    area: "SCALABILITY",
    score,
    strengths,
    weaknesses,
    recommendations,
  });
};
import { QualityDetector } from "../quality-registry";

const hasCapability = (context: Parameters<QualityDetector>[0], key: string) =>
  context.capabilities.some((capability) => capability.key === key);

const hasTechnology = (
  context: Parameters<QualityDetector>[0],
  values: string[]
) => values.some((value) => context.technologies.includes(value));

export const detectScalabilityQuality: QualityDetector = (context) => {
  const { addQuality } = context;

  if (hasCapability(context, "QUEUE_INFRASTRUCTURE")) {
    addQuality(
      "SCALABILITY",
      30,
      "Queue infrastructure indicates asynchronous processing and better workload isolation."
    );
  }

  if (hasCapability(context, "CACHE_INFRASTRUCTURE")) {
    addQuality(
      "SCALABILITY",
      25,
      "Caching infrastructure improves performance and reduces repeated expensive work."
    );
  }

  if (hasCapability(context, "REALTIME_SYSTEMS")) {
    addQuality(
      "SCALABILITY",
      20,
      "Realtime infrastructure shows support for live system updates and event-driven user feedback."
    );
  }

  if (
    hasTechnology(context, [
      "Kafka",
      "RabbitMQ",
      "BullMQ",
      "Redis",
      "Kubernetes",
      "Microservices",
    ])
  ) {
    addQuality(
      "SCALABILITY",
      25,
      "Detected scalable infrastructure technologies such as queues, cache, Kubernetes, or messaging systems."
    );
  }
};
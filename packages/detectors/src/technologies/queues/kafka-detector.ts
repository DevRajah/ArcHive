import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectKafkaTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "kafka",
      "kafkajs",
      "consumer group",
      "topic producer",
    ])
  ) {
    context.addTechnology(
      "Kafka",
      "Detected Kafka event streaming infrastructure.",
      25,
      "STRONG"
    );
  }
};
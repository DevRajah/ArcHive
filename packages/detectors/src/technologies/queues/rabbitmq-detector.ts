import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectRabbitMqTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "rabbitmq",
      "amqplib",
      "amqp://",
      "message broker",
    ])
  ) {
    context.addTechnology(
      "RabbitMQ",
      "Detected RabbitMQ message broker infrastructure.",
      25,
      "STRONG"
    );
  }
};
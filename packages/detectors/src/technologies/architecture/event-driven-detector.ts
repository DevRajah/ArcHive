import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectEventDrivenTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "event driven",
      "event-driven",
      "event bus",
      "domain event",
      "event handler",
      "event sourcing",
      "publish event",
      "consume event",
      "message broker",
    ])
  ) {
    context.addTechnology(
      "Event-Driven Architecture",
      "Detected event-driven architecture or domain event patterns.",
      30,
      "STRONG"
    );
  }
};
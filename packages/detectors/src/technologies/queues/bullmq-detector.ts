import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectBullMqTechnology: TechnologyDetector = (context) => {
  if (hasKeyword(context, ["bullmq", "queueevents", "worker(", "queue("])) {
    context.addTechnology(
      "BullMQ",
      "Detected BullMQ queue and worker infrastructure.",
      25,
      "STRONG"
    );
  }
};
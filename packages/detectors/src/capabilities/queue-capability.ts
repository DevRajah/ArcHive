import { includesAny } from "../evidence/evidence-utils";
import { CapabilityContext } from "./types";

export const detectQueueCapability = (context: CapabilityContext) => {
  const { combinedText, addCapability } = context;

  if (
    includesAny(combinedText, [
      "bullmq",
      "bull queue",
      "queue worker",
      "job processing",
      "background processing",
      "dead letter",
      "retry job",
    ])
  ) {
    addCapability(
      "QUEUE_INFRASTRUCTURE",
      95,
      "Repository demonstrates queue-backed asynchronous job processing."
    );
  }
};
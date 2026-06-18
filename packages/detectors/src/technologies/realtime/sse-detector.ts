import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectSseTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "eventsource",
      "text/event-stream",
      "server-sent events",
      "sse",
      "event stream",
    ])
  ) {
    context.addTechnology(
      "Server-Sent Events",
      "Detected Server-Sent Events realtime streaming.",
      20,
      "MEDIUM"
    );
  }
};
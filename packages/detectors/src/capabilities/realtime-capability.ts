import { includesAny } from "../evidence/evidence-utils";
import { CapabilityContext } from "./types";

export const detectRealtimeCapability = (context: CapabilityContext) => {
  const { combinedText, addCapability } = context;

  if (
    includesAny(combinedText, [
      "socket.io",
      "websocket",
      "server-sent events",
      "sse",
      "event stream",
      "live updates",
      "pubsub",
    ])
  ) {
    addCapability(
      "REALTIME_SYSTEMS",
      92,
      "Repository supports realtime communication or live event updates."
    );
  }
};
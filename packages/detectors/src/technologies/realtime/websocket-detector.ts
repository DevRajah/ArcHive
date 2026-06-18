import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectWebSocketTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "websocket",
      "ws://",
      "wss://",
      "new websocket",
      "websocketserver",
      "ws.on",
    ])
  ) {
    context.addTechnology(
      "WebSocket",
      "Detected native WebSocket infrastructure.",
      25,
      "STRONG"
    );
  }
};
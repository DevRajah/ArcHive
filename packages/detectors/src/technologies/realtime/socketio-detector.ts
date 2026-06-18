import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectSocketIoTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "socket.io",
      "socketio",
      "io.on",
      "io.emit",
      "socket.emit",
      "socket.on",
      "new Server(",
    ])
  ) {
    context.addTechnology(
      "Socket.IO",
      "Detected Socket.IO realtime communication.",
      25,
      "STRONG"
    );
  }
};
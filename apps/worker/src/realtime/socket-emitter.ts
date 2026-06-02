import { io } from "socket.io-client";

const realtimeServerUrl = process.env.REALTIME_SERVER_URL || "http://localhost:6800";

export const socket = io(realtimeServerUrl, {
  transports: ["websocket"],
  reconnection: true,
});

export const emitRealtimeEvent = (eventName: string, payload: unknown) => {
  if (!socket.connected) {
    console.log(`Socket not connected yet. Skipping emit: ${eventName}`);
    return;
  }

  socket.emit(eventName, payload);
};
import { io } from "socket.io-client";

const realtimeServerUrl =
  process.env.REALTIME_SERVER_URL || "http://localhost:6800";

export const socket = io(realtimeServerUrl, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log(`Worker connected to realtime server: ${socket.id}`);
});

socket.on("connect_error", (error) => {
  console.error("Worker realtime connection error:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log(`Worker disconnected from realtime server: ${reason}`);
});

export const emitRealtimeEvent = (eventName: string, payload: unknown) => {
  if (!socket.connected) {
    console.log(`Socket not connected yet. Skipping emit: ${eventName}`);
    return;
  }

  socket.emit(eventName, payload);
};
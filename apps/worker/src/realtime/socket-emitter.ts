import {
  io,
} from "socket.io-client";

/**
 * Resolve the realtime API address.
 *
 * Normal separated deployment:
 * REALTIME_SERVER_URL points to the public API service.
 *
 * Free closed-beta deployment:
 * API and Worker run inside the same Render container. The worker can talk
 * directly to the API through localhost using Render's injected PORT.
 */
const getRealtimeServerUrl =
  () => {
    if (
      process.env.RUN_WORKERS_IN_API ===
      "true"
    ) {
      const port =
        process.env.PORT ||
        "6800";

      return `http://127.0.0.1:${port}`;
    }

    return (
      process.env.REALTIME_SERVER_URL ||
      "http://localhost:6800"
    );
  };

const realtimeServerUrl =
  getRealtimeServerUrl();

export const socket =
  io(
    realtimeServerUrl,
    {
      transports: [
        "websocket",
        "polling",
      ],

      reconnection:
        true,

      reconnectionAttempts:
        Infinity,

      reconnectionDelay:
        1000,
    },
  );

socket.on(
  "connect",
  () => {
    console.log(
      `Worker connected to realtime server: ${socket.id}`,
    );
  },
);

socket.on(
  "connect_error",
  (
    error,
  ) => {
    console.error(
      "Worker realtime connection error:",
      error.message,
    );
  },
);

socket.on(
  "disconnect",
  (
    reason,
  ) => {
    console.log(
      `Worker disconnected from realtime server: ${reason}`,
    );
  },
);

export const emitRealtimeEvent =
  (
    eventName: string,
    payload: unknown,
  ) => {
    if (
      !socket.connected
    ) {
      console.log(
        `Socket not connected yet. Skipping emit: ${eventName}`,
      );

      return;
    }

    socket.emit(
      eventName,
      payload,
    );
  };
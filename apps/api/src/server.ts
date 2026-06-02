import "dotenv/config";
import { Server } from "socket.io";
import { buildApp } from "./app";

const PORT = Number(process.env.PORT) || 6800;
const HOST = process.env.HOST || "0.0.0.0";

const startServer = async () => {
  try {
    const app = await buildApp();

    await app.listen({
      port: PORT,
      host: HOST,
    });

    const io = new Server(app.server, {
      cors: {
        origin: true,
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on("engineering-event:processed", (payload) => {
        io.emit("engineering-event:processed", payload);
      });

      socket.on("architecture-change:detected", (payload) => {
        io.emit("architecture-change:detected", payload);
      });

      socket.on("queue-job:completed", (payload) => {
        io.emit("queue-job:completed", payload);
      });

      socket.on("repository:updated", (payload) => {
        io.emit("repository:updated", payload);
      });

      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });

    console.log(`ArcHive API running on http://${HOST}:${PORT}`);
    console.log("ArcHive realtime server is ready");
  } catch (error) {
    console.error("Failed to start ArcHive API:", error);
    process.exit(1);
  }
};

startServer();
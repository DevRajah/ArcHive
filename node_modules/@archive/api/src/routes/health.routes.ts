import { FastifyInstance } from "fastify";

// This route lets me quickly confirm that the API is alive before adding database,
// queues, GitHub webhooks, and other serious platform features.
export const healthRoutes = async (app: FastifyInstance) => {
  app.get("/", async () => {
    return {
      success: true,
      message: "ArcHive API is healthy",
      data: {
        service: "archive-api",
        status: "ONLINE",
        timestamp: new Date().toISOString(),
      },
    };
  });
};
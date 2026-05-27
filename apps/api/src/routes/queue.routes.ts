import { FastifyInstance } from "fastify";
import { engineeringEventQueue } from "@archive/queue";

export const queueRoutes = async (app: FastifyInstance) => {
  app.get("/metrics", async () => {
    // I expose queue counts so I can quickly see whether jobs are waiting, running, completed, or failing.
    const counts = await engineeringEventQueue.getJobCounts(
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed"
    );

    return {
      success: true,
      message: "Queue metrics fetched successfully",
      data: {
        queueName: "engineering-event-processing",
        counts,
      },
    };
  });
};
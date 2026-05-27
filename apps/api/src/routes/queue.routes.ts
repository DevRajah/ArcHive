import { FastifyInstance } from "fastify";
import { engineeringEventQueue } from "@archive/queue";

export const queueRoutes = async (app: FastifyInstance) => {
  app.get("/metrics", async () => {
    // I expose queue counts so I can quickly inspect the background processing state during development.
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

  app.get("/recent-jobs", async () => {
    const jobs = await engineeringEventQueue.getJobs(
      ["waiting", "active", "completed", "failed", "delayed"],
      0,
      20,
      true
    );

    return {
      success: true,
      message: "Recent queue jobs fetched successfully",
      data: jobs.map((job) => ({
        id: job.id,
        name: job.name,
        data: job.data,
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
      })),
    };
  });
};
import { FastifyInstance } from "fastify";
import { prisma } from "@archive/database";
import { engineeringEventQueue } from "@archive/queue";

export const dashboardRoutes = async (app: FastifyInstance) => {
  app.get("/summary", async () => {
    const [
      repositoryCount,
      engineeringEventCount,
      timelineEntryCount,
      architectureChangeCount,
      queueCounts,
    ] = await Promise.all([
      prisma.repository.count(),
      prisma.engineeringEvent.count(),
      prisma.timelineEntry.count(),
      prisma.architectureChange.count(),
      engineeringEventQueue.getJobCounts("waiting", "active", "completed", "failed", "delayed"),
    ]);

    return {
      success: true,
      message: "Dashboard summary fetched successfully",
      data: {
        repositories: repositoryCount,
        engineeringEvents: engineeringEventCount,
        timelineEntries: timelineEntryCount,
        architectureChanges: architectureChangeCount,
        queue: queueCounts,
      },
    };
  });
};
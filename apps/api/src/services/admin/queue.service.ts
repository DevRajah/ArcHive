import { engineeringEventQueue } from "@archive/queue";

export const adminQueueService = {
  async getQueueOverview() {
    const counts = await engineeringEventQueue.getJobCounts(
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed",
      "paused"
    );

    const failedJobs = await engineeringEventQueue.getJobs(["failed"], 0, 5, true);

    return {
      counts,
      recentFailures: failedJobs.map((job) => ({
        id: job.id,
        name: job.name,
        failedReason: job.failedReason,
        attemptsMade: job.attemptsMade,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
      })),
    };
  },
};
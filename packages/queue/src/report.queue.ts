import { Queue } from "bullmq";
import { redisConnection } from "./redis";

/**
 * Data carried by every Executive Report generation job.
 */
export interface GenerateExecutiveReportJob {
  reportId: string;
  userId: string;
}

/**
 * Shared queue name.
 *
 * Future me:
 * The API and worker must use this exact same queue name.
 */
export const EXECUTIVE_REPORT_QUEUE_NAME =
  "executive-report-generation";

/**
 * The API uses this queue to send report-generation jobs
 * to the dedicated ArcHive worker application.
 */
export const executiveReportQueue =
  new Queue<GenerateExecutiveReportJob>(
    EXECUTIVE_REPORT_QUEUE_NAME,
    {
      connection: redisConnection as any,

      defaultJobOptions: {
        attempts: 3,

        backoff: {
          type: "exponential",
          delay: 5_000,
        },

        removeOnComplete: 100,
        removeOnFail: 100,
      },
    },
  );
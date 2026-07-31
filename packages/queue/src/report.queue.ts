import { Queue } from "bullmq";
import IORedis from "ioredis";

/**
 * Shared Redis connection for the Executive Report queue.
 *
 * We create it here because the queue package currently keeps
 * its Redis connection inside index.ts, and importing it from
 * there would create a circular dependency.
 */
const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6381,
  maxRetriesPerRequest: null,
});

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
 * The API and worker must use this exact same name.
 */
export const EXECUTIVE_REPORT_QUEUE_NAME =
  "executive-report-generation";

/**
 * Queue responsible for generating Executive Reports.
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
          delay: 5000,
        },

        removeOnComplete: 100,
        removeOnFail: 100,
      },
    }
  );
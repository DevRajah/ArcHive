import {
  Queue,
} from "bullmq";

import type {
  ReportSource,
} from "@archive/types";

import {
  createQueueRedisConnection,
} from "./redis";

/**
 * Executive Report queue producer connection.
 *
 * Redis configuration is shared with the rest of the queue package so local
 * development and production cannot silently use different Redis instances.
 */
const reportQueueConnection =
  createQueueRedisConnection();

/**
 * Data carried by every Executive Report generation job.
 */
export interface GenerateExecutiveReportJob {
  reportId: string;
  source: ReportSource;
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
      connection:
        reportQueueConnection as any,

      defaultJobOptions: {
        attempts: 3,

        backoff: {
          type: "exponential",
          delay: 5000,
        },

        removeOnComplete: 100,
        removeOnFail: 100,
      },
    },
  );
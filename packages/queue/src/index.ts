import {
  Queue,
} from "bullmq";

import {
  createQueueRedisConnection,
  redisConnection,
} from "./redis";

/**
 * Re-export the worker-safe Redis connection.
 *
 * The worker package already imports this from @archive/queue.
 */
export {
  redisConnection,
} from "./redis";

export type ProcessEngineeringEventJob = {
  eventId: string;
  repositoryId: string;
};

/**
 * Queue producers get their own producer-safe Redis connection.
 *
 * Future me:
 * Do not use the worker connection here. Queue producers are often called
 * from HTTP requests and should fail reasonably quickly if Redis is down.
 */
const engineeringEventQueueConnection =
  createQueueRedisConnection();

export const engineeringEventQueue =
  new Queue<ProcessEngineeringEventJob>(
    "engineering-event-processing",
    {
      connection:
        engineeringEventQueueConnection as any,
    },
  );

/**
 * Reprocessing uses the same canonical Redis configuration.
 *
 * This removes the old 6379 vs 6381 inconsistency.
 */
const repositoryReprocessQueueConnection =
  createQueueRedisConnection();

export const repositoryReprocessQueue =
  new Queue(
    "repository-reprocess",
    {
      connection:
        repositoryReprocessQueueConnection as any,
    },
  );

export {
  EXECUTIVE_REPORT_QUEUE_NAME,
  executiveReportQueue,
} from "./report.queue";

export type {
  GenerateExecutiveReportJob,
} from "./report.queue";
import { Queue } from "bullmq";
import IORedis from "ioredis";

export const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6381,
  maxRetriesPerRequest: null,
});

export type ProcessEngineeringEventJob = {
  eventId: string;
  repositoryId: string;
};

// I keep the queue name in one shared place so the API and worker never accidentally use different queues.
export const engineeringEventQueue = new Queue<ProcessEngineeringEventJob>(
  "engineering-event-processing",
  {
    connection: redisConnection,
  }
);
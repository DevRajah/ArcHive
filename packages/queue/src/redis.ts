import IORedis from "ioredis";

/**
 * Redis can be configured in one of two ways:
 *
 * 1. Production:
 *    A complete REDIS_URL, usually supplied by Railway.
 *
 * 2. Local development:
 *    REDIS_HOST + REDIS_PORT.
 *
 * The "type" field is deliberate. It gives TypeScript a reliable
 * discriminant so url/host/port cannot become possibly undefined.
 */
type RedisTarget =
  | {
      type: "url";
      url: string;
    }
  | {
      type: "host";
      host: string;
      port: number;
    };

/**
 * Resolve the Redis target from environment variables.
 *
 * Future me:
 * Prefer REDIS_URL whenever it exists because production providers usually
 * include authentication and connection details inside that URL.
 *
 * If REDIS_URL is absent, fall back to the existing local host/port setup.
 */
const getRedisTarget = (): RedisTarget => {
  const redisUrl =
    process.env.REDIS_URL?.trim();

  if (redisUrl) {
    return {
      type: "url",
      url: redisUrl,
    };
  }

  return {
    type: "host",

    host:
      process.env.REDIS_HOST ||
      "localhost",

    port:
      Number(
        process.env.REDIS_PORT,
      ) || 6381,
  };
};

/**
 * Create a Redis connection for API-side queue producers.
 *
 * API requests should not wait forever when Redis is unavailable.
 * A small retry limit lets the failure surface back to the application
 * instead of leaving the request hanging indefinitely.
 */
export const createQueueRedisConnection =
  () => {
    const target =
      getRedisTarget();

    if (target.type === "url") {
      return new IORedis(
        target.url,
        {
          maxRetriesPerRequest: 1,
        },
      );
    }

    return new IORedis({
      host: target.host,
      port: target.port,
      maxRetriesPerRequest: 1,
    });
  };

/**
 * Create a Redis connection for BullMQ workers.
 *
 * BullMQ workers use maxRetriesPerRequest: null so temporary Redis outages
 * do not permanently kill long-running workers.
 */
export const createWorkerRedisConnection =
  () => {
    const target =
      getRedisTarget();

    if (target.type === "url") {
      return new IORedis(
        target.url,
        {
          maxRetriesPerRequest: null,
        },
      );
    }

    return new IORedis({
      host: target.host,
      port: target.port,
      maxRetriesPerRequest: null,
    });
  };

/**
 * Shared worker-safe connection.
 *
 * Existing worker code imports redisConnection from @archive/queue, so we
 * preserve that public API instead of forcing deployment-related changes
 * throughout the worker codebase.
 */
export const redisConnection =
  createWorkerRedisConnection();
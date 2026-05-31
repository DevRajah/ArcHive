import { EngineeringEventType } from "@prisma/client";

type PushClassifierInput = {
  filesChanged: string[];
  commitMessages: string[];
  history: {
    hasQueueHistory: boolean;
    hasRedisHistory: boolean;
    hasDockerHistory: boolean;
    hasDatabaseHistory: boolean;
  };
};

export const classifyGitHubPushEvent = ({
  filesChanged,
  commitMessages,
  history,
}: PushClassifierInput): EngineeringEventType => {
  const combined = `${filesChanged.join(" ")} ${commitMessages.join(" ")}`.toLowerCase();

  const hasQueueSignal =
    combined.includes("queue") ||
    combined.includes("bullmq") ||
    combined.includes("worker");

  const hasRedisSignal =
    combined.includes("redis") ||
    combined.includes("ioredis") ||
    combined.includes("cache");

  const hasDockerSignal =
    combined.includes("docker") ||
    combined.includes("docker-compose");

  const hasDatabaseSignal =
    combined.includes("schema.prisma") ||
    combined.includes("migration") ||
    combined.includes("database");

  const hasApiSignal =
    combined.includes("route") ||
    combined.includes("controller") ||
    combined.includes("service");

  const hasAuthSignal =
    combined.includes("auth") ||
    combined.includes("jwt") ||
    combined.includes("oauth") ||
    combined.includes("security");

  const hasDependencySignal =
    combined.includes("package.json") ||
    combined.includes("package-lock.json");

  const hasFrontendSignal =
    combined.includes(".tsx") ||
    combined.includes(".jsx") ||
    combined.includes("components") ||
    combined.includes("apps/web");

  // I check queue before API/frontend because queue files often live inside routes/components too.
  if (hasQueueSignal) {
    return history.hasQueueHistory
      ? EngineeringEventType.QUEUE_INFRASTRUCTURE_UPDATED
      : EngineeringEventType.QUEUE_ADDED;
  }

  if (hasRedisSignal) {
    return history.hasRedisHistory
      ? EngineeringEventType.REDIS_INFRASTRUCTURE_UPDATED
      : EngineeringEventType.REDIS_INFRASTRUCTURE_ADDED;
  }

  if (hasDockerSignal) {
    return history.hasDockerHistory
      ? EngineeringEventType.DOCKER_INFRASTRUCTURE_UPDATED
      : EngineeringEventType.DOCKER_INFRASTRUCTURE_CHANGED;
  }

  if (hasDatabaseSignal) {
    return history.hasDatabaseHistory
      ? EngineeringEventType.DATABASE_SCHEMA_UPDATED
      : EngineeringEventType.DATABASE_SCHEMA_CHANGED;
  }

  if (hasAuthSignal) {
    return EngineeringEventType.AUTH_SYSTEM_CHANGED;
  }

  if (hasApiSignal) {
    return EngineeringEventType.API_ENDPOINT_CHANGED;
  }

  if (hasDependencySignal) {
    return EngineeringEventType.DEPENDENCY_CHANGED;
  }

  if (hasFrontendSignal) {
    return EngineeringEventType.FRONTEND_UI_CHANGED;
  }

  return EngineeringEventType.ENGINEERING_EVENT;
};
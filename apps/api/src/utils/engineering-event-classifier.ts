type RawPayload = Record<string, any>;

type RepositoryArchitectureHistory = {
  hasQueueHistory?: boolean;
  hasRedisHistory?: boolean;
  hasDockerHistory?: boolean;
  hasDatabaseHistory?: boolean;
};

type ClassifiedEngineeringEvent = {
  eventType: string;
  title: string;
  summary: string;
};

const humanRepository = (name: string) => name || "This repository";

const getPayloadText = (rawPayload?: RawPayload) => {
  if (!rawPayload) return "";

  const commitMessages = Array.isArray(rawPayload.commitMessages)
    ? rawPayload.commitMessages.join(" ")
    : "";

  const filesChanged = Array.isArray(rawPayload.filesChanged)
    ? rawPayload.filesChanged.join(" ")
    : "";

  const commits = Array.isArray(rawPayload.commits)
    ? rawPayload.commits
        .map((commit: any) => {
          const added = Array.isArray(commit.added) ? commit.added.join(" ") : "";
          const modified = Array.isArray(commit.modified)
            ? commit.modified.join(" ")
            : "";
          const removed = Array.isArray(commit.removed)
            ? commit.removed.join(" ")
            : "";

          return `${commit.message || ""} ${added} ${modified} ${removed}`;
        })
        .join(" ")
    : "";

  return `${commitMessages} ${filesChanged} ${commits}`.toLowerCase();
};

export const classifyEngineeringEventForDashboard = ({
  rawEventType,
  rawPayload,
  repositoryName,
  history,
}: {
  rawEventType?: string | null;
  rawPayload?: RawPayload;
  repositoryName: string;
  history?: RepositoryArchitectureHistory;
}): ClassifiedEngineeringEvent => {
  const repo = humanRepository(repositoryName);
  const payloadText = getPayloadText(rawPayload);

  const safeRawType =
    typeof rawEventType === "string" && rawEventType.trim().length > 0
      ? rawEventType
      : "ENGINEERING_EVENT";

  const hasQueueSignal =
    safeRawType === "QUEUE_ADDED" ||
    payloadText.includes("bullmq") ||
    payloadText.includes("queue") ||
    payloadText.includes("worker");

  const hasRedisSignal =
    safeRawType === "REDIS_ADDED" ||
    payloadText.includes("redis") ||
    payloadText.includes("ioredis") ||
    payloadText.includes("cache");

  const hasDockerSignal =
    safeRawType === "DOCKER_ADDED" ||
    payloadText.includes("docker") ||
    payloadText.includes("docker-compose");

  const hasDatabaseSignal =
    safeRawType === "DATABASE_CHANGE" ||
    payloadText.includes("schema.prisma") ||
    payloadText.includes("migration") ||
    payloadText.includes("database");

  // I use repository history here so ArcHive can tell the difference between
  // introducing infrastructure for the first time and modifying something that already exists.
  if (hasQueueSignal) {
    if (history?.hasQueueHistory) {
      return {
        eventType: "QUEUE_INFRASTRUCTURE_UPDATED",
        title: "Queue Processing Updated",
        summary: `${repo} updated queue-based background processing or job infrastructure.`,
      };
    }

    return {
      eventType: "QUEUE_ADDED",
      title: "Queue Infrastructure Added",
      summary: `${repo} introduced queue-based background processing.`,
    };
  }

  if (hasRedisSignal) {
    if (history?.hasRedisHistory) {
      return {
        eventType: "REDIS_INFRASTRUCTURE_UPDATED",
        title: "Redis Infrastructure Updated",
        summary: `${repo} updated Redis-related infrastructure for caching, queues, or realtime workflows.`,
      };
    }

    return {
      eventType: "REDIS_INFRASTRUCTURE_ADDED",
      title: "Redis Infrastructure Added",
      summary: `${repo} introduced Redis infrastructure for caching, queues, or realtime workflows.`,
    };
  }

  if (hasDockerSignal) {
    if (history?.hasDockerHistory) {
      return {
        eventType: "DOCKER_INFRASTRUCTURE_UPDATED",
        title: "Docker Infrastructure Updated",
        summary: `${repo} updated Docker or container infrastructure.`,
      };
    }

    return {
      eventType: "DOCKER_INFRASTRUCTURE_CHANGED",
      title: "Docker Infrastructure Added",
      summary: `${repo} introduced Docker or container infrastructure.`,
    };
  }

  if (hasDatabaseSignal) {
    if (history?.hasDatabaseHistory) {
      return {
        eventType: "DATABASE_SCHEMA_UPDATED",
        title: "Database Schema Updated",
        summary: `${repo} updated its database schema or persistence layer.`,
      };
    }

    return {
      eventType: "DATABASE_SCHEMA_CHANGED",
      title: "Database Schema Changed",
      summary: `${repo} introduced a database or persistence-layer change.`,
    };
  }

  if (
    payloadText.includes("route") ||
    payloadText.includes("controller") ||
    payloadText.includes("service")
  ) {
    return {
      eventType: "API_ENDPOINT_CHANGED",
      title: "API Layer Changed",
      summary: `${repo} updated API routes, controllers, or service logic.`,
    };
  }

  if (
    payloadText.includes("auth") ||
    payloadText.includes("jwt") ||
    payloadText.includes("oauth") ||
    payloadText.includes("security")
  ) {
    return {
      eventType: "AUTH_SYSTEM_CHANGED",
      title: "Auth System Changed",
      summary: `${repo} updated authentication or security-related logic.`,
    };
  }

  if (
    payloadText.includes("package.json") ||
    payloadText.includes("package-lock.json")
  ) {
    return {
      eventType: "DEPENDENCY_CHANGED",
      title: "Dependencies Changed",
      summary: `${repo} updated project dependencies.`,
    };
  }

  if (
    payloadText.includes(".tsx") ||
    payloadText.includes(".jsx") ||
    payloadText.includes("components") ||
    payloadText.includes("app/")
  ) {
    return {
      eventType: "FRONTEND_UI_CHANGED",
      title: "Frontend UI Changed",
      summary: `${repo} updated frontend UI or application components.`,
    };
  }

  if (safeRawType === "PR_MERGED") {
    return {
      eventType: "PR_MERGED",
      title: "Pull Request Merged",
      summary: `${repo} merged a pull request into the codebase.`,
    };
  }

  if (safeRawType === "PULL_REQUEST") {
    return {
      eventType: "PULL_REQUEST",
      title: "Pull Request Activity",
      summary: `${repo} recorded pull request activity.`,
    };
  }

  return {
    eventType: "ENGINEERING_EVENT",
    title: "Engineering Activity Recorded",
    summary:
      "ArcHive detected repository activity that could not yet be mapped to a known architecture category.",
  };
};
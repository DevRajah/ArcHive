type RawPayload = Record<string, any>;

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
          const modified = Array.isArray(commit.modified) ? commit.modified.join(" ") : "";
          const removed = Array.isArray(commit.removed) ? commit.removed.join(" ") : "";
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
}: {
  rawEventType?: string | null;
  rawPayload?: RawPayload;
  repositoryName: string;
}): ClassifiedEngineeringEvent => {
  const repo = humanRepository(repositoryName);
  const payloadText = getPayloadText(rawPayload);
  const safeRawType =
    typeof rawEventType === "string" && rawEventType.trim().length > 0
      ? rawEventType
      : "ENGINEERING_EVENT";

  // I avoid exposing UNKNOWN because it makes ArcHive feel like a raw log viewer instead of an intelligence layer.
  if (safeRawType !== "UNKNOWN" && safeRawType !== "ENGINEERING_EVENT") {
    const known: Record<string, ClassifiedEngineeringEvent> = {
      QUEUE_ADDED: {
        eventType: "QUEUE_ADDED",
        title: "Queue Added",
        summary: `${repo} introduced queue-based background processing.`,
      },
      REDIS_ADDED: {
        eventType: "REDIS_INFRASTRUCTURE_ADDED",
        title: "Redis Infrastructure Added",
        summary: `${repo} added Redis infrastructure for caching, queues, or realtime workflows.`,
      },
      DOCKER_ADDED: {
        eventType: "DOCKER_INFRASTRUCTURE_CHANGED",
        title: "Docker Infrastructure Changed",
        summary: `${repo} updated Docker or container infrastructure.`,
      },
      DATABASE_CHANGE: {
        eventType: "DATABASE_SCHEMA_CHANGED",
        title: "Database Schema Changed",
        summary: `${repo} recorded a database or persistence-layer change.`,
      },
      PR_MERGED: {
        eventType: "PR_MERGED",
        title: "Pull Request Merged",
        summary: `${repo} merged a pull request into the codebase.`,
      },
      PULL_REQUEST: {
        eventType: "PULL_REQUEST",
        title: "Repository pull request activity detected",
        summary: `${repo} recorded pull request activity.`,
      },
      PUSH: {
        eventType: "COMMIT_PUSHED",
        title: "Code Pushed",
        summary: `${repo} received new code changes from GitHub.`,
      },
    };

    if (known[safeRawType]) return known[safeRawType];
  }

  // I infer better labels from changed files and commit messages when the stored event type is UNKNOWN.
  if (payloadText.includes("bullmq") || payloadText.includes("queue")) {
    return {
      eventType: "QUEUE_ADDED",
      title: "Queue processing layer added",
      summary: `${repo} introduced or updated queue-based processing.`,
    };
  }

  if (payloadText.includes("worker")) {
    return {
      eventType: "WORKER_INFRASTRUCTURE_CHANGED",
      title: "Worker Infrastructure Changed",
      summary: `${repo} updated background worker infrastructure.`,
    };
  }

  if (payloadText.includes("redis") || payloadText.includes("ioredis") || payloadText.includes("cache")) {
    return {
      eventType: "REDIS_INFRASTRUCTURE_ADDED",
      title: "Redis Infrastructure Added",
      summary: `${repo} added or updated Redis-related infrastructure.`,
    };
  }

  if (payloadText.includes("schema.prisma") || payloadText.includes("migration") || payloadText.includes("database")) {
    return {
      eventType: "DATABASE_SCHEMA_CHANGED",
      title: "Database Schema Changed",
      summary: `${repo} changed its database schema or persistence layer.`,
    };
  }

  if (payloadText.includes("docker") || payloadText.includes("docker-compose")) {
    return {
      eventType: "DOCKER_INFRASTRUCTURE_CHANGED",
      title: "Docker Infrastructure Changed",
      summary: `${repo} updated container or local infrastructure configuration.`,
    };
  }

  if (payloadText.includes("route") || payloadText.includes("controller") || payloadText.includes("service")) {
    return {
      eventType: "API_ENDPOINT_CHANGED",
      title: "API Layer Changed",
      summary: `${repo} updated API routes, controllers, or service logic.`,
    };
  }

  if (payloadText.includes("auth") || payloadText.includes("jwt") || payloadText.includes("oauth") || payloadText.includes("security")) {
    return {
      eventType: "AUTH_SYSTEM_CHANGED",
      title: "Auth System Changed",
      summary: `${repo} updated authentication or security-related logic.`,
    };
  }

  if (payloadText.includes("package.json") || payloadText.includes("package-lock.json")) {
    return {
      eventType: "DEPENDENCY_CHANGED",
      title: "Dependencies Changed",
      summary: `${repo} updated project dependencies.`,
    };
  }

  if (payloadText.includes(".tsx") || payloadText.includes(".jsx") || payloadText.includes("components") || payloadText.includes("app/")) {
    return {
      eventType: "FRONTEND_UI_CHANGED",
      title: "Frontend UI Changed",
      summary: `${repo} updated frontend UI or application components.`,
    };
  }

  return {
    eventType: "ENGINEERING_EVENT",
    title: "Engineering Activity Recorded",
    summary:
      "ArcHive detected repository activity that could not yet be mapped to a known architecture category.",
  };
};
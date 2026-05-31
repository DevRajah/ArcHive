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

const generateEngineeringSummary = ({
  repositoryName,
  eventType,
  payloadText,
}: {
  repositoryName: string;
  eventType: string;
  payloadText: string;
}) => {
  const repo = humanRepository(repositoryName);
  const text = payloadText.toLowerCase();

  if (eventType === "AUTH_SYSTEM_CHANGED") {
    if (
      text.includes("oauth") ||
      text.includes("github-auth") ||
      text.includes("github oauth") ||
      text.includes("provider")
    ) {
      return `${repo} updated OAuth authentication infrastructure and provider integration logic.`;
    }

    if (
      text.includes("login") ||
      text.includes("register") ||
      text.includes("signup")
    ) {
      return `${repo} updated user login, registration, or account access flows.`;
    }

    if (
      text.includes("jwt") ||
      text.includes("token") ||
      text.includes("refresh-token") ||
      text.includes("middleware")
    ) {
      return `${repo} updated token authentication or authorization middleware.`;
    }

    if (
      text.includes("rbac") ||
      text.includes("role") ||
      text.includes("permission")
    ) {
      return `${repo} updated role-based access control or permission rules.`;
    }

    if (
      text.includes("signature") ||
      text.includes("webhook secret") ||
      text.includes("x-hub-signature")
    ) {
      return `${repo} updated webhook authentication and request verification logic.`;
    }

    return `${repo} updated authentication or security-related infrastructure.`;
  }

  if (
    eventType === "QUEUE_ADDED" ||
    eventType === "QUEUE_INFRASTRUCTURE_UPDATED"
  ) {
    if (
      text.includes("retry") ||
      text.includes("attempt") ||
      text.includes("backoff")
    ) {
      return `${repo} updated queue retry handling and background job resilience.`;
    }

    if (
      text.includes("worker") ||
      text.includes("bullmq") ||
      text.includes("job")
    ) {
      return `${repo} updated asynchronous job processing and worker infrastructure.`;
    }

    return `${repo} updated queue-based background processing infrastructure.`;
  }

  if (
    eventType === "REDIS_INFRASTRUCTURE_ADDED" ||
    eventType === "REDIS_INFRASTRUCTURE_UPDATED"
  ) {
    return `${repo} updated Redis-backed caching, queue, or realtime infrastructure.`;
  }

  if (
    eventType === "DOCKER_INFRASTRUCTURE_CHANGED" ||
    eventType === "DOCKER_INFRASTRUCTURE_UPDATED"
  ) {
    return `${repo} updated Docker or container-based development infrastructure.`;
  }

  if (
    eventType === "DATABASE_SCHEMA_CHANGED" ||
    eventType === "DATABASE_SCHEMA_UPDATED"
  ) {
    return `${repo} updated database schema or persistence-layer infrastructure.`;
  }

  if (eventType === "API_ENDPOINT_CHANGED") {
    if (text.includes("controller")) {
      return `${repo} updated controller logic for API request handling.`;
    }

    if (text.includes("route")) {
      return `${repo} updated API routing or endpoint definitions.`;
    }

    if (text.includes("service")) {
      return `${repo} updated service-layer business logic.`;
    }

    return `${repo} updated API routes, controllers, or service-layer logic.`;
  }

  if (eventType === "DEPENDENCY_CHANGED") {
    return `${repo} updated project dependencies or package configuration.`;
  }

  if (eventType === "FRONTEND_UI_CHANGED") {
    return `${repo} updated frontend UI, dashboard components, or client-side application logic.`;
  }

  if (eventType === "PR_MERGED") {
    return `${repo} merged a pull request into the codebase.`;
  }

  if (eventType === "PULL_REQUEST") {
    return `${repo} recorded pull request activity.`;
  }

  if (eventType === "COMMIT_PUSHED") {
    return `${repo} received new code changes from GitHub.`;
  }

  return "ArcHive detected repository activity that could not yet be mapped to a known architecture category.";
};

const buildKnownEvent = ({
  eventType,
  title,
  repositoryName,
  payloadText,
}: {
  eventType: string;
  title: string;
  repositoryName: string;
  payloadText: string;
}): ClassifiedEngineeringEvent => ({
  eventType,
  title,
  summary: generateEngineeringSummary({
    repositoryName,
    eventType,
    payloadText,
  }),
});

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

  const known: Record<string, ClassifiedEngineeringEvent> = {
    QUEUE_ADDED: history?.hasQueueHistory
      ? buildKnownEvent({
          eventType: "QUEUE_INFRASTRUCTURE_UPDATED",
          title: "Queue Processing Updated",
          repositoryName: repo,
          payloadText,
        })
      : buildKnownEvent({
          eventType: "QUEUE_ADDED",
          title: "Queue Infrastructure Added",
          repositoryName: repo,
          payloadText,
        }),

    QUEUE_INFRASTRUCTURE_UPDATED: buildKnownEvent({
      eventType: "QUEUE_INFRASTRUCTURE_UPDATED",
      title: "Queue Processing Updated",
      repositoryName: repo,
      payloadText,
    }),

    REDIS_ADDED: history?.hasRedisHistory
      ? buildKnownEvent({
          eventType: "REDIS_INFRASTRUCTURE_UPDATED",
          title: "Redis Infrastructure Updated",
          repositoryName: repo,
          payloadText,
        })
      : buildKnownEvent({
          eventType: "REDIS_INFRASTRUCTURE_ADDED",
          title: "Redis Infrastructure Added",
          repositoryName: repo,
          payloadText,
        }),

    REDIS_INFRASTRUCTURE_ADDED: buildKnownEvent({
      eventType: "REDIS_INFRASTRUCTURE_ADDED",
      title: "Redis Infrastructure Added",
      repositoryName: repo,
      payloadText,
    }),

    REDIS_INFRASTRUCTURE_UPDATED: buildKnownEvent({
      eventType: "REDIS_INFRASTRUCTURE_UPDATED",
      title: "Redis Infrastructure Updated",
      repositoryName: repo,
      payloadText,
    }),

    DOCKER_ADDED: history?.hasDockerHistory
      ? buildKnownEvent({
          eventType: "DOCKER_INFRASTRUCTURE_UPDATED",
          title: "Docker Infrastructure Updated",
          repositoryName: repo,
          payloadText,
        })
      : buildKnownEvent({
          eventType: "DOCKER_INFRASTRUCTURE_CHANGED",
          title: "Docker Infrastructure Added",
          repositoryName: repo,
          payloadText,
        }),

    DOCKER_INFRASTRUCTURE_CHANGED: buildKnownEvent({
      eventType: "DOCKER_INFRASTRUCTURE_CHANGED",
      title: "Docker Infrastructure Added",
      repositoryName: repo,
      payloadText,
    }),

    DOCKER_INFRASTRUCTURE_UPDATED: buildKnownEvent({
      eventType: "DOCKER_INFRASTRUCTURE_UPDATED",
      title: "Docker Infrastructure Updated",
      repositoryName: repo,
      payloadText,
    }),

    DATABASE_CHANGE: history?.hasDatabaseHistory
      ? buildKnownEvent({
          eventType: "DATABASE_SCHEMA_UPDATED",
          title: "Database Schema Updated",
          repositoryName: repo,
          payloadText,
        })
      : buildKnownEvent({
          eventType: "DATABASE_SCHEMA_CHANGED",
          title: "Database Schema Changed",
          repositoryName: repo,
          payloadText,
        }),

    DATABASE_SCHEMA_CHANGED: buildKnownEvent({
      eventType: "DATABASE_SCHEMA_CHANGED",
      title: "Database Schema Changed",
      repositoryName: repo,
      payloadText,
    }),

    DATABASE_SCHEMA_UPDATED: buildKnownEvent({
      eventType: "DATABASE_SCHEMA_UPDATED",
      title: "Database Schema Updated",
      repositoryName: repo,
      payloadText,
    }),

    API_ENDPOINT_CHANGED: buildKnownEvent({
      eventType: "API_ENDPOINT_CHANGED",
      title: "API Layer Changed",
      repositoryName: repo,
      payloadText,
    }),

    AUTH_SYSTEM_CHANGED: buildKnownEvent({
      eventType: "AUTH_SYSTEM_CHANGED",
      title: "Auth System Changed",
      repositoryName: repo,
      payloadText,
    }),

    DEPENDENCY_CHANGED: buildKnownEvent({
      eventType: "DEPENDENCY_CHANGED",
      title: "Dependencies Changed",
      repositoryName: repo,
      payloadText,
    }),

    FRONTEND_UI_CHANGED: buildKnownEvent({
      eventType: "FRONTEND_UI_CHANGED",
      title: "Frontend UI Changed",
      repositoryName: repo,
      payloadText,
    }),

    PR_MERGED: buildKnownEvent({
      eventType: "PR_MERGED",
      title: "Pull Request Merged",
      repositoryName: repo,
      payloadText,
    }),

    PULL_REQUEST: buildKnownEvent({
      eventType: "PULL_REQUEST",
      title: "Pull Request Activity",
      repositoryName: repo,
      payloadText,
    }),

    COMMIT_PUSHED: buildKnownEvent({
      eventType: "COMMIT_PUSHED",
      title: "Code Pushed",
      repositoryName: repo,
      payloadText,
    }),

    ENGINEERING_EVENT: {
      eventType: "ENGINEERING_EVENT",
      title: "Engineering Activity Recorded",
      summary:
        "ArcHive detected repository activity that could not yet be mapped to a known architecture category.",
    },

    UNKNOWN: {
      eventType: "ENGINEERING_EVENT",
      title: "Engineering Activity Recorded",
      summary:
        "ArcHive detected repository activity that could not yet be mapped to a known architecture category.",
    },
  };

  // I handle known database event types before keyword inference.
  // This prevents an already-classified update from being downgraded into a generic "added" event.
  if (known[safeRawType]) {
    return known[safeRawType];
  }

  const hasQueueSignal =
    payloadText.includes("bullmq") ||
    payloadText.includes("queue") ||
    payloadText.includes("worker");

  const hasRedisSignal =
    payloadText.includes("redis") ||
    payloadText.includes("ioredis") ||
    payloadText.includes("cache");

  const hasDockerSignal =
    payloadText.includes("docker") ||
    payloadText.includes("docker-compose");

  const hasDatabaseSignal =
    payloadText.includes("schema.prisma") ||
    payloadText.includes("migration") ||
    payloadText.includes("database");

  if (hasQueueSignal) {
    return history?.hasQueueHistory
      ? buildKnownEvent({
          eventType: "QUEUE_INFRASTRUCTURE_UPDATED",
          title: "Queue Processing Updated",
          repositoryName: repo,
          payloadText,
        })
      : buildKnownEvent({
          eventType: "QUEUE_ADDED",
          title: "Queue Infrastructure Added",
          repositoryName: repo,
          payloadText,
        });
  }

  if (hasRedisSignal) {
    return history?.hasRedisHistory
      ? buildKnownEvent({
          eventType: "REDIS_INFRASTRUCTURE_UPDATED",
          title: "Redis Infrastructure Updated",
          repositoryName: repo,
          payloadText,
        })
      : buildKnownEvent({
          eventType: "REDIS_INFRASTRUCTURE_ADDED",
          title: "Redis Infrastructure Added",
          repositoryName: repo,
          payloadText,
        });
  }

  if (hasDockerSignal) {
    return history?.hasDockerHistory
      ? buildKnownEvent({
          eventType: "DOCKER_INFRASTRUCTURE_UPDATED",
          title: "Docker Infrastructure Updated",
          repositoryName: repo,
          payloadText,
        })
      : buildKnownEvent({
          eventType: "DOCKER_INFRASTRUCTURE_CHANGED",
          title: "Docker Infrastructure Added",
          repositoryName: repo,
          payloadText,
        });
  }

  if (hasDatabaseSignal) {
    return history?.hasDatabaseHistory
      ? buildKnownEvent({
          eventType: "DATABASE_SCHEMA_UPDATED",
          title: "Database Schema Updated",
          repositoryName: repo,
          payloadText,
        })
      : buildKnownEvent({
          eventType: "DATABASE_SCHEMA_CHANGED",
          title: "Database Schema Changed",
          repositoryName: repo,
          payloadText,
        });
  }

  if (
    payloadText.includes("auth") ||
    payloadText.includes("jwt") ||
    payloadText.includes("oauth") ||
    payloadText.includes("security") ||
    payloadText.includes("signature")
  ) {
    return buildKnownEvent({
      eventType: "AUTH_SYSTEM_CHANGED",
      title: "Auth System Changed",
      repositoryName: repo,
      payloadText,
    });
  }

  if (
    payloadText.includes("route") ||
    payloadText.includes("controller") ||
    payloadText.includes("service")
  ) {
    return buildKnownEvent({
      eventType: "API_ENDPOINT_CHANGED",
      title: "API Layer Changed",
      repositoryName: repo,
      payloadText,
    });
  }

  if (
    payloadText.includes("package.json") ||
    payloadText.includes("package-lock.json")
  ) {
    return buildKnownEvent({
      eventType: "DEPENDENCY_CHANGED",
      title: "Dependencies Changed",
      repositoryName: repo,
      payloadText,
    });
  }

  if (
    payloadText.includes(".tsx") ||
    payloadText.includes(".jsx") ||
    payloadText.includes("components") ||
    payloadText.includes("apps/web")
  ) {
    return buildKnownEvent({
      eventType: "FRONTEND_UI_CHANGED",
      title: "Frontend UI Changed",
      repositoryName: repo,
      payloadText,
    });
  }

  return {
    eventType: "ENGINEERING_EVENT",
    title: "Engineering Activity Recorded",
    summary:
      "ArcHive detected repository activity that could not yet be mapped to a known architecture category.",
  };
};
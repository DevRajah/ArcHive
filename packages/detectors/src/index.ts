export type ArchitectureDetectionInput = {
  eventType: string;
  rawPayload: Record<string, unknown>;
};

export type ArchitectureDetectionResult = {
  changeType: string;
  detectedTechnology: string;
  fileAffected?: string;
  summary: string;
  importanceScore: number;
};

const getFilesChanged = (rawPayload: Record<string, unknown>): string[] => {
  const filesChanged = rawPayload.filesChanged;

  if (!Array.isArray(filesChanged)) {
    return [];
  }

  return filesChanged.filter((file): file is string => typeof file === "string");
};

const includesAny = (value: string, keywords: string[]) => {
  return keywords.some((keyword) => value.toLowerCase().includes(keyword.toLowerCase()));
};

export const detectArchitectureChanges = (
  input: ArchitectureDetectionInput
): ArchitectureDetectionResult[] => {
  const { eventType, rawPayload } = input;
  const filesChanged = getFilesChanged(rawPayload);
  const joinedFiles = filesChanged.join(" ").toLowerCase();

  const results: ArchitectureDetectionResult[] = [];

  if (eventType === "QUEUE_ADDED" || includesAny(joinedFiles, ["queue", "worker", "bullmq"])) {
    results.push({
      changeType: "QUEUE_SYSTEM_ADDED",
      detectedTechnology: "BullMQ",
      fileAffected: filesChanged[0],
      summary:
        "Queue-based background processing was introduced, allowing long-running work to move outside the request lifecycle.",
      importanceScore: 5,
    });
  }

  if (eventType === "REDIS_ADDED" || includesAny(joinedFiles, ["redis", "ioredis", "cache"])) {
    results.push({
      changeType: "REDIS_INFRASTRUCTURE_ADDED",
      detectedTechnology: "Redis",
      fileAffected: filesChanged[0],
      summary:
        "Redis infrastructure was introduced, likely supporting queues, caching, sessions, rate limiting, or realtime features.",
      importanceScore: 4,
    });
  }

  if (eventType === "DOCKER_ADDED" || includesAny(joinedFiles, ["dockerfile", "docker-compose"])) {
    results.push({
      changeType: "CONTAINERIZATION_ADDED",
      detectedTechnology: "Docker",
      fileAffected: filesChanged[0],
      summary:
        "Docker support was added to improve environment consistency, local development, and deployment readiness.",
      importanceScore: 4,
    });
  }

  if (eventType === "DATABASE_CHANGE" || includesAny(joinedFiles, ["schema.prisma", "migration", "database"])) {
    results.push({
      changeType: "DATABASE_LAYER_CHANGED",
      detectedTechnology: "Database",
      fileAffected: filesChanged[0],
      summary:
        "The database layer changed, which may affect persistence, relationships, schema design, or data access patterns.",
      importanceScore: 4,
    });
  }

  return results;
};
import { generateArchitectureSummary } from "./architecture-summary";

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

  if (Array.isArray(filesChanged)) {
    return filesChanged.filter((file): file is string => typeof file === "string");
  }

  const commits = rawPayload.commits;

  if (!Array.isArray(commits)) return [];

  const files = new Set<string>();

  for (const commit of commits) {
    if (!commit || typeof commit !== "object") continue;

    const typedCommit = commit as {
      added?: unknown[];
      modified?: unknown[];
      removed?: unknown[];
    };

    const added = Array.isArray(typedCommit.added) ? typedCommit.added : [];
    const modified = Array.isArray(typedCommit.modified)
      ? typedCommit.modified
      : [];
    const removed = Array.isArray(typedCommit.removed) ? typedCommit.removed : [];

    [...added, ...modified, ...removed].forEach((file) => {
      if (typeof file === "string") files.add(file);
    });
  }

  return Array.from(files);
};

const getCommitMessages = (rawPayload: Record<string, unknown>): string[] => {
  const commitMessages = rawPayload.commitMessages;

  if (Array.isArray(commitMessages)) {
    return commitMessages.filter(
      (message): message is string => typeof message === "string"
    );
  }

  const commits = rawPayload.commits;

  if (!Array.isArray(commits)) return [];

  return commits
    .map((commit) => {
      if (!commit || typeof commit !== "object") return "";

      const typedCommit = commit as { message?: unknown };

      return typeof typedCommit.message === "string" ? typedCommit.message : "";
    })
    .filter(Boolean);
};

const includesAny = (value: string, keywords: string[]) => {
  return keywords.some((keyword) =>
    value.toLowerCase().includes(keyword.toLowerCase())
  );
};

const firstMatchingFile = (files: string[], keywords: string[]) => {
  return files.find((file) => includesAny(file, keywords));
};

const buildChange = ({
  eventType,
  rawPayload,
  changeType,
  detectedTechnology,
  fileAffected,
  importanceScore,
}: {
  eventType: string;
  rawPayload: Record<string, unknown>;
  changeType: string;
  detectedTechnology: string;
  fileAffected?: string;
  importanceScore: number;
}): ArchitectureDetectionResult => {
  return {
    changeType,
    detectedTechnology,
    fileAffected,
    summary: generateArchitectureSummary({
      changeType,
      detectedTechnology,
      fileAffected,
      eventType,
      rawPayload,
    }),
    importanceScore,
  };
};

export const detectArchitectureChanges = (
  input: ArchitectureDetectionInput
): ArchitectureDetectionResult[] => {
  const { eventType, rawPayload } = input;

  const normalizedEventType = eventType.toUpperCase();
  const filesChanged = getFilesChanged(rawPayload);
  const commitMessages = getCommitMessages(rawPayload);

  const joinedFiles = filesChanged.join(" ").toLowerCase();
  const joinedMessages = commitMessages.join(" ").toLowerCase();
  const payloadText = `${joinedFiles} ${joinedMessages}`;

  const results: ArchitectureDetectionResult[] = [];

  const hasQueueSignal =
    normalizedEventType.includes("QUEUE") ||
    includesAny(payloadText, ["queue", "worker", "bullmq"]);

  if (hasQueueSignal) {
    const wasUpdated =
      normalizedEventType.includes("QUEUE_INFRASTRUCTURE_UPDATED") ||
      normalizedEventType.includes("QUEUE_PROCESSING_UPDATED");

    results.push(
      buildChange({
        eventType,
        rawPayload,
        changeType: wasUpdated
          ? "QUEUE_INFRASTRUCTURE_UPDATED"
          : "QUEUE_INFRASTRUCTURE_ADDED",
        detectedTechnology: "BullMQ / Queue Worker",
        fileAffected: firstMatchingFile(filesChanged, [
          "queue",
          "worker",
          "bullmq",
          "engineering-event-classifier",
        ]),
        importanceScore: wasUpdated ? 3 : 5,
      })
    );
  }

  const hasRedisSignal =
    normalizedEventType.includes("REDIS") ||
    includesAny(payloadText, ["redis", "ioredis", "cache"]);

  if (hasRedisSignal) {
    const wasUpdated = normalizedEventType.includes("UPDATED");

    results.push(
      buildChange({
        eventType,
        rawPayload,
        changeType: wasUpdated
          ? "REDIS_INFRASTRUCTURE_UPDATED"
          : "REDIS_INFRASTRUCTURE_ADDED",
        detectedTechnology: "Redis",
        fileAffected: firstMatchingFile(filesChanged, ["redis", "ioredis", "cache"]),
        importanceScore: wasUpdated ? 3 : 4,
      })
    );
  }

  const hasDockerSignal =
    normalizedEventType.includes("DOCKER") ||
    includesAny(payloadText, ["dockerfile", "docker-compose", "docker"]);

  if (hasDockerSignal) {
    const wasUpdated = normalizedEventType.includes("UPDATED");

    results.push(
      buildChange({
        eventType,
        rawPayload,
        changeType: wasUpdated
          ? "DOCKER_INFRASTRUCTURE_UPDATED"
          : "DOCKER_INFRASTRUCTURE_ADDED",
        detectedTechnology: "Docker",
        fileAffected: firstMatchingFile(filesChanged, [
          "dockerfile",
          "docker-compose",
          "docker",
        ]),
        importanceScore: wasUpdated ? 3 : 4,
      })
    );
  }

  const hasDatabaseSignal =
    normalizedEventType.includes("DATABASE") ||
    includesAny(payloadText, ["schema.prisma", "migration", "database", "prisma"]);

  if (hasDatabaseSignal) {
    const wasUpdated = normalizedEventType.includes("UPDATED");

    results.push(
      buildChange({
        eventType,
        rawPayload,
        changeType: wasUpdated
          ? "DATABASE_SCHEMA_UPDATED"
          : "DATABASE_SCHEMA_CHANGED",
        detectedTechnology: "Database / Prisma",
        fileAffected: firstMatchingFile(filesChanged, [
          "schema.prisma",
          "migration",
          "database",
          "prisma",
        ]),
        importanceScore: wasUpdated ? 3 : 4,
      })
    );
  }

  const hasApiSignal =
    normalizedEventType.includes("API") ||
    includesAny(payloadText, ["route", "controller", "service", "endpoint"]);

  if (hasApiSignal) {
    results.push(
      buildChange({
        eventType,
        rawPayload,
        changeType: "BACKEND_API_CHANGED",
        detectedTechnology: "API Layer",
        fileAffected: firstMatchingFile(filesChanged, [
          "route",
          "controller",
          "service",
          "endpoint",
        ]),
        importanceScore: 3,
      })
    );
  }

  const hasAuthSignal =
    normalizedEventType.includes("AUTH") ||
    includesAny(payloadText, [
      "auth",
      "oauth",
      "login",
      "register",
      "jwt",
      "security",
      "signature",
      "permission",
    ]);

  if (hasAuthSignal) {
    results.push(
      buildChange({
        eventType,
        rawPayload,
        changeType: "AUTH_SYSTEM_CHANGED",
        detectedTechnology: "Authentication / Authorization",
        fileAffected: firstMatchingFile(filesChanged, [
          "auth",
          "oauth",
          "login",
          "register",
          "jwt",
          "security",
          "signature",
        ]),
        importanceScore: 4,
      })
    );
  }

  const hasFrontendSignal =
    normalizedEventType.includes("FRONTEND") ||
    includesAny(payloadText, [
      "apps/web",
      "components",
      ".tsx",
      ".jsx",
      "pages",
      "app/",
    ]);

  if (hasFrontendSignal) {
    results.push(
      buildChange({
        eventType,
        rawPayload,
        changeType: "FRONTEND_UI_CHANGED",
        detectedTechnology: "Frontend UI",
        fileAffected: firstMatchingFile(filesChanged, [
          "apps/web",
          "components",
          ".tsx",
          ".jsx",
          "pages",
          "app/",
        ]),
        importanceScore: 2,
      })
    );
  }

  const hasStateSignal = includesAny(payloadText, [
    "hooks",
    "use",
    "state",
    "context",
    "store",
  ]);

  if (hasStateSignal) {
    results.push(
      buildChange({
        eventType,
        rawPayload,
        changeType: "STATE_MANAGEMENT_CHANGED",
        detectedTechnology: "Client State / Hooks",
        fileAffected: firstMatchingFile(filesChanged, [
          "hooks",
          "use",
          "context",
          "store",
        ]),
        importanceScore: 2,
      })
    );
  }

  const hasTypeContractSignal = includesAny(payloadText, [
    "types",
    ".types.ts",
    "interfaces",
    "dto",
  ]);

  if (hasTypeContractSignal) {
    results.push(
      buildChange({
        eventType,
        rawPayload,
        changeType: "TYPE_CONTRACT_CHANGED",
        detectedTechnology: "TypeScript Contracts",
        fileAffected: firstMatchingFile(filesChanged, [
          "types",
          ".types.ts",
          "interfaces",
          "dto",
        ]),
        importanceScore: 2,
      })
    );
  }

  const hasDependencySignal =
    normalizedEventType.includes("DEPENDENCY") ||
    includesAny(payloadText, [
      "package.json",
      "package-lock.json",
      "pnpm-lock.yaml",
      "yarn.lock",
    ]);

  if (hasDependencySignal) {
    results.push(
      buildChange({
        eventType,
        rawPayload,
        changeType: "DEPENDENCY_CHANGED",
        detectedTechnology: "Package Dependencies",
        fileAffected: firstMatchingFile(filesChanged, [
          "package.json",
          "package-lock.json",
          "pnpm-lock.yaml",
          "yarn.lock",
        ]),
        importanceScore: 2,
      })
    );
  }

  return results; 
};
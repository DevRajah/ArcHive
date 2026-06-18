import { generateArchitectureSummary } from "./architecture-summary";

export * from "./technology-fingerprint";
export * from "./architecture-domain";
export * from "./architecture-style";
export * from "./evolution-summary";
export * from "./repository-narrative";
export * from "./intelligence-confidence";
export * from "./repository-purpose";
export * from "./repository-semantic-engine";
export * from "./evolution-direction";
export * from "./engineering-insights";
export * from "./repository-similarity";
export * from "./ecosystem-cluster";
export * from "./engineering-trajectory";
export * from "./engineering-reasoning";
export * from "./technology-relationships";
export * from "./domain-relationships";
export * from "./intelligence-audit";
export * from "./intelligence-timeline";
export * from "./capabilities";
export * from "./evidence";
export * from "./dna";
export * from "./constants";
export * from "./classification";
export * from "./persona";
export * from "./technologies";

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

  const hasRealtimeSignal =
    normalizedEventType.includes("REALTIME") ||
    includesAny(payloadText, [
      "socket.io",
      "socket-emitter",
      "websocket",
      "realtime",
      "emitrealtimeevent",
      "io.on",
      "socket.on",
      "socket.emit",
    ]);

  if (hasRealtimeSignal) {
    results.push(
      buildChange({
        eventType,
        rawPayload,
        changeType: "REALTIME_INFRASTRUCTURE_UPDATED",
        detectedTechnology: "Socket.IO / Realtime Events",
        fileAffected:
          firstMatchingFile(filesChanged, [
            "socket-emitter",
            "server.ts",
            "socket.io",
            "realtime",
          ]) || filesChanged[0],
        importanceScore: 4,
      })
    );
  }

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
        ]) || filesChanged[0],
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
        fileAffected: firstMatchingFile(filesChanged, ["redis", "ioredis", "cache"]) || filesChanged[0],
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
        ]) || filesChanged[0],
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
        ]) || filesChanged[0],
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
        ]) || filesChanged[0],
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
        ]) || filesChanged[0],
        importanceScore: 4,
      })
    );
  }

  const hasArchitectureIntelligenceSignal = includesAny(payloadText, [
    "architecture-summary",
    "engineering-event-classifier",
    "github-push-classifier",
    "detector",
    "detectors",
    "detectarchitecturechanges",
    "repository intelligence",
    "architecture intelligence",
  ]);

  if (hasArchitectureIntelligenceSignal) {
    results.push(
      buildChange({
        eventType,
        rawPayload,
        changeType: "ARCHITECTURE_INTELLIGENCE_UPDATED",
        detectedTechnology: "Repository Intelligence",
        fileAffected:
          firstMatchingFile(filesChanged, [
            "architecture-summary",
            "engineering-event-classifier",
            "github-push-classifier",
            "detector",
            "detectors",
            "packages/detectors",
            "src/index.ts",
          ]) || filesChanged[0],
        importanceScore: 3,
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
        ]) || filesChanged[0],
        importanceScore: 2,
      })
    );
  }

  const hasStateSignal =
    includesAny(normalizedEventType, ["STATE_MANAGEMENT"]) ||
    filesChanged.some((file) =>
      includesAny(file, [
        "/hooks/",
        "\\hooks\\",
        "use-dashboard",
        "useDashboard",
        "store.",
        "context.",
        "provider.",
      ])
    );

  if (hasStateSignal) {
    results.push(
      buildChange({
        eventType,
        rawPayload,
        changeType: "STATE_MANAGEMENT_CHANGED",
        detectedTechnology: "Client State / Hooks",
        fileAffected: firstMatchingFile(filesChanged, [
          "/hooks/",
          "\\hooks\\",
          "use-dashboard",
          "useDashboard",
          "store.",
          "context.",
          "provider.",
        ]) || filesChanged[0],
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
        ]) || filesChanged[0],
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
        ]) || filesChanged[0],
        importanceScore: 2,
      })
    );
  }

  return results;
};
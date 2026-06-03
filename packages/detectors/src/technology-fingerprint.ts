export type TechnologyFingerprintResult = {
  technologies: string[];
  architectureDomains: string[];
  engineeringSignals: string[];
};

const includesAny = (value: string, keywords: string[]) => {
  return keywords.some((keyword) =>
    value.toLowerCase().includes(keyword.toLowerCase())
  );
};

export const detectTechnologyFingerprint = (
  filesChanged: string[],
  commitMessages: string[]
): TechnologyFingerprintResult => {
  const joinedFiles = filesChanged.join(" ").toLowerCase();
  const joinedCommits = commitMessages.join(" ").toLowerCase();

  const combinedText = `${joinedFiles} ${joinedCommits}`;

  const technologies = new Set<string>();
  const architectureDomains = new Set<string>();
  const engineeringSignals = new Set<string>();

  /**
   * =========================================
   * NODE / TYPESCRIPT
   * =========================================
   */

  if (
    includesAny(combinedText, [
      "package.json",
      "tsconfig",
      "typescript",
      "express",
      "fastify",
      "nestjs",
    ])
  ) {
    technologies.add("Node.js");
    architectureDomains.add("BACKEND_SYSTEMS");
  }

  /**
   * =========================================
   * REACT / NEXT
   * =========================================
   */

  if (
    includesAny(combinedText, [
      "next",
      "react",
      ".tsx",
      "tailwind",
      "app/",
      "components/",
    ])
  ) {
    technologies.add("React");
    architectureDomains.add("FRONTEND_ARCHITECTURE");
  }

  /**
   * =========================================
   * REALTIME
   * =========================================
   */

  if (
    includesAny(combinedText, [
      "socket.io",
      "websocket",
      "realtime",
      "socket-emitter",
      "emit",
    ])
  ) {
    technologies.add("Socket.IO");
    architectureDomains.add("REALTIME_SYSTEMS");
    engineeringSignals.add("REALTIME_INFRASTRUCTURE");
  }

  /**
   * =========================================
   * QUEUES
   * =========================================
   */

  if (
    includesAny(combinedText, [
      "bullmq",
      "queue",
      "worker",
      "job",
    ])
  ) {
    technologies.add("BullMQ");
    architectureDomains.add("QUEUE_INFRASTRUCTURE");
    engineeringSignals.add("BACKGROUND_PROCESSING");
  }

  /**
   * =========================================
   * REDIS
   * =========================================
   */

  if (
    includesAny(combinedText, [
      "redis",
      "ioredis",
      "cache",
    ])
  ) {
    technologies.add("Redis");
    architectureDomains.add("CACHING_LAYER");
  }

  /**
   * =========================================
   * DATABASE
   * =========================================
   */

  if (
    includesAny(combinedText, [
      "prisma",
      "postgres",
      "mongodb",
      "schema.prisma",
      "migration",
    ])
  ) {
    technologies.add("Database");
    architectureDomains.add("DATABASE_LAYER");
  }

  /**
   * =========================================
   * PYTHON
   * =========================================
   */

  if (
    includesAny(combinedText, [
      "requirements.txt",
      "pyproject.toml",
      "fastapi",
      "django",
      "flask",
      ".py",
    ])
  ) {
    technologies.add("Python");
    architectureDomains.add("PYTHON_SYSTEMS");
  }

  /**
   * =========================================
   * AI / ML
   * =========================================
   */

  if (
    includesAny(combinedText, [
      "tensorflow",
      "pytorch",
      "transformers",
      "openai",
      "langchain",
      "llm",
    ])
  ) {
    technologies.add("AI/ML");
    architectureDomains.add("AI_INFRASTRUCTURE");
    engineeringSignals.add("MACHINE_LEARNING");
  }

  /**
   * =========================================
   * DEVOPS
   * =========================================
   */

  if (
    includesAny(combinedText, [
      "docker",
      "docker-compose",
      "terraform",
      "kubernetes",
      ".github/workflows",
    ])
  ) {
    technologies.add("DevOps");
    architectureDomains.add("INFRASTRUCTURE_AUTOMATION");
  }

  return {
    technologies: Array.from(technologies),
    architectureDomains: Array.from(architectureDomains),
    engineeringSignals: Array.from(engineeringSignals),
  };
};
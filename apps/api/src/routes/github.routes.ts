import { FastifyInstance } from "fastify";
import { prisma } from "@archive/database";
import { EngineeringEventType } from "@prisma/client";
import { engineeringEventQueue } from "@archive/queue";

export const githubRoutes = async (app: FastifyInstance) => {
  app.post("/webhook", async (request, reply) => {
    // GitHub tells us what type of event this webhook represents.
    const githubEvent = request.headers["x-github-event"] as string;

    const payload = request.body as Record<string, any>;

    console.log("GitHub event received:", githubEvent);

    // For now, we only support push events.
    // Later we'll add pull_request, release, deployment, etc.
    if (githubEvent !== "push") {
      return reply.status(200).send({
        success: true,
        message: `Ignoring unsupported GitHub event: ${githubEvent}`,
      });
    }

    const repositoryFullName = payload.repository?.full_name;

    if (!repositoryFullName) {
      return reply.status(400).send({
        success: false,
        message: "Repository full name missing from GitHub payload",
      });
    }

    const repository = await prisma.repository.findUnique({
      where: {
        fullName: repositoryFullName,
      },
    });

    // ArcHive only processes repositories already registered in the system.
    if (!repository) {
      return reply.status(404).send({
        success: false,
        message: "Repository not registered in ArcHive",
      });
    }

    const commits = Array.isArray(payload.commits)
      ? payload.commits
      : [];

    const changedFiles = new Set<string>();

    for (const commit of commits) {
      const added = Array.isArray(commit.added) ? commit.added : [];
      const modified = Array.isArray(commit.modified) ? commit.modified : [];
      const removed = Array.isArray(commit.removed) ? commit.removed : [];

      [...added, ...modified, ...removed].forEach((file) => {
        if (typeof file === "string") {
          changedFiles.add(file);
        }
      });
    }

    // Very early/simple architecture classification logic.
    // This will become much smarter later.
    let detectedEventType: EngineeringEventType = EngineeringEventType.UNKNOWN;

    const fileList = Array.from(changedFiles).join(" ").toLowerCase();

    if (
      fileList.includes("queue") ||
      fileList.includes("worker") ||
      fileList.includes("bullmq")
    ) {
      detectedEventType = EngineeringEventType.QUEUE_ADDED;
    } else if (
      fileList.includes("redis") ||
      fileList.includes("cache")
    ) {
      detectedEventType = EngineeringEventType.REDIS_ADDED;
    } else if (
      fileList.includes("docker")
    ) {
      detectedEventType = EngineeringEventType.DOCKER_ADDED;
    } else if (
      fileList.includes("schema.prisma") ||
      fileList.includes("migration")
    ) {
      detectedEventType = EngineeringEventType.DATABASE_CHANGE;
    }

    const engineeringEvent = await prisma.engineeringEvent.create({
      data: {
        repositoryId: repository.id,
        eventType: detectedEventType,
        source: "github-webhook",
        rawPayload: {
          githubEvent,
          repository: repositoryFullName,
          commits,
          filesChanged: Array.from(changedFiles),
        },
        occurredAt: new Date(),
      },
    });

    await engineeringEventQueue.add(
      "process-engineering-event",
      {
        eventId: engineeringEvent.id,
        repositoryId: repository.id,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 3000,
        },
      }
    );

    return reply.status(200).send({
      success: true,
      message: "GitHub webhook processed successfully",
      data: {
        engineeringEventId: engineeringEvent.id,
        detectedEventType,
        filesChanged: Array.from(changedFiles),
        commitCount: commits.length,
      },
    });
  });
};
import { FastifyInstance } from "fastify";
import { prisma } from "@archive/database";
import { EngineeringEventType } from "@prisma/client";
import { engineeringEventQueue } from "@archive/queue";
import { verifyGitHubSignature } from "../utils/github-signature";

type GitHubCommitPayload = {
  message?: string;
  added?: string[];
  modified?: string[];
  removed?: string[];
};

const getChangedFilesFromCommits = (commits: GitHubCommitPayload[]) => {
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

  return Array.from(changedFiles);
};

const detectEventTypeFromPush = ({
  filesChanged,
  commitMessages,
}: {
  filesChanged: string[];
  commitMessages: string[];
}) => {
  const fileText = filesChanged.join(" ").toLowerCase();
  const messageText = commitMessages.join(" ").toLowerCase();
  const combined = `${fileText} ${messageText}`;

  if (
    combined.includes("queue") ||
    combined.includes("worker") ||
    combined.includes("bullmq")
  ) {
    return EngineeringEventType.QUEUE_ADDED;
  }

  if (
    combined.includes("redis") ||
    combined.includes("cache") ||
    combined.includes("ioredis")
  ) {
    return EngineeringEventType.REDIS_ADDED;
  }

  if (combined.includes("docker") || combined.includes("container")) {
    return EngineeringEventType.DOCKER_ADDED;
  }

  if (
    combined.includes("schema.prisma") ||
    combined.includes("migration") ||
    combined.includes("database")
  ) {
    return EngineeringEventType.DATABASE_CHANGE;
  }

  return EngineeringEventType.UNKNOWN;
};

export const githubRoutes = async (app: FastifyInstance) => {
  app.post(
    "/webhook",
    {
      config: {
        rawBody: true,
      },
    },
    async (request, reply) => {
      const githubEvent = request.headers["x-github-event"] as string;
      const signature = request.headers["x-hub-signature-256"] as string;
      const rawBody = (request as any).rawBody as string | undefined;

      if (process.env.NODE_ENV !== "development") {
        const verification = verifyGitHubSignature({
          payload: rawBody || "",
          signature,
          secret: process.env.GITHUB_WEBHOOK_SECRET,
        });

        if (!verification.valid) {
          return reply.status(401).send({
            success: false,
            message: verification.reason,
          });
        }
      }

      const payload = request.body as Record<string, any>;

      if (githubEvent === "ping") {
        return reply.status(200).send({
          success: true,
          message: "GitHub webhook ping received successfully",
        });
      }

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

      if (!repository) {
        return reply.status(404).send({
          success: false,
          message: "Repository not registered in ArcHive",
        });
      }

      const commits = Array.isArray(payload.commits)
        ? (payload.commits as GitHubCommitPayload[])
        : [];

      const filesChanged = getChangedFilesFromCommits(commits);
      const commitMessages = commits
        .map((commit) => commit.message)
        .filter((message): message is string => typeof message === "string");

      const detectedEventType = detectEventTypeFromPush({
        filesChanged,
        commitMessages,
      });

      const engineeringEvent = await prisma.engineeringEvent.create({
        data: {
          repositoryId: repository.id,
          eventType: detectedEventType,
          source: "github-webhook",
          rawPayload: {
            githubEvent,
            repository: repositoryFullName,
            commitMessages,
            commits,
            filesChanged,
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
          repositoryId: repository.id,
          engineeringEventId: engineeringEvent.id,
          detectedEventType,
          filesChanged,
          commitMessages,
          commitCount: commits.length,
        },
      });
    }
  );
};
import { FastifyInstance } from "fastify";
import { prisma } from "@archive/database";
import { EngineeringEventType, Prisma } from "@prisma/client";
import { engineeringEventQueue } from "@archive/queue";
import { verifyGitHubSignature } from "../utils/github-signature";
import { classifyGitHubPushEvent } from "../utils/github-push-classifier";

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

const getRepositoryArchitectureHistory = async (repositoryId: string) => {
  const architectureHistory = await prisma.architectureChange.findMany({
    where: { repositoryId },
    select: {
      changeType: true,
      detectedTechnology: true,
    },
  });

  const historyText = architectureHistory
    .map((change) => `${change.changeType} ${change.detectedTechnology || ""}`)
    .join(" ")
    .toLowerCase();

  return {
    hasQueueHistory:
      historyText.includes("queue") || historyText.includes("bullmq"),
    hasRedisHistory: historyText.includes("redis"),
    hasDockerHistory: historyText.includes("docker"),
    hasDatabaseHistory:
      historyText.includes("database") || historyText.includes("schema"),
  };
};

const queueEngineeringEventProcessing = async ({
  eventId,
  repositoryId,
}: {
  eventId: string;
  repositoryId: string;
}) => {
  await engineeringEventQueue.add(
    "process-engineering-event" as any,
    {
      eventId,
      repositoryId,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 3000,
      },
    }
  );
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
      const signature = request.headers["x-hub-signature-256"] as
        | string
        | undefined;
      const rawBody = (request as any).rawBody as string | undefined;

      console.log("GitHub event received:", githubEvent);

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

      if (githubEvent === "pull_request") {
        const repositoryFullName = payload.repository?.full_name;
        const action = payload.action;
        const pullRequest = payload.pull_request;

        if (!repositoryFullName || !pullRequest) {
          return reply.status(400).send({
            success: false,
            message: "Repository or pull request payload missing",
          });
        }

        const repository = await prisma.repository.findUnique({
          where: { fullName: repositoryFullName },
        });

        if (!repository) {
          return reply.status(404).send({
            success: false,
            message: "Repository not registered in ArcHive",
          });
        }

        const isMerged = action === "closed" && pullRequest.merged === true;

        const eventType = isMerged
          ? EngineeringEventType.PR_MERGED
          : EngineeringEventType.PULL_REQUEST;

        const engineeringEvent = await prisma.engineeringEvent.create({
          data: {
            repositoryId: repository.id,
            eventType,
            source: "github-webhook",
            rawPayload: {
              githubEvent,
              action,
              repository: repositoryFullName,
              pullRequest: {
                id: pullRequest.id,
                number: pullRequest.number,
                title: pullRequest.title,
                body: pullRequest.body,
                merged: pullRequest.merged,
                additions: pullRequest.additions,
                deletions: pullRequest.deletions,
                changedFiles: pullRequest.changed_files,
              },
            } as Prisma.InputJsonValue,
            occurredAt: new Date(pullRequest.updated_at || Date.now()),
          },
        });

        await queueEngineeringEventProcessing({
          eventId: engineeringEvent.id,
          repositoryId: repository.id,
        });

        return reply.status(200).send({
          success: true,
          message: "GitHub pull request webhook processed successfully",
          data: {
            repositoryId: repository.id,
            engineeringEventId: engineeringEvent.id,
            eventType,
            action,
            pullRequestNumber: pullRequest.number,
          },
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

      // I check this repo's existing architecture memory before classifying the push.
      // This is what lets ArcHive distinguish "queue added" from "queue updated".
      const architectureHistory = await getRepositoryArchitectureHistory(repository.id);

      const detectedEventType = classifyGitHubPushEvent({
        filesChanged,
        commitMessages,
        history: architectureHistory,
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
          } as Prisma.InputJsonValue,
          occurredAt: new Date(),
        },
      });

      await queueEngineeringEventProcessing({
        eventId: engineeringEvent.id,
        repositoryId: repository.id,
      });

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
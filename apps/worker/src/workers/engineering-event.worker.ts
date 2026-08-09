import "dotenv/config";

import { Worker } from "bullmq";
import { prisma } from "@archive/database";
import {
  redisConnection,
  ProcessEngineeringEventJob,
} from "@archive/queue";

import {
  EngineeringEventType,
  ProcessingStatus,
} from "@prisma/client";

import {
  detectArchitectureChanges,
  detectTechnologyFingerprint,
  mapArchitectureDomain,
  detectArchitectureStyle,
  generateEvolutionSummary,
} from "@archive/detectors";

import {
  emitRealtimeEvent,
} from "../realtime/socket-emitter";

/**
 * Resolves active recommendations when new engineering evidence appears.
 *
 * Future me:
 * This is event-level recommendation handling.
 * It does not own repository identity.
 */
const resolveRecommendationsFromDomains = async ({
  repositoryId,
  detectedDomains,
  fileAffected,
}: {
  repositoryId: string;
  detectedDomains: string[];
  fileAffected?: string | null;
}) => {
  const resolutionMap: Record<string, string> = {
    CACHING_LAYER:
      "ADD_REALTIME_CACHING",

    OBSERVABILITY_SYSTEMS:
      "ADD_QUEUE_OBSERVABILITY",

    AUTHENTICATION:
      "DOCUMENT_API_AUTH_BOUNDARIES",

    SECURITY_SYSTEMS:
      "ADD_FINTECH_SECURITY_CONTROLS",
  };

  for (
    const domain
    of detectedDomains
  ) {
    const recommendationKey =
      resolutionMap[domain];

    if (!recommendationKey) {
      continue;
    }

    await prisma.engineeringRecommendation.updateMany({
      where: {
        repositoryId,
        recommendationKey,
        status: "ACTIVE",
      },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
        evidence:
          fileAffected ||
          `Resolved by detected ${domain}`,
      },
    });
  }
};

const timelineTemplateMap: Partial<
  Record<
    EngineeringEventType,
    {
      title: string;
      summary: string;
      importanceScore: number;
    }
  >
> = {
  QUEUE_ADDED: {
    title:
      "Queue infrastructure added",

    summary:
      "The repository introduced queue-based background processing for asynchronous or long-running tasks.",

    importanceScore: 5,
  },

  QUEUE_INFRASTRUCTURE_UPDATED: {
    title:
      "Queue processing updated",

    summary:
      "The repository updated queue-based background processing or job infrastructure.",

    importanceScore: 3,
  },

  REDIS_ADDED: {
    title:
      "Redis infrastructure added",

    summary:
      "Redis was introduced to support caching, queues, sessions, rate limiting, or realtime infrastructure.",

    importanceScore: 4,
  },

  REDIS_INFRASTRUCTURE_ADDED: {
    title:
      "Redis infrastructure added",

    summary:
      "Redis infrastructure was introduced to support caching, queues, sessions, rate limiting, or realtime workflows.",

    importanceScore: 4,
  },

  REDIS_INFRASTRUCTURE_UPDATED: {
    title:
      "Redis infrastructure updated",

    summary:
      "Redis-related infrastructure was updated, improving cache, queue, or realtime system behaviour.",

    importanceScore: 3,
  },

  DOCKER_ADDED: {
    title:
      "Docker support introduced",

    summary:
      "Docker configuration was added to improve local development, deployment consistency, and environment portability.",

    importanceScore: 4,
  },

  DOCKER_INFRASTRUCTURE_CHANGED: {
    title:
      "Docker infrastructure added",

    summary:
      "Docker or container infrastructure was introduced for environment consistency and deployment readiness.",

    importanceScore: 4,
  },

  DOCKER_INFRASTRUCTURE_UPDATED: {
    title:
      "Docker infrastructure updated",

    summary:
      "Docker or container configuration was updated to improve environment or deployment consistency.",

    importanceScore: 3,
  },

  DATABASE_CHANGE: {
    title:
      "Database architecture changed",

    summary:
      "The repository recorded a database-related change affecting persistence, schema design, or data access patterns.",

    importanceScore: 4,
  },

  DATABASE_SCHEMA_CHANGED: {
    title:
      "Database schema changed",

    summary:
      "The repository introduced database schema or persistence-layer changes.",

    importanceScore: 4,
  },

  DATABASE_SCHEMA_UPDATED: {
    title:
      "Database schema updated",

    summary:
      "The repository updated database schema or persistence-layer behaviour.",

    importanceScore: 3,
  },

  API_ENDPOINT_CHANGED: {
    title:
      "API layer changed",

    summary:
      "The repository updated API routes, controllers, or service logic.",

    importanceScore: 3,
  },

  AUTH_SYSTEM_CHANGED: {
    title:
      "Auth system changed",

    summary:
      "The repository updated authentication, authorization, OAuth, token, or security-related logic.",

    importanceScore: 4,
  },

  DEPENDENCY_CHANGED: {
    title:
      "Dependencies changed",

    summary:
      "The repository updated project dependencies or package configuration.",

    importanceScore: 2,
  },

  FRONTEND_UI_CHANGED: {
    title:
      "Frontend UI changed",

    summary:
      "The repository updated frontend UI, page structure, or client-side components.",

    importanceScore: 2,
  },

  ENGINEERING_EVENT: {
    title:
      "Engineering activity recorded",

    summary:
      "ArcHive detected repository activity that could not yet be mapped to a known architecture category.",

    importanceScore: 1,
  },

  COMMIT_PUSHED: {
    title:
      "Code pushed",

    summary:
      "New code changes were pushed to the repository.",

    importanceScore: 1,
  },

  UNKNOWN: {
    title:
      "Engineering activity recorded",

    summary:
      "ArcHive recorded engineering activity, but it was not classified as a major architecture change.",

    importanceScore: 1,
  },

  PR_MERGED: {
    title:
      "Pull request merged",

    summary:
      "A pull request was merged into the repository, representing a reviewed and accepted engineering change.",

    importanceScore: 3,
  },

  PULL_REQUEST: {
    title:
      "Pull request activity recorded",

    summary:
      "Pull request activity was recorded, helping preserve context around proposed engineering changes.",

    importanceScore: 2,
  },
};

/**
 * Safely extracts event-scoped file and commit information.
 */
const getRawPayloadArrays = (
  rawPayload: unknown,
) => {
  const payload =
    rawPayload as {
      filesChanged?: unknown;
      commitMessages?: unknown;
    };

  const filesChanged =
    Array.isArray(
      payload.filesChanged,
    )
      ? payload.filesChanged.filter(
          (
            file,
          ): file is string =>
            typeof file ===
            "string",
        )
      : [];

  const commitMessages =
    Array.isArray(
      payload.commitMessages,
    )
      ? payload.commitMessages.filter(
          (
            message,
          ): message is string =>
            typeof message ===
            "string",
        )
      : [];

  return {
    filesChanged,
    commitMessages,
  };
};

const worker =
  new Worker<ProcessEngineeringEventJob>(
    "engineering-event-processing",

    async (job) => {
      const {
        eventId,
        repositoryId,
      } = job.data;

      const event =
        await prisma.engineeringEvent.update({
          where: {
            id: eventId,
          },

          data: {
            status:
              ProcessingStatus.PROCESSING,
          },

          include: {
            repository: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        });

      const template =
        timelineTemplateMap[
          event.eventType
        ] ||
        timelineTemplateMap
          .ENGINEERING_EVENT;

      const {
        filesChanged,
        commitMessages,
      } = getRawPayloadArrays(
        event.rawPayload,
      );

      const repository =
        await prisma.repository.findUnique({
          where: {
            id: repositoryId,
          },

          select: {
            name: true,
            fullName: true,
            description: true,
            language: true,
          },
        });

      const repositoryContext = [
        repository?.name,
        repository?.fullName,
        repository?.description,
        repository?.language,
      ]
        .filter(Boolean)
        .join(" ");

      /**
       * This fingerprint describes the CURRENT ENGINEERING EVENT.
       *
       * Future me:
       * A webhook event only contains the files and commit information
       * associated with that event.
       *
       * That evidence is useful for detecting:
       *
       * - technologies
       * - architecture domains
       * - architecture styles
       * - engineering signals
       *
       * It is NOT authoritative enough to redefine the purpose of the
       * entire repository.
       *
       * Canonical repository identity belongs to the full repository
       * intelligence generation pipeline and is persisted in
       * RepositoryIntelligenceSnapshot.
       */
      const eventFingerprint =
        detectTechnologyFingerprint(
          [
            ...filesChanged,
            repositoryContext,
          ],

          commitMessages,
        );

      console.log(
        "Engineering event fingerprint detected:",
        {
          repositoryId,
          eventId,

          technologies:
            eventFingerprint
              .technologies,

          architectureDomains:
            eventFingerprint
              .architectureDomains,

          engineeringSignals:
            eventFingerprint
              .engineeringSignals,
        },
      );

      const architectureStyles =
        detectArchitectureStyle({
          domains:
            eventFingerprint
              .architectureDomains,

          technologies:
            eventFingerprint
              .technologies,

          signals:
            eventFingerprint
              .engineeringSignals,

          /**
           * Event-scoped repository type inference is still allowed here
           * temporarily because architecture-style detection may use it.
           *
           * It is never persisted as canonical repository identity.
           */
          repositoryTypes:
            eventFingerprint
              .repositoryTypes,
        });

      console.log(
        "Architecture styles detected:",
        architectureStyles,
      );

      const architectureChanges =
        detectArchitectureChanges({
          eventType:
            event.eventType,

          rawPayload:
            event.rawPayload as
              Record<
                string,
                unknown
              >,
        });

      for (
        const change
        of architectureChanges
      ) {
        const existingChange =
          await prisma.architectureChange.findFirst({
            where: {
              repositoryId,

              changeType:
                change.changeType,

              summary:
                change.summary,

              fileAffected:
                change.fileAffected ||
                null,
            },
          });

        if (existingChange) {
          continue;
        }

        const mappedDomain =
          mapArchitectureDomain({
            changeType:
              change.changeType,

            fallbackDomains:
              eventFingerprint
                .architectureDomains,
          });

        const evolutionSummary =
          generateEvolutionSummary({
            changeType:
              change.changeType,

            architectureDomain:
              mappedDomain,

            detectedTechnology:
              change.detectedTechnology,

            fileAffected:
              change.fileAffected,
          });

        const architectureChange =
          await prisma.architectureChange.create({
            data: {
              repositoryId,

              changeType:
                change.changeType,

              detectedTechnology:
                change.detectedTechnology,

              fileAffected:
                change.fileAffected ||
                null,

              summary:
                change.summary,

              architectureDomain:
                mappedDomain,

              /**
               * Do NOT persist repository identity from this event.
               *
               * A single commit or pull request does not contain enough
               * evidence to redefine what the whole repository is.
               *
               * Canonical repository purpose is generated by:
               *
               * generateRepositoryIntelligence()
               *
               * and persisted inside RepositoryIntelligenceSnapshot.
               */
              repositoryTypes:
                null,

              /**
               * Event reasoning is still valid and useful historical
               * intelligence, so we preserve it.
               */
              reasoningSignals:
                eventFingerprint
                  .reasoningSignals
                  .join(" | "),

              evolutionSummary,
            },
          });

        await resolveRecommendationsFromDomains({
          repositoryId,
          detectedDomains: [
            mappedDomain,
          ],
          fileAffected:
            change.fileAffected ||
            null,
        });

        emitRealtimeEvent(
          "architecture-change:detected",
          {
            repositoryId,

            architectureChangeId:
              architectureChange.id,

            changeType:
              architectureChange
                .changeType,

            detectedTechnology:
              architectureChange
                .detectedTechnology,

            fileAffected:
              architectureChange
                .fileAffected,

            summary:
              architectureChange.summary,

            createdAt:
              architectureChange
                .createdAt,
          },
        );
      }

      const existingTimelineEntry =
        await prisma.timelineEntry.findFirst({
          where: {
            repositoryId,
            relatedEventId:
              eventId,
          },
        });

      if (
        !existingTimelineEntry
      ) {
        await prisma.timelineEntry.create({
          data: {
            repositoryId,

            relatedEventId:
              eventId,

            title:
              template?.title ||
              "Engineering activity recorded",

            summary:
              template?.summary ||
              "ArcHive recorded engineering activity for this repository.",

            importanceScore:
              template
                ?.importanceScore ||
              1,

            generatedByAI:
              false,
          },
        });
      }

      const completedEvent =
        await prisma.engineeringEvent.update({
          where: {
            id: eventId,
          },

          data: {
            status:
              ProcessingStatus.COMPLETED,
          },

          include: {
            repository: {
              select: {
                fullName: true,
              },
            },
          },
        });

      emitRealtimeEvent(
        "engineering-event:processed",
        {
          repositoryId,

          eventId:
            completedEvent.id,

          eventType:
            completedEvent
              .eventType,

          title:
            template?.title ||
            "Engineering activity recorded",

          repositoryFullName:
            completedEvent
              .repository
              .fullName,

          createdAt:
            completedEvent
              .createdAt,
        },
      );

      emitRealtimeEvent(
        "repository:updated",
        {
          repositoryId,

          repositoryFullName:
            completedEvent
              .repository
              .fullName,
        },
      );

      return {
        message:
          "Engineering event processed successfully",

        eventId,
      };
    },

    {
      connection:
        redisConnection as any,

      concurrency: 5,
    },
  );

worker.on(
  "completed",
  (job) => {
    console.log(
      `Engineering event job completed: ${job.id}`,
    );

    emitRealtimeEvent(
      "queue-job:completed",
      {
        jobId:
          job.id,

        name:
          job.name,

        status:
          "completed",

        repositoryId:
          job.data.repositoryId,

        eventId:
          job.data.eventId,

        finishedOn:
          job.finishedOn,
      },
    );
  },
);

worker.on(
  "failed",
  async (
    job,
    error,
  ) => {
    console.error(
      `Engineering event job failed: ${job?.id}`,
      error,
    );

    if (
      job?.data.eventId
    ) {
      await prisma.engineeringEvent.update({
        where: {
          id:
            job.data.eventId,
        },

        data: {
          status:
            ProcessingStatus.FAILED,
        },
      });
    }
  },
);

console.log(
  "ArcHive worker is running and waiting for engineering events...",
);
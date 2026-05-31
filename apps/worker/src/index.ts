import "dotenv/config";
import { Worker } from "bullmq";
import { prisma } from "@archive/database";
import { redisConnection, ProcessEngineeringEventJob } from "@archive/queue";
import { EngineeringEventType, ProcessingStatus } from "@prisma/client";
import { detectArchitectureChanges } from "@archive/detectors";

const timelineTemplateMap: Partial<
    Record<EngineeringEventType, { title: string; summary: string; importanceScore: number }>
> = {
    QUEUE_ADDED: {
        title: "Queue-based processing introduced",
        summary:
            "The repository introduced queue-based background processing, improving how long-running or asynchronous tasks are handled.",
        importanceScore: 5,
    },
    REDIS_ADDED: {
        title: "Redis infrastructure added",
        summary:
            "Redis was introduced to support caching, queues, sessions, rate limiting, or real-time infrastructure.",
        importanceScore: 4,
    },
    DOCKER_ADDED: {
        title: "Docker support introduced",
        summary:
            "Docker configuration was added to improve local development, deployment consistency, and environment portability.",
        importanceScore: 4,
    },
    DATABASE_CHANGE: {
        title: "Database architecture changed",
        summary:
            "The repository recorded a database-related change affecting persistence, schema design, or data access patterns.",
        importanceScore: 4,
    },
    PUSH: {
        title: "Code changes pushed",
        summary:
            "A push event was recorded for the repository. ArcHive stored the change for historical context, but no specific architecture pattern was detected.",
        importanceScore: 1,
    },
    UNKNOWN: {
        title: "Unclassified engineering activity recorded",
        summary:
            "ArcHive recorded engineering activity, but it was not classified as a major architecture change.",
        importanceScore: 1,
    },
    PR_MERGED: {
        title: "Pull request merged",
        summary:
            "A pull request was merged into the repository, representing a reviewed and accepted engineering change.",
        importanceScore: 3,
    },
    PULL_REQUEST: {
        title: "Pull request activity recorded",
        summary:
            "Pull request activity was recorded, helping preserve context around proposed engineering changes.",
        importanceScore: 2,
    },
    QUEUE_INFRASTRUCTURE_UPDATED: {
  title: "Queue processing updated",
  summary:
    "The repository updated queue-based background processing or job infrastructure.",
  importanceScore: 3,
},
REDIS_INFRASTRUCTURE_ADDED: {
  title: "Redis infrastructure added",
  summary:
    "Redis infrastructure was introduced to support caching, queues, sessions, rate limiting, or realtime workflows.",
  importanceScore: 4,
},
REDIS_INFRASTRUCTURE_UPDATED: {
  title: "Redis infrastructure updated",
  summary:
    "Redis-related infrastructure was updated, improving cache, queue, or realtime system behaviour.",
  importanceScore: 3,
},
DOCKER_INFRASTRUCTURE_CHANGED: {
  title: "Docker infrastructure added",
  summary:
    "Docker or container infrastructure was introduced for environment consistency and deployment readiness.",
  importanceScore: 4,
},
DOCKER_INFRASTRUCTURE_UPDATED: {
  title: "Docker infrastructure updated",
  summary:
    "Docker or container configuration was updated to improve environment or deployment consistency.",
  importanceScore: 3,
},
DATABASE_SCHEMA_CHANGED: {
  title: "Database schema changed",
  summary:
    "The repository introduced database schema or persistence-layer changes.",
  importanceScore: 4,
},
DATABASE_SCHEMA_UPDATED: {
  title: "Database schema updated",
  summary:
    "The repository updated database schema or persistence-layer behaviour.",
  importanceScore: 3,
},
API_ENDPOINT_CHANGED: {
  title: "API layer changed",
  summary:
    "The repository updated API routes, controllers, or service logic.",
  importanceScore: 3,
},
AUTH_SYSTEM_CHANGED: {
  title: "Auth system changed",
  summary:
    "The repository updated authentication or security-related logic.",
  importanceScore: 4,
},
DEPENDENCY_CHANGED: {
  title: "Dependencies changed",
  summary:
    "The repository updated project dependencies.",
  importanceScore: 2,
},
FRONTEND_UI_CHANGED: {
  title: "Frontend UI changed",
  summary:
    "The repository updated frontend UI or application components.",
  importanceScore: 2,
},
ENGINEERING_EVENT: {
  title: "Engineering activity recorded",
  summary:
    "ArcHive detected repository activity that could not yet be mapped to a known architecture category.",
  importanceScore: 1,
},
COMMIT_PUSHED: {
  title: "Code pushed",
  summary:
    "New code changes were pushed to the repository.",
  importanceScore: 1,
},
};

const worker = new Worker<ProcessEngineeringEventJob>(
    "engineering-event-processing",
    async (job) => {
        const { eventId, repositoryId } = job.data;

        // I mark the event as PROCESSING so I can see when a background job has actually started.
        const event = await prisma.engineeringEvent.update({
            where: { id: eventId },
            data: { status: ProcessingStatus.PROCESSING },
        });

        const template = timelineTemplateMap[event.eventType];

        if (!template) {
            await prisma.engineeringEvent.update({
                where: { id: eventId },
                data: { status: ProcessingStatus.COMPLETED },
            });

            return {
                message: "No timeline template found for this event type",
                eventType: event.eventType,
            };
        }

        const architectureChanges = detectArchitectureChanges({
            eventType: event.eventType,
            rawPayload: event.rawPayload as Record<string, unknown>,
        });

        // I let the worker create architecture memories because this is background intelligence,
        // not something the API request should be responsible for.
        for (const change of architectureChanges) {
            await prisma.architectureChange.create({
                data: {
                    repositoryId,
                    changeType: change.changeType,
                    detectedTechnology: change.detectedTechnology,
                    fileAffected: change.fileAffected,
                    summary: change.summary,
                },
            });
        }

        const existingTimelineEntry = await prisma.timelineEntry.findFirst({
            where: {
                repositoryId,
                relatedEventId: eventId,
            },
        });

        // I prevent duplicate timeline entries because retry jobs can run more than once.
        if (!existingTimelineEntry) {
            await prisma.timelineEntry.create({
                data: {
                    repositoryId,
                    relatedEventId: eventId,
                    title: template.title,
                    summary: template.summary,
                    importanceScore:
                        architectureChanges[0]?.importanceScore || template.importanceScore, generatedByAI: false,
                },
            });
        }

        await prisma.engineeringEvent.update({
            where: { id: eventId },
            data: { status: ProcessingStatus.COMPLETED },
        });

        return {
            message: "Engineering event processed successfully",
            eventId,
        };
    },
    {
        connection: redisConnection,
        concurrency: 5,
    }
);

worker.on("completed", (job) => {
    console.log(`Engineering event job completed: ${job.id}`);
});

worker.on("failed", async (job, error) => {
    console.error(`Engineering event job failed: ${job?.id}`, error);

    if (job?.data.eventId) {
        await prisma.engineeringEvent.update({
            where: { id: job.data.eventId },
            data: { status: ProcessingStatus.FAILED },
        });
    }
});

console.log("ArcHive worker is running and waiting for engineering events...");
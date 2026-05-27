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
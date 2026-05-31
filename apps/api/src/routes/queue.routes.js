"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueRoutes = void 0;
const fastify_1 = require("fastify");
const database_1 = require("@archive/database");
const queue_1 = require("@archive/queue");
const engineering_event_classifier_1 = require("../utils/engineering-event-classifier");
const QUEUE_NAME = "engineering-event-processing";
const getJobStatus = (job) => {
    if (job.failedReason)
        return "failed";
    if (job.finishedOn)
        return "processed";
    if (job.processedOn)
        return "active";
    return "waiting";
};
const getRepositoryHistory = async (repositoryId) => {
    if (!repositoryId) {
        return {
            hasQueueHistory: false,
            hasRedisHistory: false,
            hasDockerHistory: false,
            hasDatabaseHistory: false,
        };
    }
    const architectureHistory = await database_1.prisma.architectureChange.findMany({
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
        hasQueueHistory: historyText.includes("queue") || historyText.includes("bullmq"),
        hasRedisHistory: historyText.includes("redis"),
        hasDockerHistory: historyText.includes("docker"),
        hasDatabaseHistory: historyText.includes("database") || historyText.includes("schema"),
    };
};
const queueRoutes = async (app) => {
    app.get("/metrics", async () => {
        const counts = await queue_1.engineeringEventQueue.getJobCounts("waiting", "active", "completed", "failed", "delayed");
        return {
            success: true,
            message: "Queue metrics fetched successfully",
            data: {
                queueName: QUEUE_NAME,
                counts,
            },
        };
    });
    app.get("/recent-jobs", async () => {
        const jobs = await queue_1.engineeringEventQueue.getJobs(["waiting", "active", "completed", "failed", "delayed"], 0, 50, true);
        const mappedJobs = await Promise.all(jobs.map(async (job) => {
            const eventId = job.data?.eventId;
            const repositoryId = job.data?.repositoryId;
            const event = eventId
                ? await database_1.prisma.engineeringEvent.findUnique({
                    where: { id: eventId },
                    select: {
                        id: true,
                        eventType: true,
                        rawPayload: true,
                        repository: {
                            select: {
                                id: true,
                                name: true,
                                fullName: true,
                            },
                        },
                    },
                })
                : null;
            const repository = event?.repository
                ? event.repository
                : repositoryId
                    ? await database_1.prisma.repository.findUnique({
                        where: { id: repositoryId },
                        select: {
                            id: true,
                            name: true,
                            fullName: true,
                        },
                    })
                    : null;
            // ADDED: I load repository history before classifying the queue job.
            // This prevents repeated queue-related commits from always showing as "Queue Infrastructure Added".
            const history = await getRepositoryHistory(repository?.id || repositoryId);
            const classification = (0, engineering_event_classifier_1.classifyEngineeringEventForDashboard)({
                rawEventType: event?.eventType,
                rawPayload: event?.rawPayload,
                repositoryName: repository?.name || "Repository",
                // ADDED: pass history into the classifier so it can decide "added" vs "updated".
                history,
            });
            return {
                id: job.id,
                name: job.name,
                status: getJobStatus({
                    finishedOn: job.finishedOn,
                    processedOn: job.processedOn,
                    failedReason: job.failedReason,
                }),
                attemptsMade: job.attemptsMade,
                failedReason: job.failedReason,
                timestamp: job.timestamp,
                processedOn: job.processedOn,
                finishedOn: job.finishedOn,
                queueName: QUEUE_NAME,
                data: {
                    eventId,
                    repositoryId,
                    repositoryName: repository?.name || null,
                    repositoryFullName: repository?.fullName || null,
                    eventType: classification.eventType,
                    eventTitle: classification.title,
                },
            };
        }));
        const recentJobs = mappedJobs
            // I sort again after enrichment so the dashboard always receives newest jobs first.
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10);
        return {
            success: true,
            message: "Recent queue jobs fetched successfully",
            data: recentJobs,
        };
    });
};
exports.queueRoutes = queueRoutes;
//# sourceMappingURL=queue.routes.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserDashboardSummary = void 0;
const database_1 = require("@archive/database");
const queue_1 = require("@archive/queue");
const engineering_event_classifier_1 = require("../utils/engineering-event-classifier");
const getUserDashboardSummary = async (userId) => {
    const user = await database_1.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
    });
    if (!user) {
        return null;
    }
    const trackedRepositories = await database_1.prisma.repository.findMany({
        where: { userId },
        select: {
            id: true,
            name: true,
            fullName: true,
            _count: {
                select: {
                    events: true,
                    architectureChanges: true,
                },
            },
        },
    });
    const repositoryIds = trackedRepositories.map((repo) => repo.id);
    const [engineeringEvents, timelineEntries, architectureChanges, queueMetrics, recentEngineeringEvents,] = await Promise.all([
        database_1.prisma.engineeringEvent.count({
            where: {
                repositoryId: { in: repositoryIds },
            },
        }),
        database_1.prisma.timelineEntry.count({
            where: {
                repositoryId: { in: repositoryIds },
            },
        }),
        database_1.prisma.architectureChange.count({
            where: {
                repositoryId: { in: repositoryIds },
            },
        }),
        // I keep queue metrics global because the queue is ArcHive infrastructure,
        // not something owned by one specific user's repository list.
        queue_1.engineeringEventQueue.getJobCounts("waiting", "active", "completed", "failed", "delayed"),
        database_1.prisma.engineeringEvent.findMany({
            where: {
                repositoryId: { in: repositoryIds },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 6,
            select: {
                id: true,
                eventType: true,
                source: true,
                createdAt: true,
                rawPayload: true,
                repository: {
                    select: {
                        // I need repository id so I can check this repo's previous architecture history.
                        id: true,
                        name: true,
                        fullName: true,
                    },
                },
            },
        }),
    ]);
    const repositoryIntelligence = trackedRepositories.map((repo) => ({
        name: repo.name,
        fullName: repo.fullName,
        events: repo._count.events,
        architectureChanges: repo._count.architectureChanges,
    }));
    // This lets ArcHive say "Queue Infrastructure Added" the first time,
    // and "Queue Processing Updated" when queue-related work happens later.
    const recentEngineeringEventsWithClassification = await Promise.all(recentEngineeringEvents.map(async (event) => {
        const architectureHistory = await database_1.prisma.architectureChange.findMany({
            where: {
                repositoryId: event.repository.id,
            },
            select: {
                changeType: true,
                detectedTechnology: true,
                createdAt: true,
            },
        });
        const currentEventCreatedAt = new Date(event.createdAt).getTime();
        // I only consider architecture changes before this event.
        // That prevents the current event from making itself look like "existing history".
        const previousHistory = architectureHistory.filter((change) => new Date(change.createdAt).getTime() < currentEventCreatedAt);
        const historyText = previousHistory
            .map((change) => `${change.changeType} ${change.detectedTechnology || ""}`)
            .join(" ")
            .toLowerCase();
        const classification = (0, engineering_event_classifier_1.classifyEngineeringEventForDashboard)({
            rawEventType: event.eventType,
            rawPayload: event.rawPayload,
            repositoryName: event.repository.name,
            // The classifier can now know if queue/Redis/Docker/database history already exists.
            history: {
                hasQueueHistory: historyText.includes("queue") || historyText.includes("bullmq"),
                hasRedisHistory: historyText.includes("redis"),
                hasDockerHistory: historyText.includes("docker"),
                hasDatabaseHistory: historyText.includes("database") || historyText.includes("schema"),
            },
        });
        return {
            id: event.id,
            eventType: classification.eventType,
            title: classification.title,
            summary: classification.summary,
            source: event.source || "unknown",
            createdAt: event.createdAt,
            repositoryName: event.repository.name,
            repositoryFullName: event.repository.fullName,
        };
    }));
    return {
        repositories: trackedRepositories.length,
        engineeringEvents,
        timelineEntries,
        architectureChanges,
        queueMetrics,
        recentEngineeringEvents: recentEngineeringEventsWithClassification,
        repositoryIntelligence,
    };
};
exports.getUserDashboardSummary = getUserDashboardSummary;
//# sourceMappingURL=user-dashboard.service.js.map
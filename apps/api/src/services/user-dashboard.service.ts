import { prisma } from "@archive/database";
import { engineeringEventQueue } from "@archive/queue";
import { classifyEngineeringEventForDashboard } from "../utils/engineering-event-classifier";


const humanizeEventType = (eventType?: string | null) => {
    if (!eventType || eventType.trim().length === 0) {
        return "Engineering Event";
    }

    return eventType
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

const buildEventSummary = ({
    eventType,
    repositoryName,
}: {
    eventType: string;
    repositoryName: string;
}) => {
    const summaries: Record<string, string> = {
        QUEUE_ADDED: `${repositoryName} introduced queue-based background processing.`,
        REDIS_ADDED: `${repositoryName} added Redis infrastructure for caching, queues, or realtime workflows.`,
        DOCKER_ADDED: `${repositoryName} added Docker support for environment consistency.`,
        DATABASE_CHANGE: `${repositoryName} recorded a database-level architecture change.`,
        PR_MERGED: `${repositoryName} merged a pull request into the codebase.`,
        PULL_REQUEST: `${repositoryName} recorded pull request activity.`,
        UNKNOWN: `${repositoryName} recorded engineering activity that was not classified into a specific architecture category.`,
    };

    return (
        summaries[eventType] ||
        `${repositoryName} recorded a ${humanizeEventType(eventType).toLowerCase()} event.`
    );
};

export const getUserDashboardSummary = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
    });

    if (!user) {
        return null;
    }



    const trackedRepositories = await prisma.repository.findMany({
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

    const [
        engineeringEvents,
        timelineEntries,
        architectureChanges,
        queueMetrics,
        recentEngineeringEvents,
    ] = await Promise.all([
        prisma.engineeringEvent.count({
            where: {
                repositoryId: { in: repositoryIds },
            },
        }),

        prisma.timelineEntry.count({
            where: {
                repositoryId: { in: repositoryIds },
            },
        }),

        prisma.architectureChange.count({
            where: {
                repositoryId: { in: repositoryIds },
            },
        }),

        // I keep queue metrics global because the queue is ArcHive infrastructure,
        // not something owned by one specific user's repository list.
        engineeringEventQueue.getJobCounts(
            "waiting",
            "active",
            "completed",
            "failed",
            "delayed"
        ),

        prisma.engineeringEvent.findMany({
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

    return {
        repositories: trackedRepositories.length,
        engineeringEvents,
        timelineEntries,
        architectureChanges,
        queueMetrics,
        recentEngineeringEvents: recentEngineeringEvents.map((event) => {
            const classification = classifyEngineeringEventForDashboard({
                rawEventType: event.eventType,
                rawPayload: event.rawPayload as Record<string, any>,
                repositoryName: event.repository.name,
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
        }),
        repositoryIntelligence,
    };


};
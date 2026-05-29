import { prisma } from "@archive/database";
import { engineeringEventQueue } from "@archive/queue";

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
    recentEngineeringEvents: recentEngineeringEvents.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      source: event.source,
      createdAt: event.createdAt,
      repositoryName: event.repository.name,
      repositoryFullName: event.repository.fullName,
    })),
    repositoryIntelligence,
  };
};
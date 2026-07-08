import { prisma } from "@archive/database";

export const adminActivityService = {
  async getActivity(limit = 30) {
    const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 100);

    const [timelineEntries, engineeringEvents, architectureChanges] =
      await Promise.all([
        prisma.timelineEntry.findMany({
          orderBy: { createdAt: "desc" },
          take: safeLimit,
          select: {
            id: true,
            title: true,
            summary: true,
            createdAt: true,
            repository: {
              select: {
                id: true,
                name: true,
                fullName: true,
              },
            },
          },
        }),
        prisma.engineeringEvent.findMany({
          orderBy: { createdAt: "desc" },
          take: safeLimit,
          select: {
            id: true,
            eventType: true,
            status: true,
            occurredAt: true,
            createdAt: true,
            repository: {
              select: {
                id: true,
                name: true,
                fullName: true,
              },
            },
          },
        }),
        prisma.architectureChange.findMany({
          orderBy: { createdAt: "desc" },
          take: safeLimit,
          select: {
            id: true,
            changeType: true,
            summary: true,
            createdAt: true,
            repository: {
              select: {
                id: true,
                name: true,
                fullName: true,
              },
            },
          },
        }),
      ]);

    const activity = [
      ...timelineEntries.map((entry) => ({
        id: `timeline-${entry.id}`,
        type: "TIMELINE",
        title: entry.title,
        description: entry.summary,
        createdAt: entry.createdAt,
        repository: entry.repository,
      })),
      ...engineeringEvents.map((event) => ({
        id: `event-${event.id}`,
        type: "ENGINEERING_EVENT",
        title: event.eventType,
        description: `Engineering event processed with status ${event.status}.`,
        createdAt: event.createdAt,
        repository: event.repository,
      })),
      ...architectureChanges.map((change) => ({
        id: `architecture-${change.id}`,
        type: "ARCHITECTURE_CHANGE",
        title: change.changeType,
        description: change.summary,
        createdAt: change.createdAt,
        repository: change.repository,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, safeLimit);

    return activity;
  },
};
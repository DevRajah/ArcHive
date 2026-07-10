import { prisma } from "@archive/database";

export const adminActivityService = {
  async getActivity(limit = 30) {
    const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 100);

    const [
      adminActivities,
      timelineEntries,
      engineeringEvents,
      architectureChanges,
    ] = await Promise.all([
      prisma.adminActivity.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: safeLimit,
        select: {
          id: true,
          action: true,
          actorUserId: true,
          actorUsername: true,
          repositoryId: true,
          repositoryName: true,
          repositoryFullName: true,
          description: true,
          metadata: true,
          createdAt: true,
        },
      }),

      prisma.timelineEntry.findMany({
        orderBy: {
          createdAt: "desc",
        },
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
        orderBy: {
          createdAt: "desc",
        },
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
        orderBy: {
          createdAt: "desc",
        },
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

    return [
      ...adminActivities.map((activity) => ({
        id: `admin-${activity.id}`,
        type: "ADMIN_AUDIT",
        action: activity.action,
        title: formatActionTitle(activity.action),
        description:
          activity.description ||
          buildAdminActivityDescription({
            action: activity.action,
            actorUsername: activity.actorUsername,
            repositoryFullName: activity.repositoryFullName,
          }),
        createdAt: activity.createdAt,
        actor: {
          userId: activity.actorUserId,
          username: activity.actorUsername,
        },
        repository: activity.repositoryId
          ? {
              id: activity.repositoryId,
              name: activity.repositoryName,
              fullName: activity.repositoryFullName,
              deleted: activity.action === "REPOSITORY_DELETED",
            }
          : null,
        metadata: activity.metadata,
      })),

      ...timelineEntries.map((entry) => ({
        id: `timeline-${entry.id}`,
        type: "TIMELINE",
        action: null,
        title: entry.title,
        description: entry.summary,
        createdAt: entry.createdAt,
        actor: null,
        repository: {
          ...entry.repository,
          deleted: false,
        },
        metadata: null,
      })),

      ...engineeringEvents.map((event) => ({
        id: `event-${event.id}`,
        type: "ENGINEERING_EVENT",
        action: event.eventType,
        title: formatActionTitle(event.eventType),
        description: `Engineering event processed with status ${event.status}.`,
        createdAt: event.createdAt,
        actor: null,
        repository: {
          ...event.repository,
          deleted: false,
        },
        metadata: {
          status: event.status,
          occurredAt: event.occurredAt,
        },
      })),

      ...architectureChanges.map((change) => ({
        id: `architecture-${change.id}`,
        type: "ARCHITECTURE_CHANGE",
        action: change.changeType,
        title: formatActionTitle(change.changeType),
        description: change.summary,
        createdAt: change.createdAt,
        actor: null,
        repository: {
          ...change.repository,
          deleted: false,
        },
        metadata: null,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, safeLimit);
  },
};

const formatActionTitle = (value: string) => {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const buildAdminActivityDescription = ({
  action,
  actorUsername,
  repositoryFullName,
}: {
  action: string;
  actorUsername: string | null;
  repositoryFullName: string | null;
}) => {
  const actor = actorUsername || "An administrator";
  const repository = repositoryFullName || "a repository";

  if (action === "REPOSITORY_DELETED") {
    return `${actor} deleted ${repository}.`;
  }

  if (action === "REPOSITORY_REPROCESSED") {
    return `${actor} reprocessed ${repository}.`;
  }

  if (action === "INTELLIGENCE_REFRESHED") {
    return `${actor} refreshed intelligence for ${repository}.`;
  }

  return `${actor} performed ${formatActionTitle(action)} on ${repository}.`;
};
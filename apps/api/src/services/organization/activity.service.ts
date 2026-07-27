import {
  OrganizationActivityFeed,
  OrganizationActivityItem,
  OrganizationQueryOptions,
} from "../../types/organization.types";

import {
  loadOrganizationRepositories,
} from "./organization.utils";

/**
 * Builds a single activity feed by combining events from all
 * tracked repositories.
 */
export const getOrganizationActivityFeed = async (
  options: OrganizationQueryOptions,
): Promise<OrganizationActivityFeed> => {
  const page = options.activityPage ?? 1;
  const limit = options.activityLimit ?? 25;

  const repositories =
    await loadOrganizationRepositories(options.userId);

  const activities: OrganizationActivityItem[] = [];

  for (const repository of repositories) {
    for (const event of repository.events) {
      activities.push({
        id: event.id,

        repositoryId: repository.id,

        repositoryName: repository.name,

        repositoryFullName: repository.fullName,

        type: "ENGINEERING_EVENT",

        title: event.eventType,

        description: `Engineering event detected: ${event.eventType}`,

        timestamp: event.occurredAt,

        metadata: {},
      });
    }

    for (const change of repository.architectureChanges) {
      activities.push({
        id: change.id,

        repositoryId: repository.id,

        repositoryName: repository.name,

        repositoryFullName: repository.fullName,

        type: "ARCHITECTURE_CHANGE",

        title: change.changeType,

        description: change.summary,

        timestamp: change.createdAt,

        metadata: {},
      });
    }

    for (const timeline of repository.timelineEntries) {
      activities.push({
        id: timeline.id,

        repositoryId: repository.id,

        repositoryName: repository.name,

        repositoryFullName: repository.fullName,

        type: "TIMELINE_ENTRY",

        title: timeline.title,

        description: timeline.summary,

        timestamp: timeline.createdAt,

        metadata: {},
      });
    }
  }

  activities.sort(
    (left, right) =>
      right.timestamp.getTime() -
      left.timestamp.getTime(),
  );

  const start = (page - 1) * limit;
  const items = activities.slice(
    start,
    start + limit,
  );

  return {
    items,

    pagination: {
      page,

      limit,

      totalItems: activities.length,

      totalPages: Math.ceil(
        activities.length / limit,
      ),

      hasNextPage:
        start + limit < activities.length,

      hasPreviousPage: page > 1,
    },
  };
};
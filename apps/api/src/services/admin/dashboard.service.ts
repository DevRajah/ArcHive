import { prisma } from "@archive/database";

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export const adminDashboardService = {
  async getDashboard() {
    const today = startOfToday();

    const [
      totalUsers,
      totalRepositories,
      trackedRepositories,
      totalArchitectureChanges,
      totalTimelineEvents,
      repositoriesImportedToday,
      repositoriesReprocessedToday,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.repository.count(),

      prisma.repository.count({
        where: {
          isTracked: true,
        },
      }),

      prisma.architectureChange.count(),

      prisma.timelineEntry.count(),

      prisma.repository.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),

      prisma.architectureChange.count({
        where: {
          changeType: "REPOSITORY_INTELLIGENCE_REPROCESSED",
          createdAt: {
            gte: today,
          },
        },
      }),
    ]);

    return {
      totalUsers,
      totalRepositories,
      trackedRepositories,
      totalArchitectureChanges,
      totalTimelineEvents,

      // For now, one generated architecture intelligence row represents one engineering report.
      // Later, if we create a dedicated EngineeringReport table, this can point there instead.
      totalEngineeringReports: repositoriesReprocessedToday,

      repositoriesImportedToday,
      repositoriesReprocessedToday,
    };
  },
};
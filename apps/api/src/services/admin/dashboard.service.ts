import { prisma } from "@archive/database";
import { GENERATED_CHANGE_TYPE } from "../../constants/intelligence.constants";

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
      totalEngineeringRecommendations,
      repositoriesImportedToday,
      repositoriesReprocessedToday,
      failedEvents,
      completedEvents,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.repository.count(),
      prisma.repository.count({ where: { isTracked: true } }),
      prisma.architectureChange.count(),
      prisma.timelineEntry.count(),
      prisma.engineeringRecommendation.count(),
      prisma.repository.count({ where: { createdAt: { gte: today } } }),
      prisma.architectureChange.count({
        where: {
          changeType: GENERATED_CHANGE_TYPE,
          createdAt: { gte: today },
        },
      }),
      prisma.engineeringEvent.count({ where: { status: "FAILED" } }),
      prisma.engineeringEvent.count({ where: { status: "COMPLETED" } }),
    ]);

    return {
      totalUsers,
      totalRepositories,
      trackedRepositories,
      totalArchitectureChanges,
      totalTimelineEvents,
      totalEngineeringReports: await prisma.architectureChange.count({
        where: { changeType: GENERATED_CHANGE_TYPE },
      }),
      totalEngineeringRecommendations,
      repositoriesImportedToday,
      repositoriesReprocessedToday,
      eventProcessing: {
        completed: completedEvents,
        failed: failedEvents,
      },
    };
  },
};
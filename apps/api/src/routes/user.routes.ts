import { FastifyInstance } from "fastify";
import { prisma } from "@archive/database";

export const userRoutes = async (app: FastifyInstance) => {
  app.get("/:userId/dashboard", async (request, reply) => {
    const { userId } = request.params as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        repositories: {
          include: {
            events: true,
            timelineEntries: true,
            architectureChanges: true,
          },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const repositories = user.repositories;

    const totalRepositories = repositories.length;

    const totalEngineeringEvents = repositories.reduce(
      (sum, repo) => sum + repo.events.length,
      0
    );

    const totalTimelineEntries = repositories.reduce(
      (sum, repo) => sum + repo.timelineEntries.length,
      0
    );

    const totalArchitectureChanges = repositories.reduce(
      (sum, repo) => sum + repo.architectureChanges.length,
      0
    );

    // I rank repositories by engineering activity so the dashboard surfaces the most active projects first.
    const repositoryActivity = repositories
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.fullName,
        eventCount: repo.events.length,
        timelineCount: repo.timelineEntries.length,
        architectureChangeCount: repo.architectureChanges.length,
      }))
      .sort((a, b) => b.eventCount - a.eventCount);

    const recentTimelineEntries = repositories
      .flatMap((repo) =>
        repo.timelineEntries.map((entry) => ({
          repositoryName: repo.name,
          repositoryFullName: repo.fullName,
          entry,
        }))
      )
      .sort(
        (a, b) =>
          new Date(b.entry.createdAt).getTime() -
          new Date(a.entry.createdAt).getTime()
      )
      .slice(0, 15);

    return {
      success: true,
      message: "User dashboard fetched successfully",
      data: {
        user: {
          id: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl,
        },

        metrics: {
          totalRepositories,
          totalEngineeringEvents,
          totalTimelineEntries,
          totalArchitectureChanges,
        },

        mostActiveRepositories: repositoryActivity,

        recentTimelineEntries,
      },
    };
  });
};
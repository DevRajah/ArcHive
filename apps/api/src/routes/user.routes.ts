import { FastifyInstance } from "fastify";
import { prisma } from "@archive/database";

export const userRoutes = async (app: FastifyInstance) => {
  app.get("/:userId/dashboard", async (request, reply) => {
    const { userId } = request.params as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return reply.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const repositories = await prisma.repository.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: {
            events: true,
            timelineEntries: true,
            architectureChanges: true,
          },
        },
      },
    });

    const repositoryIds = repositories.map((repo) => repo.id);

    const [
      totalEngineeringEvents,
      totalTimelineEntries,
      totalArchitectureChanges,
      recentTimelineEntries,
      recentEvents,
    ] = await Promise.all([
      prisma.engineeringEvent.count({
        where: { repositoryId: { in: repositoryIds } },
      }),
      prisma.timelineEntry.count({
        where: { repositoryId: { in: repositoryIds } },
      }),
      prisma.architectureChange.count({
        where: { repositoryId: { in: repositoryIds } },
      }),
      prisma.timelineEntry.findMany({
        where: { repositoryId: { in: repositoryIds } },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          repository: {
            select: {
              name: true,
              fullName: true,
            },
          },
        },
      }),
      prisma.engineeringEvent.findMany({
        where: { repositoryId: { in: repositoryIds } },
        orderBy: { occurredAt: "desc" },
        take: 10,
        include: {
          repository: {
            select: {
              name: true,
              fullName: true,
            },
          },
        },
      }),
    ]);

    // I calculate repo activity from database counts instead of loading every event into memory.
    const mostActiveRepositories = repositories
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.fullName,
        description: repo.description,
        defaultBranch: repo.defaultBranch,
        eventCount: repo._count.events,
        timelineCount: repo._count.timelineEntries,
        architectureChangeCount: repo._count.architectureChanges,
      }))
      .sort((a, b) => b.eventCount - a.eventCount);

    return {
      success: true,
      message: "User dashboard fetched successfully",
      data: {
        user,
        metrics: {
          totalRepositories: repositories.length,
          totalEngineeringEvents,
          totalTimelineEntries,
          totalArchitectureChanges,
        },
        mostActiveRepositories,
        recentTimelineEntries,
        recentEvents,
      },
    };
  });
};
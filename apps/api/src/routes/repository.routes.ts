import { FastifyInstance } from "fastify";
import { prisma } from "@archive/database";
import axios from "axios";
import { engineeringEventQueue } from "@archive/queue";

type CreateRepositoryBody = {
  name: string;
  owner: string;
  fullName: string;
  description?: string;
  defaultBranch?: string;
};

export const repositoryRoutes = async (app: FastifyInstance) => {
  app.post<{ Body: CreateRepositoryBody }>("/", async (request, reply) => {
    const { name, owner, fullName, description, defaultBranch } = request.body;

    if (!name || !owner || !fullName) {
      return reply.status(400).send({
        success: false,
        message: "name, owner and fullName are required",
      });
    }

    const existingRepository = await prisma.repository.findUnique({
      where: { fullName },
    });

    if (existingRepository) {
      return reply.status(409).send({
        success: false,
        message: "Repository already exists",
      });
    }

    const repository = await prisma.repository.create({
      data: {
        name,
        owner,
        fullName,
        description,
        defaultBranch: defaultBranch || "main",
      },
    });

    return reply.status(201).send({
      success: true,
      message: "Repository created successfully",
      data: repository,
    });
  });

  app.get("/", async () => {
    const repositories = await prisma.repository.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      message: "Repositories fetched successfully",
      data: repositories,
    };
  });

  app.get<{ Params: { repositoryId: string } }>("/:repositoryId", async (request, reply) => {
    const { repositoryId } = request.params;

    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
      include: {
        timelineEntries: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        architectureChanges: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        events: {
          orderBy: { occurredAt: "desc" },
          take: 5,
        },
      },
    });

    if (!repository) {
      return reply.status(404).send({
        success: false,
        message: "Repository not found",
      });
    }

    const latestEngineeringEvent = repository.events?.[0];

    const getWebhookStatus = async () => {
      if (!repository.userId) return "MISSING";

      const publicWebhookUrl = process.env.PUBLIC_WEBHOOK_URL;

      if (!publicWebhookUrl) return "MISSING";

      const user = await prisma.user.findUnique({
        where: { id: repository.userId },
        select: { githubAccessToken: true },
      });

      if (!user?.githubAccessToken) return "MISSING";

      try {
        const webhookUrl = `${publicWebhookUrl}/api/github/webhook`;

        const hooksResponse = await axios.get(
          `https://api.github.com/repos/${repository.fullName}/hooks`,
          {
            headers: {
              Authorization: `Bearer ${user.githubAccessToken}`,
              Accept: "application/vnd.github+json",
            },
          }
        );

        const matchingHook = hooksResponse.data.find(
          (hook: any) => hook.active === true && hook.config?.url === webhookUrl
        );

        return matchingHook ? "CONNECTED" : "MISSING";
      } catch {
        return "MISSING";
      }
    };

    const getLastQueueStatus = async () => {
      try {
        const jobs = await engineeringEventQueue.getJobs(
          ["completed", "failed", "active", "waiting", "delayed"],
          0,
          50,
          true
        );

        const matchingJob = jobs.find(
          (job) =>
            job.data?.repositoryId === repository.id ||
            job.data?.eventId === latestEngineeringEvent?.id
        );

        if (!matchingJob) {
          return latestEngineeringEvent?.status?.toLowerCase() || "unknown";
        }

        if (matchingJob.failedReason) return "failed";
        if (matchingJob.finishedOn) return "completed";
        if (matchingJob.processedOn) return "processing";

        return "waiting";
      } catch {
        return latestEngineeringEvent?.status?.toLowerCase() || "unknown";
      }
    };

    const trackingStatus = {
      isTracked: Boolean(repository.userId),
      webhookStatus: await getWebhookStatus(),
      lastEngineeringEventAt: latestEngineeringEvent?.createdAt || null,
      lastQueueStatus: await getLastQueueStatus(),
      realtimeStatus: "CONNECTED",
    };

    return {
      success: true,
      message: "Repository details fetched successfully",
      data: {
        ...repository,
        trackingStatus,
      },
    };
  });

  //mini dashboard
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/overview",
    async (request, reply) => {
      const { repositoryId } = request.params;

      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId },
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

      if (!repository) {
        return reply.status(404).send({
          success: false,
          message: "Repository not found",
        });
      }

      const [recentEvents, recentTimelineEntries, recentArchitectureChanges] =
        await Promise.all([
          prisma.engineeringEvent.findMany({
            where: { repositoryId },
            orderBy: { occurredAt: "desc" },
            take: 10,
          }),
          prisma.timelineEntry.findMany({
            where: { repositoryId },
            orderBy: { createdAt: "desc" },
            take: 10,
          }),
          prisma.architectureChange.findMany({
            where: { repositoryId },
            orderBy: { createdAt: "desc" },
            take: 10,
          }),
        ]);

      return {
        success: true,
        message: "Repository overview fetched successfully",
        data: {
          repository,
          metrics: {
            totalEvents: repository._count.events,
            totalTimelineEntries: repository._count.timelineEntries,
            totalArchitectureChanges: repository._count.architectureChanges,
          },
          recentEvents,
          recentTimelineEntries,
          recentArchitectureChanges,
        },
      };
    }
  );

  //reset repo for dev testing - not exposed in frontend
  app.delete("/reset-user-repositories/:userId", async (request, reply) => {
    const { userId } = request.params as { userId: string };

    const result = await prisma.repository.updateMany({
      where: { userId },
      data: { userId: null },
    });

    return {
      success: true,
      message: "User repositories detached successfully",
      data: {
        detachedCount: result.count,
      },
    };
  });
};
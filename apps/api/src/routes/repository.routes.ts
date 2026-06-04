import { FastifyInstance } from "fastify";
import { prisma } from "@archive/database";
import axios from "axios";
import { engineeringEventQueue } from "@archive/queue";
import { detectArchitectureStyle } from "@archive/detectors";

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
            orderBy: { createdAt: "desc" },
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

      const latestEngineeringEvent = recentEvents[0];

      const trackingStatus = {
        isTracked: Boolean(repository.userId),

        // For now, this tells the frontend whether this repo is actively connected
        // through ArcHive's webhook import/tracking flow.
        webhookStatus: repository.userId ? "CONNECTED" : "MISSING",

        lastEngineeringEventAt: latestEngineeringEvent?.createdAt || null,

        lastQueueStatus: latestEngineeringEvent?.status
          ? latestEngineeringEvent.status.toLowerCase()
          : "unknown",

        // The API owns the Socket.IO server, so if this route is reachable,
        // the realtime pipeline is considered available.
        realtimeStatus: "CONNECTED",
      };

      return {
        success: true,
        message: "Repository overview fetched successfully",
        data: {
          repository: {
            id: repository.id,
            githubRepoId: repository.githubRepoId,
            name: repository.name,
            owner: repository.owner,
            fullName: repository.fullName,
            description: repository.description,
            defaultBranch: repository.defaultBranch,
            language: repository.language,
            stars: repository.stars,
            forks: repository.forks,
            userId: repository.userId,
            createdAt: repository.createdAt,
            updatedAt: repository.updatedAt,
          },

          metrics: {
            totalEvents: repository._count.events,
            totalTimelineEntries: repository._count.timelineEntries,
            totalArchitectureChanges: repository._count.architectureChanges,
          },

          trackingStatus,

          recentEvents,
          recentTimelineEntries,
          recentArchitectureChanges,
        },
      };
    }
  );
  //detailed architecture evolution analysis
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/architecture-evolution",
    async (request, reply) => {
      const { repositoryId } = request.params;

      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId },
        select: {
          id: true,
          name: true,
          owner: true,
          fullName: true,
          description: true,
          defaultBranch: true,
          language: true,
          stars: true,
          forks: true,
          userId: true,
        },
      });

      if (!repository) {
        return reply.status(404).send({
          success: false,
          message: "Repository not found",
        });
      }

      const architectureChanges = await prisma.architectureChange.findMany({
        where: { repositoryId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          changeType: true,
          detectedTechnology: true,
          fileAffected: true,
          summary: true,
          architectureDomain: true,
          evolutionSummary: true,
          createdAt: true,
        },
      });

      const groupedByDomain = architectureChanges.reduce<
        Record<string, typeof architectureChanges>
      >((groups, change) => {
        const domain = change.architectureDomain || "GENERAL_ARCHITECTURE";

        if (!groups[domain]) {
          groups[domain] = [];
        }

        groups[domain].push(change);

        return groups;
      }, {});

      const domains = Object.entries(groupedByDomain).map(([domain, changes]) => {
        const latestChange = changes[0];

        return {
          domain,
          label: domain
            .toLowerCase()
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          totalChanges: changes.length,
          latestChangeAt: latestChange?.createdAt || null,
          technologies: Array.from(
            new Set(
              changes
                .map((change) => change.detectedTechnology)
                .filter((technology): technology is string => Boolean(technology))
            )
          ),
          changes,
        };
      });

      const architectureStyles = detectArchitectureStyle({
        domains: domains.map((domain) => domain.domain),
        technologies: domains.flatMap(
          (domain) => domain.technologies
        ),
        signals: [],
      });

      const detectedCapabilities = domains.map((domain) => domain.label);

      const capabilitySet = new Set(domains.map((domain) => domain.domain));

      const expectedCapabilities = [
        { domain: "FRONTEND_ARCHITECTURE", label: "Frontend Architecture" },
        { domain: "API_LAYER", label: "API Layer" },
        { domain: "AUTHENTICATION", label: "Authentication" },
        { domain: "REALTIME_SYSTEMS", label: "Realtime Systems" },
        { domain: "QUEUE_INFRASTRUCTURE", label: "Queue Infrastructure" },
        { domain: "DATABASE_LAYER", label: "Database Layer" },
        { domain: "CACHING_LAYER", label: "Caching Layer" },
        { domain: "DEVOPS_INFRASTRUCTURE", label: "DevOps Infrastructure" },
        { domain: "DEPENDENCY_MANAGEMENT", label: "Dependency Management" },
      ];

      const missingCapabilities = expectedCapabilities
        .filter((capability) => !capabilitySet.has(capability.domain))
        .map((capability) => capability.label);

      const mostActiveDomain = domains.sort(
        (a, b) => b.totalChanges - a.totalChanges
      )[0];

      const architectureMaturityScore = Math.min(
        100,
        detectedCapabilities.length * 10 + architectureChanges.length * 2
      );

      const infrastructureDepth =
        architectureMaturityScore >= 75
          ? "HIGH"
          : architectureMaturityScore >= 45
            ? "MEDIUM"
            : "EARLY";

      return {
        success: true,
        message: "Repository architecture evolution fetched successfully",
        data: {
          repository,
          summary: {
            totalArchitectureChanges: architectureChanges.length,
            totalDomains: domains.length,
            mostActiveDomain: mostActiveDomain?.domain || null,
          },
          insights: {
            architectureMaturityScore,
            infrastructureDepth,
            dominantDomain: mostActiveDomain?.domain || null,
            detectedCapabilities,
            missingCapabilities,
            architectureStyles,
          },
          domains,
        },
      };
    }
  );
  //detailed architecture analysis
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/architecture",
    async (request, reply) => {
      const { repositoryId } = request.params;

      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId },
        select: {
          id: true,
          userId: true,
        },
      });

      if (!repository) {
        return reply.status(404).send({
          success: false,
          message: "Repository not found",
        });
      }

      const architectureChanges = await prisma.architectureChange.findMany({
        where: {
          repositoryId,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          changeType: true,
          detectedTechnology: true,
          fileAffected: true,
          summary: true,
          architectureDomain: true,
          evolutionSummary: true,
          createdAt: true,
        },
      });

      return {
        success: true,
        message: "Repository architecture changes fetched successfully",
        data: architectureChanges,
      };
    }
  );
  //capabilities analysis
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/capabilities",
    async (request, reply) => {
      const { repositoryId } = request.params;

      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId },
        select: {
          id: true,
          name: true,
          fullName: true,
          userId: true,
        },
      });

      if (!repository) {
        return reply.status(404).send({
          success: false,
          message: "Repository not found",
        });
      }

      const architectureChanges = await prisma.architectureChange.findMany({
        where: { repositoryId },
        select: {
          architectureDomain: true,
          detectedTechnology: true,
          changeType: true,
        },
      });

      const domains = new Set(
        architectureChanges
          .map((change) => change.architectureDomain)
          .filter((domain): domain is string => Boolean(domain))
      );

      const technologies = new Set(
        architectureChanges
          .map((change) => change.detectedTechnology)
          .filter((technology): technology is string => Boolean(technology))
      );

      const capabilities = {
        frontendArchitecture: domains.has("FRONTEND_ARCHITECTURE"),
        apiLayer: domains.has("API_LAYER"),
        authentication: domains.has("AUTHENTICATION"),
        realtimeSystems: domains.has("REALTIME_SYSTEMS"),
        queueInfrastructure: domains.has("QUEUE_INFRASTRUCTURE"),
        databaseLayer: domains.has("DATABASE_LAYER"),
        cachingLayer:
          domains.has("CACHING_LAYER") ||
          Array.from(technologies).some((tech) =>
            tech.toLowerCase().includes("redis")
          ),
        devopsInfrastructure: domains.has("DEVOPS_INFRASTRUCTURE"),
        dependencyManagement: domains.has("DEPENDENCY_MANAGEMENT"),
        typeContracts: domains.has("TYPE_CONTRACTS"),
        stateManagement: domains.has("STATE_MANAGEMENT"),
        architectureIntelligence: domains.has("ARCHITECTURE_INTELLIGENCE"),
      };

      const weightedScore =
        (capabilities.frontendArchitecture ? 8 : 0) +
        (capabilities.apiLayer ? 12 : 0) +
        (capabilities.authentication ? 12 : 0) +
        (capabilities.realtimeSystems ? 16 : 0) +
        (capabilities.queueInfrastructure ? 16 : 0) +
        (capabilities.databaseLayer ? 12 : 0) +
        (capabilities.cachingLayer ? 8 : 0) +
        (capabilities.devopsInfrastructure ? 10 : 0) +
        (capabilities.stateManagement ? 6 : 0);

      const architectureMaturityScore = Math.min(100, weightedScore);

      const engineeringComplexityScore = Math.min(
        100,
        architectureChanges.length * 2 + domains.size * 8
      );

      const infrastructureDepth =
        architectureMaturityScore >= 70
          ? "HIGH"
          : architectureMaturityScore >= 40
            ? "MEDIUM"
            : "EARLY";

      return {
        success: true,
        message: "Repository capabilities fetched successfully",
        data: {
          repository,
          capabilities,
          scores: {
            architectureMaturityScore,
            engineeringComplexityScore,
            infrastructureDepth,
          },
          detectedDomains: Array.from(domains),
          detectedTechnologies: Array.from(technologies),
        },
      };
    }
  );
  // Architecture radar data for visualization
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/architecture-radar",
    async (request, reply) => {
      const { repositoryId } = request.params;

      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId },
        select: {
          id: true,
          name: true,
          fullName: true,
          language: true,
          userId: true,
        },
      });

      if (!repository) {
        return reply.status(404).send({
          success: false,
          message: "Repository not found",
        });
      }

      const architectureChanges = await prisma.architectureChange.findMany({
        where: { repositoryId },
        select: {
          architectureDomain: true,
          detectedTechnology: true,
          changeType: true,
        },
      });

      const domainCounts = architectureChanges.reduce<Record<string, number>>(
        (acc, change) => {
          const domain = change.architectureDomain || "GENERAL_ARCHITECTURE";
          acc[domain] = (acc[domain] || 0) + 1;
          return acc;
        },
        {}
      );

      const maxCount = Math.max(...Object.values(domainCounts), 1);

      const radar = Object.entries(domainCounts).map(([domain, count]) => {
        const score = Math.round((count / maxCount) * 100);

        return {
          domain,
          label: domain
            .toLowerCase()
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          score,
          changeCount: count,
        };
      });

      return {
        success: true,
        message: "Repository architecture radar fetched successfully",
        data: {
          repository,
          radar,
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
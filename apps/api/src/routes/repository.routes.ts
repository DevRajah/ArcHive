import { FastifyInstance } from "fastify";
import { prisma } from "@archive/database";
import axios from "axios";
import { engineeringEventQueue } from "@archive/queue";
import {
  detectArchitectureStyle,
  generateRepositoryNarrative,
  detectTechnologyFingerprint,
  calculateIntelligenceConfidence,
  inferRepositoryPurpose,
  generateRepositorySemanticProfile,
  inferEvolutionDirection,
  calculateRepositorySimilarity,
  inferEcosystemCluster,
  inferEngineeringTrajectory,
  generateEngineeringReasoning,
  buildTechnologyRelationships,
  buildDomainRelationships,

} from "@archive/detectors";

import { syncEngineeringRecommendations } from "../utils/sync-engineering-recommendations";

type CreateRepositoryBody = {
  name: string;
  owner: string;
  fullName: string;
  description?: string;
  defaultBranch?: string;
};

const createInitialRepositoryIdentity = async (repository: {
  id: string;
  name: string;
  fullName: string;
  description?: string | null;
  language?: string | null;
}) => {
  const existingIdentity = await prisma.architectureChange.findFirst({
    where: {
      repositoryId: repository.id,
      changeType: "REPOSITORY_IDENTITY_DETECTED",
    },
  });

  if (existingIdentity) return null;

  const context = [
    repository.name,
    repository.fullName,
    repository.description,
    repository.language,
  ]
    .filter(Boolean)
    .join(" ");

  const fingerprint = detectTechnologyFingerprint([context], []);

  if (fingerprint.repositoryTypes.length === 0) return null;

  return prisma.architectureChange.create({
    data: {
      repositoryId: repository.id,
      changeType: "REPOSITORY_IDENTITY_DETECTED",
      detectedTechnology:
        fingerprint.technologies[0] ||
        repository.language ||
        "Repository Metadata",
      fileAffected: null,
      summary: `ArcHive identified this repository from its metadata as ${fingerprint.repositoryTypes
        .join(", ")
        .replaceAll("_", " ")
        .toLowerCase()}.`,
      architectureDomain:
        fingerprint.architectureDomains[0] || "REPOSITORY_IDENTITY",
      evolutionSummary:
        "This metadata-based intelligence record helps ArcHive classify repositories before webhook history is available.",
      repositoryTypes: fingerprint.repositoryTypes.join(","),
      reasoningSignals: fingerprint.reasoningSignals.join(" | "),
    },
  });
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
    await createInitialRepositoryIdentity(repository);

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
  //repository details with tracking status
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
          repositoryTypes: true,
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
          repositoryTypes: true,
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
          repositoryTypes: true
        },
      });

      return {
        success: true,
        message: "Repository architecture changes fetched successfully",
        data: architectureChanges,
        repositoryTypes: true
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
          repositoryTypes: true,
          reasoningSignals: true,
        },
      });

      const repositoryTypes = new Set(
        architectureChanges
          .flatMap((change) => change.repositoryTypes?.split(",") || [])
          .filter(Boolean)
      );

      const repositoryPurpose = inferRepositoryPurpose(Array.from(repositoryTypes));

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

      const reasoningSignals = Array.from(
        new Set(
          architectureChanges
            .flatMap((change) => change.reasoningSignals?.split(" | ") || [])
            .map((signal) => signal.trim())
            .filter(Boolean)
        )
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
          repositoryPurpose,
          reasoningSignals,
          detectedDomains: Array.from(domains),
          detectedTechnologies: Array.from(technologies),
          repositoryTypes: Array.from(repositoryTypes),
          detectedRepositoryTypes: Array.from(repositoryTypes)
        },
      };
    }
  );
  // purpose analysis
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/purpose",
    async (request, reply) => {
      const { repositoryId } = request.params;

      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId },
        select: {
          id: true,
          name: true,
          fullName: true,
          description: true,
          language: true,
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
          repositoryTypes: true,
          reasoningSignals: true,
        },
      });

      const repositoryTypes = Array.from(
        new Set(
          architectureChanges
            .flatMap((change) => change.repositoryTypes?.split(",") || [])
            .map((type) => type.trim())
            .filter(Boolean)
        )
      );

      const reasoningSignals = Array.from(
        new Set(
          architectureChanges
            .flatMap((change) => change.reasoningSignals?.split(" | ") || [])
            .map((signal) => signal.trim())
            .filter(Boolean)
        )
      );

      const repositoryPurpose = inferRepositoryPurpose(repositoryTypes);

      return {
        success: true,
        message: "Repository purpose fetched successfully",
        data: {
          repository,
          repositoryPurpose,
          repositoryTypes,
          reasoningSignals,
        },
      };
    }
  );
  // semantic profile analysis
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/semantic-profile",
    async (request, reply) => {
      const { repositoryId } = request.params;

      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId },
        select: {
          id: true,
          name: true,
          fullName: true,
          description: true,
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
        orderBy: { createdAt: "desc" },
        select: {
          architectureDomain: true,
          detectedTechnology: true,
          repositoryTypes: true,
          reasoningSignals: true,
          summary: true,
          evolutionSummary: true,
          createdAt: true,
        },
      });

      const domains = Array.from(
        new Set(
          architectureChanges
            .map((change) => change.architectureDomain)
            .filter((domain): domain is string => Boolean(domain))
        )
      );

      const technologies = Array.from(
        new Set(
          architectureChanges
            .map((change) => change.detectedTechnology)
            .filter((technology): technology is string => Boolean(technology))
        )
      );

      const repositoryTypes = Array.from(
        new Set(
          architectureChanges
            .flatMap((change) => change.repositoryTypes?.split(",") || [])
            .map((type) => type.trim())
            .filter(Boolean)
        )
      );

      const reasoningSignals = Array.from(
        new Set(
          architectureChanges
            .flatMap((change) => change.reasoningSignals?.split(" | ") || [])
            .map((signal) => signal.trim())
            .filter(Boolean)
        )
      );

      const semanticProfile = generateRepositorySemanticProfile({
        repositoryName: repository.name,
        fullName: repository.fullName,
        description: repository.description,
        language: repository.language,
        repositoryTypes,
        domains,
        technologies,
        reasoningSignals,
      });

      const evolutionDirection = inferEvolutionDirection({
        domains,
        repositoryTypes,
      });

      const architectureStyles = detectArchitectureStyle({
        domains,
        technologies,
        signals: [],
        repositoryTypes,
      });




      const capabilities = {
        frontendArchitecture: domains.includes("FRONTEND_ARCHITECTURE"),
        apiLayer: domains.includes("API_LAYER"),
        authentication: domains.includes("AUTHENTICATION"),
        realtimeSystems: domains.includes("REALTIME_SYSTEMS"),
        queueInfrastructure: domains.includes("QUEUE_INFRASTRUCTURE"),
        databaseLayer: domains.includes("DATABASE_LAYER"),
        architectureIntelligence: domains.includes(
          "ARCHITECTURE_INTELLIGENCE"
        ),
      };

      const engineeringReasoning = generateEngineeringReasoning({
        capabilities,
        domains,
        technologies,
        repositoryTypes,
        architectureStyles,
      });

      const ecosystemCluster =
        inferEcosystemCluster(repositoryTypes);

      const engineeringTrajectory =
        inferEngineeringTrajectory({
          domains,
          repositoryTypes,
        });

      const narrative = generateRepositoryNarrative({
        repositoryName: repository.name,
        repositoryTypes,
        technologies,
        domains,
        capabilities,
        architectureStyles,
        architectureChangeCount: architectureChanges.length,
      });

      const knowledgeGraph =
        buildTechnologyRelationships({
          technologies,
          domains,
          repositoryTypes,
        });

      const domainRelationships =
        buildDomainRelationships(domains);


      return {
        success: true,
        message: "Repository semantic profile fetched successfully",
        data: {
          repository,

          semanticProfile,

          evolutionDirection,

          narrative,

          architectureStyles,

          knowledgeGraph,
          domainRelationships,

          capabilities,
          ecosystemCluster,
          engineeringTrajectory,
          engineeringReasoning,

          intelligence: {
            repositoryTypes,
            domains,
            technologies,
            reasoningSignals,
          },

          evidence: architectureChanges.slice(0, 8).map((change) => ({
            summary: change.summary,
            evolutionSummary: change.evolutionSummary,
            architectureDomain: change.architectureDomain,
            detectedTechnology: change.detectedTechnology,
            createdAt: change.createdAt,
          })),
        },
      };
    }
  );
  // recommendations analysis
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/recommendations",
    async (request, reply) => {
      const { repositoryId } = request.params;

      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId },
        select: { id: true, name: true, fullName: true },
      });

      if (!repository) {
        return reply.status(404).send({
          success: false,
          message: "Repository not found",
        });
      }

      const recommendations = await prisma.engineeringRecommendation.findMany({
        where: { repositoryId },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      });

      return {
        success: true,
        message: "Repository engineering recommendations fetched successfully",
        data: {
          repository,
          recommendations,
        },
      };
    }
  );

  // technology relationships analysis
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/knowledge-graph",
    async (request, reply) => {
      const { repositoryId } = request.params;

      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId },
        select: {
          id: true,
          name: true,
          fullName: true,
        },
      });

      if (!repository) {
        return reply.status(404).send({
          success: false,
          message: "Repository not found",
        });
      }

      const architectureChanges =
        await prisma.architectureChange.findMany({
          where: { repositoryId },
          select: {
            architectureDomain: true,
            detectedTechnology: true,
            repositoryTypes: true,
          },
        });

      const domains = Array.from(
        new Set(
          architectureChanges
            .map((change) => change.architectureDomain)
            .filter(
              (domain): domain is string =>
                Boolean(domain)
            )
        )
      );

      const technologies = Array.from(
        new Set(
          architectureChanges
            .map((change) => change.detectedTechnology)
            .filter(
              (
                technology
              ): technology is string =>
                Boolean(technology)
            )
        )
      );

      const repositoryTypes = Array.from(
        new Set(
          architectureChanges
            .flatMap(
              (change) =>
                change.repositoryTypes?.split(",") ||
                []
            )
            .map((type) => type.trim())
            .filter(Boolean)
        )
      );

      const graph =
        buildTechnologyRelationships({
          technologies,
          domains,
          repositoryTypes,
        });

      return {
        success: true,
        message:
          "Repository knowledge graph fetched successfully",
        data: {
          repository,

          graph,

          nodes: {
            technologies,
            domains,
            repositoryTypes,
          },
        },
      };
    }
  );
  // evolution direction analysis
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/evolution-direction",
    async (request, reply) => {
      const { repositoryId } = request.params;

      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId },
        select: {
          id: true,
          name: true,
          fullName: true,
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
          repositoryTypes: true,
        },
      });

      const domains = Array.from(
        new Set(
          architectureChanges
            .map((change) => change.architectureDomain)
            .filter((domain): domain is string => Boolean(domain))
        )
      );

      const repositoryTypes = Array.from(
        new Set(
          architectureChanges
            .flatMap((change) => change.repositoryTypes?.split(",") || [])
            .map((type) => type.trim())
            .filter(Boolean)
        )
      );

      const evolutionDirection = inferEvolutionDirection({
        domains,
        repositoryTypes,
      });

      return {
        success: true,
        message: "Repository evolution direction fetched successfully",
        data: {
          repository,
          evolutionDirection,
          domains,
          repositoryTypes,
        },
      };
    }
  );

  // related repositories analysis
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/related",
    async (request, reply) => {
      const { repositoryId } = request.params;

      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId },
        select: {
          id: true,
          name: true,
          fullName: true,
        },
      });

      if (!repository) {
        return reply.status(404).send({
          success: false,
          message: "Repository not found",
        });
      }

      const allRepositories = await prisma.repository.findMany({
        select: {
          id: true,
          name: true,
          fullName: true,
          architectureChanges: {
            select: {
              architectureDomain: true,
              detectedTechnology: true,
              repositoryTypes: true,
            },
          },
        },
      });

      const sourceRepository = allRepositories.find(
        (repo) => repo.id === repositoryId
      );

      if (!sourceRepository) {
        return reply.status(404).send({
          success: false,
          message: "Source repository not found",
        });
      }

      const extractRepositoryIntelligence = (
        changes: {
          architectureDomain: string | null;
          detectedTechnology: string | null;
          repositoryTypes: string | null;
        }[]
      ) => {
        const domains = Array.from(
          new Set(
            changes
              .map((change) => change.architectureDomain)
              .filter((domain): domain is string => Boolean(domain))
          )
        );

        const technologies = Array.from(
          new Set(
            changes
              .map((change) => change.detectedTechnology)
              .filter(
                (technology): technology is string => Boolean(technology)
              )
          )
        );

        const repositoryTypes = Array.from(
          new Set(
            changes
              .flatMap((change) => change.repositoryTypes?.split(",") || [])
              .map((type) => type.trim())
              .filter(Boolean)
          )
        );

        return {
          domains,
          technologies,
          repositoryTypes,
        };
      };

      const sourceIntelligence = extractRepositoryIntelligence(
        sourceRepository.architectureChanges
      );

      const relatedRepositories = allRepositories
        .filter((repo) => repo.id !== repositoryId)
        .map((repo) => {
          const targetIntelligence = extractRepositoryIntelligence(
            repo.architectureChanges
          );

          const similarity = calculateRepositorySimilarity({
            sourceRepositoryTypes:
              sourceIntelligence.repositoryTypes,
            sourceDomains: sourceIntelligence.domains,
            sourceTechnologies:
              sourceIntelligence.technologies,

            targetRepositoryTypes:
              targetIntelligence.repositoryTypes,
            targetDomains: targetIntelligence.domains,
            targetTechnologies:
              targetIntelligence.technologies,
          });

          return {
            repository: {
              id: repo.id,
              name: repo.name,
              fullName: repo.fullName,
            },

            similarity,
          };
        })
        .sort(
          (a, b) =>
            b.similarity.similarityScore -
            a.similarity.similarityScore
        )
        .slice(0, 8);

      return {
        success: true,
        message: "Related repositories fetched successfully",
        data: {
          repository,
          relatedRepositories,
        },
      };
    }
  );
  // engineering reasoning analysis
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/engineering-reasoning",
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
          repositoryTypes: true,
        },
      });

      const domains = Array.from(
        new Set(
          architectureChanges
            .map((change) => change.architectureDomain)
            .filter((domain): domain is string => Boolean(domain))
        )
      );

      const technologies = Array.from(
        new Set(
          architectureChanges
            .map((change) => change.detectedTechnology)
            .filter((technology): technology is string => Boolean(technology))
        )
      );

      const repositoryTypes = Array.from(
        new Set(
          architectureChanges
            .flatMap((change) => change.repositoryTypes?.split(",") || [])
            .map((type) => type.trim())
            .filter(Boolean)
        )
      );

      const architectureStyles = detectArchitectureStyle({
        domains,
        technologies,
        signals: [],
        repositoryTypes,
      });

      const capabilities = {
        frontendArchitecture: domains.includes("FRONTEND_ARCHITECTURE"),
        apiLayer: domains.includes("API_LAYER"),
        authentication: domains.includes("AUTHENTICATION"),
        realtimeSystems: domains.includes("REALTIME_SYSTEMS"),
        queueInfrastructure: domains.includes("QUEUE_INFRASTRUCTURE"),
        databaseLayer: domains.includes("DATABASE_LAYER"),
        cachingLayer: domains.includes("CACHING_LAYER"),
        architectureIntelligence: domains.includes("ARCHITECTURE_INTELLIGENCE"),
      };

      const reasoning = generateEngineeringReasoning({
        capabilities,
        domains,
        technologies,
        repositoryTypes,
        architectureStyles,
      });

      const trackedRecommendations = await syncEngineeringRecommendations({
        repositoryId,
        recommendations: reasoning.recommendations,
      });

      return {
        success: true,
        message: "Repository engineering reasoning fetched successfully",
        data: {
          repository,
          reasoning,
          trackedRecommendations,
          evidence: {
            domains,
            technologies,
            repositoryTypes,
            architectureStyles,
            capabilities,
          },
        },
      };
    }
  );


  //identity analysis
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/identity",
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
          repositoryTypes: true,
        },
      });

      const detectedRepositoryTypes = Array.from(
        new Set(
          architectureChanges
            .flatMap((change) => change.repositoryTypes?.split(",") || [])
            .map((type) => type.trim())
            .filter(Boolean)
        )
      );

      const detectedTechnologies = Array.from(
        new Set(
          architectureChanges
            .map((change) => change.detectedTechnology)
            .filter((technology): technology is string => Boolean(technology))
        )
      );

      const detectedDomains = Array.from(
        new Set(
          architectureChanges
            .map((change) => change.architectureDomain)
            .filter((domain): domain is string => Boolean(domain))
        )
      );

      const primaryRepositoryType =
        detectedRepositoryTypes[0] ||
        (repository.language ? `${repository.language.toUpperCase()}_PROJECT` : "GENERAL_REPOSITORY");

      const identitySummary = `ArcHive identifies ${repository.name} as a ${primaryRepositoryType
        .replaceAll("_", " ")
        .toLowerCase()} based on its architecture changes, detected technologies, and repository activity.`;

      return {
        success: true,
        message: "Repository identity fetched successfully",
        data: {
          repository,
          primaryRepositoryType,
          detectedRepositoryTypes,
          detectedTechnologies,
          detectedDomains,
          identitySummary,
        },
      };
    }
  );

  //repository narrative synthesis
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/narrative",
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
          repositoryTypes: true,
          reasoningSignals: true,
        },
      });

      const domains = Array.from(
        new Set(
          architectureChanges
            .map((change) => change.architectureDomain)
            .filter((domain): domain is string => Boolean(domain))
        )
      );

      const technologies = Array.from(
        new Set(
          architectureChanges
            .map((change) => change.detectedTechnology)
            .filter((technology): technology is string => Boolean(technology))
        )
      );

      const repositoryTypes = Array.from(
        new Set(
          architectureChanges
            .flatMap((change) => change.repositoryTypes?.split(",") || [])
            .filter(Boolean)
        )
      );

      const repositoryPurpose = inferRepositoryPurpose(repositoryTypes);

      const reasoningSignals = Array.from(
        new Set(
          architectureChanges
            .flatMap((change) => change.reasoningSignals?.split(" | ") || [])
            .map((signal) => signal.trim())
            .filter(Boolean)
        )
      );

      const capabilities = {
        frontendArchitecture: domains.includes("FRONTEND_ARCHITECTURE"),
        apiLayer: domains.includes("API_LAYER"),
        authentication: domains.includes("AUTHENTICATION"),
        realtimeSystems: domains.includes("REALTIME_SYSTEMS"),
        queueInfrastructure: domains.includes("QUEUE_INFRASTRUCTURE"),
        databaseLayer: domains.includes("DATABASE_LAYER"),
        architectureIntelligence: domains.includes("ARCHITECTURE_INTELLIGENCE"),
      };

      const architectureStyles = detectArchitectureStyle({
        domains,
        technologies,
        signals: [],
        repositoryTypes,
      });

      const narrative = generateRepositoryNarrative({
        repositoryName: repository.name,
        repositoryTypes,
        technologies,
        domains,
        capabilities,
        architectureStyles,
        architectureChangeCount: architectureChanges.length,
      });

      const confidence = calculateIntelligenceConfidence({
        repositoryTypes,
        domains,
        technologies,
        reasoningSignals,
      });

      return {
        success: true,
        message: "Repository narrative generated successfully",
        data: {
          repository,
          narrative,
          confidence,
          reasoningSignals,
          repositoryPurpose,
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
  // Intelligence summary synthesis - combines multiple signals for a high-level overview
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/intelligence-summary",
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


      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [
        recentEvents,
        recentArchitectureChanges,
        allArchitectureChanges,
      ] = await Promise.all([
        prisma.engineeringEvent.findMany({
          where: {
            repositoryId,
            createdAt: {
              gte: sevenDaysAgo,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        }),

        prisma.architectureChange.findMany({
          where: {
            repositoryId,
            createdAt: {
              gte: sevenDaysAgo,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        }),

        prisma.architectureChange.findMany({
          where: {
            repositoryId,
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            architectureDomain: true,
            detectedTechnology: true,
            repositoryTypes: true,
            changeType: true,
            summary: true,
          },
        }),
      ]);

      const hasRecentActivity =
        recentEvents.length > 0 || recentArchitectureChanges.length > 0;

      const mode = hasRecentActivity ? "ACTIVE" : "PASSIVE";

      const domains = Array.from(
        new Set(
          allArchitectureChanges
            .map((change) => change.architectureDomain)
            .filter((domain): domain is string => Boolean(domain))
        )
      );

      const technologies = Array.from(
        new Set(
          allArchitectureChanges
            .map((change) => change.detectedTechnology)
            .filter((technology): technology is string => Boolean(technology))
        )
      );

      const repositoryTypes = Array.from(
        new Set(
          allArchitectureChanges
            .flatMap((change) => change.repositoryTypes?.split(",") || [])
            .map((type) => type.trim())
            .filter(Boolean)
        )
      );


      const confidence = calculateIntelligenceConfidence({
        repositoryTypes,
        domains,
        technologies,
        reasoningSignals: [],
      });

      const domainCounts = allArchitectureChanges.reduce<Record<string, number>>(
        (acc, change) => {
          const domain = change.architectureDomain || "GENERAL_ARCHITECTURE";
          acc[domain] = (acc[domain] || 0) + 1;
          return acc;
        },
        {}
      );

      const strongestDomains = Object.entries(domainCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([domain]) =>
          domain
            .toLowerCase()
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        );

      const keyFocusAreas =
        strongestDomains.length > 0
          ? strongestDomains
          : technologies.slice(0, 4);

      const detectedPatterns = [
        ...repositoryTypes.map((type) =>
          type
            .toLowerCase()
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        ),
        ...domains.slice(0, 4).map((domain) =>
          domain
            .toLowerCase()
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        ),
      ].slice(0, 6);

      const strongestTechnology = technologies[0] || repository.language || "software architecture";

      const headline =
        mode === "ACTIVE"
          ? `${repository.name} showed active engineering intelligence signals this week.`
          : `${repository.name} has no significant engineering activity recorded this week.`;

      const overview =
        mode === "ACTIVE"
          ? `${repository.name} recorded ${recentEvents.length} recent engineering event(s) and ${recentArchitectureChanges.length} recent architecture change(s). The strongest current focus areas are ${keyFocusAreas.length > 0
            ? keyFocusAreas.join(", ")
            : strongestTechnology
          }.`
          : `No significant engineering activity was detected this week, but ${repository.name} currently shows known repository intelligence signals${keyFocusAreas.length > 0
            ? ` around ${keyFocusAreas.join(", ")}`
            : ""
          }.`;

      return {
        success: true,
        message: "Repository intelligence summary fetched successfully",
        data: {
          repository: {
            id: repository.id,
            name: repository.name,
            fullName: repository.fullName,
          },
          summary: {
            mode,
            headline,
            overview,
            keyFocusAreas,
            detectedPatterns,
            generatedAt: new Date().toISOString(),
          },
          confidence,
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
  // Endpoint to trigger reprocessing of repository intelligence - for dev/testing purposes
  app.post<{ Params: { repositoryId: string } }>(
    "/:repositoryId/reprocess-intelligence",
    async (request, reply) => {
      const { repositoryId } = request.params;

      const events = await prisma.engineeringEvent.findMany({
        where: { repositoryId },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      for (const event of events) {
        await engineeringEventQueue.add("process-engineering-event", {
          eventId: event.id,
          repositoryId,
        });
      }

      return {
        success: true,
        message: "Repository intelligence reprocessing queued successfully",
        data: {
          repositoryId,
          queuedEvents: events.length,
        },
      };
    }
  );
};
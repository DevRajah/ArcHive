import { FastifyInstance } from "fastify";
import { prisma } from "@archive/database";
import axios from "axios";
import { engineeringEventQueue, repositoryReprocessQueue } from "@archive/queue";
import {
  detectArchitectureStyle,
  generateRepositoryNarrative,
  buildArchitectureIntelligence,
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
  auditRepositoryIntelligence,
  buildIntelligenceTimeline,
  compareRepositories,
  RepositoryIntelligenceReport
} from "@archive/detectors";
import { knowledgeGraphService } from "../services/knowledge-graph.service";
import { intelligenceDiffService } from "../services/intelligence-diff.service";
import { getAuthenticatedUser } from "../utils/authenticated-user";
import { isPlatformAdmin } from "../utils/admin";

import { generateRepositoryIntelligence } from "../services/repository-intelligence.service"

import { syncEngineeringRecommendations } from "../utils/sync-engineering-recommendations";

import {
  readAuditReasoningSignals,
  readAuditStringArray,
} from "../services/intelligence-audit-signals.service";
import { calculateInfrastructureDepth } from "../services/capability-infrastructure-depth.service";
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

  // Fetch Repos
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

      /**
       * Architecture Evolution intentionally combines two different kinds
       * of intelligence:
       *
       * 1. Historical architecture activity
       *    -> ArchitectureChange
       *
       * 2. Current repository intelligence
       *    -> latest RepositoryIntelligenceSnapshot
       *
       * Future me:
       * Do not rebuild current capabilities, maturity, or architecture styles
       * from ArchitectureChange rows. Those rows describe events over time,
       * not the complete current state of the repository.
       */
      const repository =
        await prisma.repository.findUnique({
          where: {
            id: repositoryId,
          },

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

            /**
             * The latest snapshot is the authoritative current-state
             * repository intelligence.
             */
            intelligenceSnapshots: {
              orderBy: [
                {
                  createdAt: "desc",
                },
                {
                  id: "desc",
                },
              ],

              take: 1,

              select: {
                id: true,

                repositoryTypes: true,
                technologies: true,
                architectureDomains: true,
                capabilities: true,

                maturityScore: true,
                capabilityScore: true,

                intelligence: true,
                createdAt: true,
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

      const latestSnapshot =
        repository.intelligenceSnapshots[0];

      /**
       * Do not silently reconstruct current intelligence from old
       * ArchitectureChange rows.
       */
      if (!latestSnapshot) {
        return reply.status(404).send({
          success: false,
          message:
            "Repository intelligence has not been generated yet. Reprocess the repository first.",
        });
      }

      /**
       * ============================================================
       * HISTORICAL ARCHITECTURE EVOLUTION
       * ============================================================
       *
       * ArchitectureChange remains correct here because this section is
       * explicitly describing how the repository changed over time.
       */
      const architectureChanges =
        await prisma.architectureChange.findMany({
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
            repositoryTypes: true,
          },
        });

      const groupedByDomain =
        architectureChanges.reduce<
          Record<
            string,
            typeof architectureChanges
          >
        >((groups, change) => {
          const domain =
            change.architectureDomain ||
            "GENERAL_ARCHITECTURE";

          if (!groups[domain]) {
            groups[domain] = [];
          }

          groups[domain].push(change);

          return groups;
        }, {});

      /**
       * Historical domains describe domains that have appeared in recorded
       * architecture-change history.
       */
      const domains =
        Object.entries(
          groupedByDomain
        ).map(([domain, changes]) => {
          const latestChange =
            changes[0];

          return {
            domain,

            label: domain
              .toLowerCase()
              .split("_")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() +
                  word.slice(1)
              )
              .join(" "),

            totalChanges:
              changes.length,

            latestChangeAt:
              latestChange?.createdAt ||
              null,

            technologies:
              Array.from(
                new Set(
                  changes
                    .map(
                      (change) =>
                        change.detectedTechnology
                    )
                    .filter(
                      (
                        technology
                      ): technology is string =>
                        Boolean(
                          technology
                        )
                    )
                )
              ),

            changes,

            /**
             * Kept for response compatibility with the existing endpoint.
             */
            repositoryTypes: true,
          };
        });

      /**
       * Do not mutate `domains` when ranking it.
       *
       * The response should retain the natural domain ordering produced above.
       */
      const mostActiveDomain =
        [...domains].sort(
          (a, b) =>
            b.totalChanges -
            a.totalChanges
        )[0];

      /**
       * ============================================================
       * CURRENT CANONICAL REPOSITORY INTELLIGENCE
       * ============================================================
       */

      const canonicalRepositoryTypes =
        readAuditStringArray(
          latestSnapshot.repositoryTypes
        );

      const canonicalDomains =
        readAuditStringArray(
          latestSnapshot.architectureDomains
        );

      const canonicalTechnologies =
        readAuditStringArray(
          latestSnapshot.technologies
        );

      /**
       * RepositoryIntelligenceSnapshot.capabilities stores structured
       * CapabilityResult objects:
       *
       * {
       *   key: string,
       *   confidence: number,
       *   reason: string
       * }
       */
      const capabilityResults =
        Array.isArray(
          latestSnapshot.capabilities
        )
          ? latestSnapshot.capabilities.filter(
            (
              capability
            ): capability is {
              key: string;
              confidence: number;
              reason: string;
            } => {
              if (
                !capability ||
                typeof capability !==
                "object" ||
                Array.isArray(
                  capability
                )
              ) {
                return false;
              }

              const record =
                capability as Record<
                  string,
                  unknown
                >;

              return (
                typeof record.key ===
                "string" &&
                typeof record.confidence ===
                "number" &&
                typeof record.reason ===
                "string"
              );
            }
          )
          : [];

      const capabilityKeys =
        new Set(
          capabilityResults.map(
            (capability) =>
              capability.key
          )
        );

      /**
       * Architecture styles describe the CURRENT repository architecture.
       *
       * Therefore use canonical snapshot signals rather than historical
       * ArchitectureChange domains.
       */
      const architectureStyles =
        detectArchitectureStyle({
          domains:
            canonicalDomains,

          technologies:
            canonicalTechnologies,

          signals: [],

          repositoryTypes:
            canonicalRepositoryTypes,
        });

      /**
       * Keep detectedCapabilities as human-readable strings because that is
       * what the existing API contract exposed.
       *
       * The values now come from actual canonical CapabilityResult records.
       */
      const detectedCapabilities =
        capabilityResults.map(
          (capability) =>
            capability.key
              .toLowerCase()
              .split("_")
              .map(
                (word) =>
                  word
                    .charAt(0)
                    .toUpperCase() +
                  word.slice(1)
              )
              .join(" ")
        );

      /**
       * These represent ArcHive's canonical infrastructure breadth model.
       *
       * Missing here means "not detected in the current repository".
       * It does NOT automatically mean the repository has an engineering flaw.
       */
      const expectedCapabilities = [
        {
          key: "API_LAYER",
          label: "API Layer",
        },
        {
          key: "DATABASE_LAYER",
          label: "Database Layer",
        },
        {
          key: "CACHE_INFRASTRUCTURE",
          label:
            "Cache Infrastructure",
        },
        {
          key: "QUEUE_INFRASTRUCTURE",
          label:
            "Queue Infrastructure",
        },
        {
          key: "REALTIME_SYSTEMS",
          label: "Realtime Systems",
        },
        {
          key: "DEVOPS_INFRASTRUCTURE",
          label:
            "DevOps Infrastructure",
        },
      ];

      const missingCapabilities =
        expectedCapabilities
          .filter(
            (capability) =>
              !capabilityKeys.has(
                capability.key
              )
          )
          .map(
            (capability) =>
              capability.label
          );

      /**
       * Canonical scores persisted by the full repository intelligence engine.
       */
      const repositoryMaturityScore =
        latestSnapshot.maturityScore ??
        0;

      const capabilityScore =
        latestSnapshot.capabilityScore ??
        0;

      /**
       * Infrastructure depth is based on actual infrastructure capability
       * breadth, using the same model as /capabilities.
       *
       * It must NOT be derived from overall repository maturity.
       */
      const infrastructureDepthAssessment =
        calculateInfrastructureDepth(
          capabilityKeys
        );

      const infrastructureDepth =
        infrastructureDepthAssessment.level;

      /**
       * Legacy compatibility alias.
       *
       * @deprecated
       * Prefer repositoryMaturityScore.
       *
       * The old endpoint exposed architectureMaturityScore, so keep it
       * temporarily to avoid breaking existing frontend consumers.
       */
      const architectureMaturityScore =
        repositoryMaturityScore;

      return {
        success: true,

        message:
          "Repository architecture evolution fetched successfully",

        data: {
          /**
           * Return the public repository shape only.
           *
           * Do not leak intelligenceSnapshots into the endpoint response just
           * because we queried them internally.
           */
          repository: {
            id: repository.id,
            name: repository.name,
            owner: repository.owner,
            fullName:
              repository.fullName,
            description:
              repository.description,
            defaultBranch:
              repository.defaultBranch,
            language:
              repository.language,
            stars: repository.stars,
            forks: repository.forks,
            userId: repository.userId,
          },

          /**
           * Historical evolution summary.
           */
          summary: {
            totalArchitectureChanges:
              architectureChanges.length,

            totalDomains:
              domains.length,

            mostActiveDomain:
              mostActiveDomain?.domain ||
              null,
          },

          /**
           * Current repository intelligence.
           */
          insights: {
            repositoryMaturityScore,

            capabilityScore,

            infrastructureDepthScore:
              infrastructureDepthAssessment.score,

            infrastructureDepth,

            /**
             * @deprecated
             * Use repositoryMaturityScore.
             */
            architectureMaturityScore,

            /**
             * Historical metric:
             * domain with the largest number of recorded ArchitectureChange rows.
             */
            dominantDomain:
              mostActiveDomain?.domain ||
              null,

            detectedCapabilities,

            missingCapabilities,

            architectureStyles,

            infrastructureDepthEvidence: {
              detected:
                infrastructureDepthAssessment.detected,

              detectedCount:
                infrastructureDepthAssessment
                  .detected.length,

              totalPossible:
                infrastructureDepthAssessment
                  .totalPossible,
            },
          },

          /**
           * Historical per-domain architecture-change data.
           */
          domains,
        },
      };
    }
  );

  // Detailed intelligence Report
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/intelligence",
    async (request, reply) => {
      const { repositoryId } = request.params;

      const repository = await prisma.repository.findUnique({
        where: {
          id: repositoryId,
        },
        select: {
          id: true,
          name: true,
          fullName: true,
          description: true,
          language: true,
          stars: true,
          forks: true,
          isTracked: true,
          createdAt: true,
          updatedAt: true,

          /*
           * RepositoryIntelligenceSnapshot is now the source of truth for
           * generated repository intelligence.
           *
           * Important:
           * We do NOT rerun detectTechnologyFingerprint() inside this GET route.
           * Reprocessing already performed the full analysis using the real
           * repository tree, README, source files and architecture evidence.
           *
           * The GET route should only return that persisted result.
           */
          intelligenceSnapshots: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            select: {
              id: true,
              primaryRepositoryType: true,
              repositoryTypes: true,
              intelligence: true,
              createdAt: true,
            },
          },

          /*
           * Keep ArchitectureChange data for the legacy response only.
           *
           * Some existing consumers may still rely on these aggregated signals,
           * so we are not removing them as part of this fix.
           */
          architectureChanges: {
            orderBy: {
              createdAt: "desc",
            },
            select: {
              id: true,
              changeType: true,
              detectedTechnology: true,
              fileAffected: true,
              summary: true,
              repositoryTypes: true,
              reasoningSignals: true,
              architectureDomain: true,
              evolutionSummary: true,
              createdAt: true,
            },
          },
        },
      });

      if (!repository || !repository.isTracked) {
        return reply.status(404).send({
          success: false,
          message: "Tracked repository not found",
        });
      }

      /*
       * Reprocessing creates immutable intelligence snapshots.
       * The newest snapshot represents the latest canonical analysis.
       */
      const latestSnapshot =
        repository.intelligenceSnapshots[0];

      if (!latestSnapshot) {
        return reply.status(404).send({
          success: false,
          message:
            "Repository intelligence has not been generated yet. Reprocess the repository first.",
        });
      }

      const canonicalRepositoryTypes: string[] =
        Array.isArray(
          latestSnapshot.repositoryTypes,
        )
          ? latestSnapshot.repositoryTypes.filter(
            (value): value is string =>
              typeof value === "string",
          )
          : [];

      /*
       * The complete RepositoryIntelligenceReport was persisted as JSON.
       *
       * We intentionally trust this object rather than rebuilding intelligence
       * from ArchitectureChange rows, because those rows contain only a subset
       * of the evidence used during the real repository analysis.
       */
      const repositoryIntelligence =
        latestSnapshot.intelligence as any;

      /*
       * Make the persisted top-level snapshot fields authoritative.
       *
       * Normally these values should already match identity inside the JSON.
       * Explicitly assigning them here prevents an old embedded JSON value from
       * overriding the canonical fields stored alongside the snapshot.
       */
      repositoryIntelligence.identity.primaryRepositoryType =
        latestSnapshot.primaryRepositoryType;

      repositoryIntelligence.identity.repositoryTypes =
        canonicalRepositoryTypes;

      /*
       * Repository DNA is part of the same identity model.
       *
       * It must describe the same canonical repository purpose instead of
       * exposing an older generic JAVASCRIPT_TYPESCRIPT_PROJECT classification.
       */
      if (repositoryIntelligence.identity.repositoryDNA) {
        repositoryIntelligence.identity.repositoryDNA.engineeringProfile =
          latestSnapshot.primaryRepositoryType;

        repositoryIntelligence.identity.repositoryDNA.repositoryTypes =
          canonicalRepositoryTypes;
      }

      /*
       * These aggregates remain only for backwards-compatible legacy data.
       * They are NOT used to determine canonical repository purpose anymore.
       */
      const legacyRepositoryTypes = Array.from(
        new Set(
          repository.architectureChanges
            .flatMap(
              (change) =>
                change.repositoryTypes?.split(",") || []
            )
            .map((type) => type.trim())
            .filter(Boolean)
        )
      );

      const technologies = Array.from(
        new Set(
          repository.architectureChanges
            .map((change) => change.detectedTechnology)
            .filter(
              (technology): technology is string =>
                Boolean(technology)
            )
        )
      );

      const architectureDomains = Array.from(
        new Set(
          repository.architectureChanges
            .map((change) => change.architectureDomain)
            .filter(
              (domain): domain is string =>
                Boolean(domain)
            )
        )
      );

      const reasoningSignals = Array.from(
        new Set(
          repository.architectureChanges
            .flatMap(
              (change) =>
                change.reasoningSignals?.split(",") || []
            )
            .map((signal) => signal.trim())
            .filter(Boolean)
        )
      );

      const engineeringSignals = reasoningSignals;

      /*
       * Summary now derives from the persisted canonical snapshot too.
       *
       * This guarantees:
       *
       * summary.primaryRepositoryType
       *                  ===
       * repositoryIntelligence.identity.primaryRepositoryType
       */
      const summary = {
        primaryRepositoryType:
          latestSnapshot.primaryRepositoryType,

        persona:
          repositoryIntelligence.identity.repositoryPersona,

        healthStatus:
          repositoryIntelligence.assessment.repositoryHealth.status,

        healthScore:
          repositoryIntelligence.assessment.repositoryHealth.score,

        maturityLevel:
          repositoryIntelligence.assessment.repositoryMaturity.level,

        maturityScore:
          repositoryIntelligence.assessment.repositoryMaturity.score,

        productionReadinessLevel:
          repositoryIntelligence.assessment.productionReadiness.level,

        productionReadinessScore:
          repositoryIntelligence.assessment.productionReadiness.score,

        engineeringQualityScore:
          repositoryIntelligence.assessment.engineeringQuality.overallScore,
      };

      return {
        success: true,
        message:
          "Repository intelligence fetched successfully.",

        data: {
          repository: {
            id: repository.id,
            name: repository.name,
            fullName: repository.fullName,
            description: repository.description,
            language: repository.language,
            stars: repository.stars,
            forks: repository.forks,
            createdAt: repository.createdAt,
            updatedAt: repository.updatedAt,
          },

          summary,

          repositoryIntelligence,

          legacy: {
            repositoryTypes: legacyRepositoryTypes,
            technologies,
            architectureDomains,
            engineeringSignals,
            reasoningSignals,
          },
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
  // capabilities analysis
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/capabilities",
    async (request, reply) => {
      const { repositoryId } = request.params;

      /**
       * Capability Intelligence is a current-state endpoint.
       *
       * Future me:
       * Do not rebuild capabilities from ArchitectureChange rows.
       *
       * ArchitectureChange represents historical event-level evidence.
       * RepositoryIntelligenceSnapshot contains the canonical full-repository
       * capability analysis produced during reprocessing.
       */
      const repository =
        await prisma.repository.findUnique({
          where: {
            id: repositoryId,
          },

          select: {
            id: true,
            name: true,
            fullName: true,
            userId: true,

            intelligenceSnapshots: {
              orderBy: [
                {
                  createdAt: "desc",
                },
                {
                  id: "desc",
                },
              ],

              take: 1,

              select: {
                id: true,
                primaryRepositoryType: true,
                repositoryTypes: true,
                technologies: true,
                architectureDomains: true,
                capabilities: true,
                intelligence: true,

                maturityScore: true,
                capabilityScore: true,
                createdAt: true,
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

      const latestSnapshot =
        repository.intelligenceSnapshots[0];

      if (!latestSnapshot) {
        return reply.status(404).send({
          success: false,
          message:
            "Repository intelligence has not been generated yet. Reprocess the repository first.",
        });
      }

      /**
       * Convert snapshot JSON arrays back into safe string arrays.
       *
       * This uses the same canonical data source as Repository Intelligence.
       */
      const repositoryTypes =
        readAuditStringArray(
          latestSnapshot.repositoryTypes
        );

      const domains =
        readAuditStringArray(
          latestSnapshot.architectureDomains
        );

      const technologies =
        readAuditStringArray(
          latestSnapshot.technologies
        );

      /**
       * RepositoryIntelligenceSnapshot.capabilities stores structured
       * CapabilityResult objects.
       */
      const capabilityResults =
        Array.isArray(
          latestSnapshot.capabilities
        )
          ? latestSnapshot.capabilities.filter(
            (
              capability
            ): capability is {
              key: string;
              confidence: number;
              reason: string;
            } => {
              if (
                !capability ||
                typeof capability !== "object" ||
                Array.isArray(capability)
              ) {
                return false;
              }

              const record =
                capability as Record<
                  string,
                  unknown
                >;

              return (
                typeof record.key === "string" &&
                typeof record.confidence ===
                "number" &&
                typeof record.reason ===
                "string"
              );
            }
          )
          : [];

      const capabilityKeys =
        new Set(
          capabilityResults.map(
            (capability) =>
              capability.key
          )
        );

      /**
       * Keep the existing frontend boolean contract.
       *
       * These booleans now come from canonical CapabilityResult[] rather than
       * being rediscovered from architecture domains.
       */
      const capabilities = {
        /**
         * Some compatibility flags map directly to canonical capability results.
         *
         * Others represent architecture-domain concepts and therefore must come
         * from the canonical architecture-domain collection instead.
         *
         * Future me:
         * Do not create fake CapabilityResult keys merely to make this legacy
         * boolean object look symmetrical.
         */

        frontendArchitecture:
          domains.includes(
            "FRONTEND_ARCHITECTURE"
          ),

        apiLayer:
          capabilityKeys.has(
            "API_LAYER"
          ),

        authentication:
          capabilityKeys.has(
            "AUTHENTICATION"
          ),

        realtimeSystems:
          capabilityKeys.has(
            "REALTIME_SYSTEMS"
          ),

        queueInfrastructure:
          capabilityKeys.has(
            "QUEUE_INFRASTRUCTURE"
          ),

        databaseLayer:
          capabilityKeys.has(
            "DATABASE_LAYER"
          ),

        cachingLayer:
          capabilityKeys.has(
            "CACHE_INFRASTRUCTURE"
          ),

        devopsInfrastructure:
          capabilityKeys.has(
            "DEVOPS_INFRASTRUCTURE"
          ),

        dependencyManagement:
          domains.includes(
            "DEPENDENCY_MANAGEMENT"
          ),

        typeContracts:
          domains.includes(
            "TYPE_CONTRACTS"
          ),

        stateManagement:
          domains.includes(
            "STATE_MANAGEMENT"
          ),

        architectureIntelligence:
          domains.includes(
            "ARCHITECTURE_INTELLIGENCE"
          ),
      };

      /**
       * Reasoning signals are already stored as structured string[] in the
       * canonical intelligence payload.
       *
       * This preserves logical signal boundaries, including commas inside one
       * sentence.
       */
      const reasoningSignals =
        readAuditReasoningSignals(
          latestSnapshot.intelligence
        );

      /**
       * Repository type and semantic purpose are different abstraction layers.
       *
       * DEVTOOL_PLATFORM = repository classification
       * DEVELOPER_TOOLING = human-facing purpose category
       */
      const repositoryPurpose =
        inferRepositoryPurpose(
          repositoryTypes
        );

      /**
    * Canonical repository intelligence scores.
    *
    * Future me:
    * These names describe what the snapshot actually stores.
    *
    * maturityScore measures overall repository maturity.
    * capabilityScore measures the strength/confidence of detected capabilities.
    */
      const repositoryMaturityScore =
        latestSnapshot.maturityScore ?? 0;

      const capabilityScore =
        latestSnapshot.capabilityScore ?? 0;

      /**
       * Preserve the existing API fields temporarily so current frontend consumers
       * do not break.
       *
       * These are compatibility aliases only.
       *
       * architectureMaturityScore historically represented a custom capability
       * weighting, but the endpoint now uses canonical repository intelligence.
       *
       * engineeringComplexityScore historically represented a custom complexity
       * calculation, but it should not pretend that capability confidence is the
       * same thing as engineering complexity.
       */
      const architectureMaturityScore =
        repositoryMaturityScore;

      const engineeringComplexityScore =
        capabilityScore;

      /**
      * Infrastructure depth is derived from actual canonical infrastructure
      * capabilities, not overall repository maturity.
      */
      const infrastructureDepthAssessment =
        calculateInfrastructureDepth(
          capabilityKeys
        );

      const infrastructureDepth =
        infrastructureDepthAssessment.level;


      return {
        success: true,
        message:
          "Repository capabilities fetched successfully",

        data: {
          repository: {
            id: repository.id,
            name: repository.name,
            fullName:
              repository.fullName,
            userId:
              repository.userId,
          },

          capabilities,

          scores: {
            repositoryMaturityScore,
            capabilityScore,

            /**
 * Infrastructure-specific breadth score.
 */
            infrastructureDepthScore:
              infrastructureDepthAssessment.score,

            infrastructureDepth,
            /**
 * Legacy compatibility aliases.
 *
 * @deprecated architectureMaturityScore
 * Use repositoryMaturityScore instead.
 *
 * @deprecated engineeringComplexityScore
 * Use capabilityScore instead.
 */
            architectureMaturityScore,
            engineeringComplexityScore,

            infrastructureDepthEvidence: {
              detected:
                infrastructureDepthAssessment.detected,

              detectedCount:
                infrastructureDepthAssessment.detected.length,

              totalPossible:
                infrastructureDepthAssessment.totalPossible,
            },
          },

          repositoryPurpose,

          reasoningSignals,

          detectedDomains:
            domains,

          detectedTechnologies:
            technologies,

          repositoryTypes,

          detectedRepositoryTypes:
            repositoryTypes,

          /**
           * Rich capability evidence for consumers that want the canonical
           * confidence/reason model.
           *
           * Existing frontend consumers can ignore this field.
           */
          capabilityResults,
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


  // Target and compare repos

  app.get<{
    Params: {
      repositoryId: string;
      targetRepositoryId: string;
    };
  }>("/:repositoryId/compare/:targetRepositoryId", async (request, reply) => {
    const { repositoryId, targetRepositoryId } = request.params;

    if (repositoryId === targetRepositoryId) {
      return reply.status(400).send({
        success: false,
        message: "Cannot compare a repository with itself",
      });
    }

    const repositories = await prisma.repository.findMany({
      where: {
        id: {
          in: [repositoryId, targetRepositoryId],
        },
        isTracked: true,
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        architectureChanges: {
          select: {
            repositoryTypes: true,
            detectedTechnology: true,
            architectureDomain: true,
            reasoningSignals: true,
          },
        },
      },
    });

    const sourceRepository = repositories.find((repo) => repo.id === repositoryId);
    const targetRepository = repositories.find(
      (repo) => repo.id === targetRepositoryId
    );

    if (!sourceRepository || !targetRepository) {
      return reply.status(404).send({
        success: false,
        message: "One or both tracked repositories were not found",
      });
    }

    type ArchitectureChangeSignalRow = {
      repositoryTypes: string | null;
      detectedTechnology: string | null;
      architectureDomain: string | null;
      reasoningSignals: string | null;
    };

    const splitSignalList = (value: string | null) => {
      if (!value) {
        return [];
      }

      return value
        .split(/[,|]/)
        .map((item) => item.trim())
        .filter(Boolean);
    };

    const extractSignals = (changes: ArchitectureChangeSignalRow[]) => {
      const repositoryTypes = Array.from(
        new Set(changes.flatMap((change) => splitSignalList(change.repositoryTypes)))
      );

      const technologies = Array.from(
        new Set(
          changes
            .map((change) => change.detectedTechnology)
            .filter((value): value is string => Boolean(value))
        )
      );

      const architectureDomains = Array.from(
        new Set(
          changes
            .map((change) => change.architectureDomain)
            .filter((value): value is string => Boolean(value))
        )
      );

      const engineeringSignals = Array.from(
        new Set(changes.flatMap((change) => splitSignalList(change.reasoningSignals)))
      );

      return {
        repositoryTypes,
        technologies,
        architectureDomains,
        engineeringSignals,
      };
    };
    const sourceSignals = extractSignals(sourceRepository.architectureChanges);
    const targetSignals = extractSignals(targetRepository.architectureChanges);

    const comparison = compareRepositories({
      source: {
        name: sourceRepository.name,
        ...sourceSignals,
      },
      target: {
        name: targetRepository.name,
        ...targetSignals,
      },
    });

    return {
      success: true,
      message: "Repository comparison fetched successfully",
      data: {
        sourceRepository: {
          id: sourceRepository.id,
          name: sourceRepository.name,
          fullName: sourceRepository.fullName,
        },
        targetRepository: {
          id: targetRepository.id,
          name: targetRepository.name,
          fullName: targetRepository.fullName,
        },
        comparison,
      },
    };
  });


  // Reprocess All Repos
  app.post("/reprocess-all", async (_request, reply) => {
    const startedAt = Date.now();

    const repositories = await prisma.repository.findMany({
      where: { isTracked: true },
      select: {
        id: true,
        name: true,
        fullName: true,
      },
    });

    const results = [];

    for (const repository of repositories) {
      const repositoryStartedAt = Date.now();

      try {
        await generateRepositoryIntelligence({
          repositoryId: repository.id,
        });

        results.push({
          repositoryId: repository.id,
          name: repository.name,
          fullName: repository.fullName,
          status: "SUCCESS",
          durationMs: Date.now() - repositoryStartedAt,
        });
      } catch (error) {
        results.push({
          repositoryId: repository.id,
          name: repository.name,
          fullName: repository.fullName,
          status: "FAILED",
          durationMs: Date.now() - repositoryStartedAt,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successful = results.filter((result) => result.status === "SUCCESS");
    const failed = results.filter((result) => result.status === "FAILED");

    return {
      success: failed.length === 0,
      message:
        failed.length === 0
          ? "Repository portfolio reprocessed successfully."
          : "Repository portfolio reprocessed with some failures.",
      data: {
        totalRepositories: repositories.length,
        successful: successful.length,
        failed: failed.length,
        durationMs: Date.now() - startedAt,
        results,
      },
    };
  });

  // Reprocess Single Repo
  app.post("/:repositoryId/reprocess", async (request, reply) => {
    const startedAt = Date.now();

    const { repositoryId } = request.params as {
      repositoryId: string;
    };

    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
      select: {
        id: true,
        name: true,
        fullName: true,
        isTracked: true,
      },
    });

    if (!repository || !repository.isTracked) {
      return reply.status(404).send({
        success: false,
        message: "Tracked repository not found",
      });
    }

    try {
      await generateRepositoryIntelligence({
        repositoryId,
      });

      return {
        success: true,
        message: "Repository intelligence regenerated successfully.",
        data: {
          repository: {
            id: repository.id,
            name: repository.name,
            fullName: repository.fullName,
          },
          status: "SUCCESS",
          durationMs: Date.now() - startedAt,
        },
      };
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Repository intelligence regeneration failed.",
        data: {
          repository: {
            id: repository.id,
            name: repository.name,
            fullName: repository.fullName,
          },
          status: "FAILED",
          durationMs: Date.now() - startedAt,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  });

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

  // resolve recommendation with optional evidence
  app.patch<{
    Params: { repositoryId: string; recommendationId: string };
    Body: { evidence?: string };
  }>(
    "/:repositoryId/recommendations/:recommendationId/resolve",
    async (request, reply) => {
      const { repositoryId, recommendationId } = request.params;
      const { evidence } = request.body || {};

      const recommendation = await prisma.engineeringRecommendation.findFirst({
        where: {
          id: recommendationId,
          repositoryId,
        },
      });

      if (!recommendation) {
        return reply.status(404).send({
          success: false,
          message: "Recommendation not found",
        });
      }

      const updatedRecommendation =
        await prisma.engineeringRecommendation.update({
          where: { id: recommendationId },
          data: {
            status: "RESOLVED",
            resolvedAt: new Date(),
            evidence: evidence || "Manually marked as resolved",
          },
        });

      return {
        success: true,
        message: "Recommendation resolved successfully",
        data: updatedRecommendation,
      };
    }
  );


  // reopen recommendation
  app.patch<{ Params: { repositoryId: string; recommendationId: string }; }>(
    "/:repositoryId/recommendations/:recommendationId/dismiss",
    async (request, reply) => {
      const { repositoryId, recommendationId } = request.params;

      const recommendation = await prisma.engineeringRecommendation.findFirst({
        where: {
          id: recommendationId,
          repositoryId,
        },
      });

      if (!recommendation) {
        return reply.status(404).send({
          success: false,
          message: "Recommendation not found",
        });
      }

      const updatedRecommendation =
        await prisma.engineeringRecommendation.update({
          where: { id: recommendationId },
          data: {
            status: "DISMISSED",
          },
        });

      return {
        success: true,
        message: "Recommendation dismissed successfully",
        data: updatedRecommendation,
      };
    }
  );

  // For recommendations that are marked as "RESOLVED", this endpoint allows reopening them back to "ACTIVE" status, which can be useful if the underlying issue re-emerges or if the resolution was not effective.
  app.patch<{ Params: { repositoryId: string; recommendationId: string }; }>(
    "/:repositoryId/recommendations/:recommendationId/reopen",
    async (request, reply) => {
      const { repositoryId, recommendationId } = request.params;

      const recommendation = await prisma.engineeringRecommendation.findFirst({
        where: {
          id: recommendationId,
          repositoryId,
        },
      });

      if (!recommendation) {
        return reply.status(404).send({
          success: false,
          message: "Recommendation not found",
        });
      }

      const updatedRecommendation =
        await prisma.engineeringRecommendation.update({
          where: { id: recommendationId },
          data: {
            status: "ACTIVE",
            resolvedAt: null,
            evidence: null,
          },
        });

      return {
        success: true,
        message: "Recommendation reopened successfully",
        data: updatedRecommendation,
      };
    }
  );


  // Repository-level engineering knowledge graph
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/knowledge-graph",
    async (request, reply) => {
      const { repositoryId } = request.params;

      const knowledgeGraph =
        await knowledgeGraphService.getRepositoryGraph(repositoryId);

      if (!knowledgeGraph) {
        return reply.status(404).send({
          success: false,
          message: "Repository not found",
        });
      }

      /*
       * Keep the original graph format available so the current frontend does
       * not break while richer node-and-edge visualisations are introduced.
       */
      const legacyGraph = buildTechnologyRelationships({
        technologies: knowledgeGraph.signals.technologies,
        domains: knowledgeGraph.signals.architectureDomains,
        repositoryTypes: knowledgeGraph.signals.repositoryTypes,
      });

      return {
        success: true,
        message: "Repository knowledge graph fetched successfully",
        data: {
          repository: knowledgeGraph.repository,

          graph: legacyGraph,

          nodes: {
            technologies: knowledgeGraph.signals.technologies,
            domains: knowledgeGraph.signals.architectureDomains,
            repositoryTypes: knowledgeGraph.signals.repositoryTypes,
            capabilities: knowledgeGraph.signals.capabilities,
          },

          knowledgeGraph: {
            nodes: knowledgeGraph.nodes,
            edges: knowledgeGraph.edges,
            summary: knowledgeGraph.summary,
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

      const sourceRepository = await prisma.repository.findUnique({
        where: {
          id: repositoryId,
          isTracked: true,
        },
        select: {
          id: true,
          name: true,
          fullName: true,
          userId: true,
          architectureChanges: {
            select: {
              architectureDomain: true,
              detectedTechnology: true,
              repositoryTypes: true,
            },
          },
        },
      });

      if (!sourceRepository) {
        return reply.status(404).send({
          success: false,
          message: "Repository not found",
        });
      }

      const repositories = await prisma.repository.findMany({
        where: {
          userId: sourceRepository.userId,
          isTracked: true,
          id: {
            not: repositoryId,
          },
        },
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
              .filter((technology): technology is string => Boolean(technology))
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

      const relatedRepositories = repositories
        .map((repo) => {
          const targetIntelligence = extractRepositoryIntelligence(
            repo.architectureChanges
          );

          const similarity = calculateRepositorySimilarity({
            sourceRepositoryTypes: sourceIntelligence.repositoryTypes,
            sourceDomains: sourceIntelligence.domains,
            sourceTechnologies: sourceIntelligence.technologies,

            targetRepositoryTypes: targetIntelligence.repositoryTypes,
            targetDomains: targetIntelligence.domains,
            targetTechnologies: targetIntelligence.technologies,
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
        .filter((item) => item.similarity.similarityScore > 0)
        .sort(
          (a, b) =>
            b.similarity.similarityScore - a.similarity.similarityScore
        )
        .slice(0, 8);

      return {
        success: true,
        message: "Related repositories fetched successfully",
        data: {
          repository: {
            id: sourceRepository.id,
            name: sourceRepository.name,
            fullName: sourceRepository.fullName,
          },
          sourceIntelligence,
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


  // intelligence overview analysis
  app.get("/intelligence-overview", async () => {
    const repositories = await prisma.repository.findMany({
      where: {
        isTracked: true,
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        language: true,
        architectureChanges: {
          select: {
            architectureDomain: true,
            detectedTechnology: true,
            repositoryTypes: true,
            reasoningSignals: true,
          },
        },
      },
    });

    const data = repositories.map((repo) => {
      const domains = Array.from(
        new Set(
          repo.architectureChanges
            .map((change) => change.architectureDomain)
            .filter((domain): domain is string => Boolean(domain))
        )
      );

      const technologies = Array.from(
        new Set(
          repo.architectureChanges
            .map((change) => change.detectedTechnology)
            .filter((technology): technology is string => Boolean(technology))
        )
      );

      const repositoryTypes = Array.from(
        new Set(
          repo.architectureChanges
            .flatMap((change) => change.repositoryTypes?.split(",") || [])
            .map((type) => type.trim())
            .filter(Boolean)
        )
      );

      const reasoningSignals = Array.from(
        new Set(
          repo.architectureChanges
            .flatMap((change) => change.reasoningSignals?.split(" | ") || [])
            .map((signal) => signal.trim())
            .filter(Boolean)
        )
      );

      const semanticProfile = generateRepositorySemanticProfile({
        repositoryName: repo.name,
        fullName: repo.fullName,
        description: null,
        language: repo.language,
        repositoryTypes,
        domains,
        technologies,
        reasoningSignals,
      });

      return {
        repository: {
          id: repo.id,
          name: repo.name,
          fullName: repo.fullName,
          language: repo.language,
        },
        semanticProfile,
        repositoryTypes,
        domains,
        technologies,
      };
    });

    return {
      success: true,
      message: "Repository intelligence overview fetched successfully",
      data,
    };
  });

  /*
|--------------------------------------------------------------------------
| Repository intelligence diff
|
| Compares the newest completed intelligence snapshot against the immediately
| previous snapshot. A repository with insufficient history still returns 200
| so the frontend can show a useful empty state instead of a missing page.
|--------------------------------------------------------------------------
*/
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/intelligence-diff",
    async (request, reply) => {
      const authentication = getAuthenticatedUser(request);

      if (!authentication.authenticated) {
        return reply.status(401).send({
          success: false,
          message:
            authentication.reason === "MISSING_TOKEN"
              ? "Authentication required."
              : "Invalid or expired authentication token.",
        });
      }

      const { repositoryId } = request.params;

      /*
       * Repository existence is checked separately from access so the endpoint
       * can return the precise status required by the API contract.
       */
      const repository =
        await prisma.repository.findUnique({
          where: {
            id: repositoryId,
          },
          select: {
            id: true,
            userId: true,
          },
        });

      if (!repository) {
        return reply.status(404).send({
          success: false,
          message: "Repository not found.",
        });
      }

      const isOwner =
        repository.userId === authentication.user.userId;

      const hasAdminAccess = isPlatformAdmin(
        authentication.user.username
      );

      if (!isOwner && !hasAdminAccess) {
        return reply.status(403).send({
          success: false,
          message:
            "You do not have permission to access this repository.",
        });
      }

      const diff =
        await intelligenceDiffService.getRepositoryDiff(
          repositoryId
        );

      /*
       * This should only be reachable if the repository disappears between the
       * access check and diff query, but the response remains safely handled.
       */
      if (!diff) {
        return reply.status(404).send({
          success: false,
          message: "Repository not found.",
        });
      }

      return reply.send({
        success: true,
        message: diff.hasDiff
          ? "Repository intelligence diff fetched successfully."
          : "Repository intelligence history is not yet sufficient for comparison.",
        data: diff,
      });
    }
  );


  // intelligence search analysis
  app.get<{
    Querystring: {
      query?: string;
      repositoryType?: string;
      domain?: string;
      technology?: string;
    };
  }>("/intelligence-search", async (request) => {
    const { query, repositoryType, domain, technology } = request.query;

    const normalize = (value?: string | null) =>
      value?.trim().toLowerCase() || "";

    const normalizedQuery = normalize(query);
    const normalizedRepositoryType = normalize(repositoryType);
    const normalizedDomain = normalize(domain);
    const normalizedTechnology = normalize(technology);

    const repositories = await prisma.repository.findMany({
      where: {
        isTracked: true,
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        description: true,
        language: true,
        architectureChanges: {
          select: {
            architectureDomain: true,
            detectedTechnology: true,
            repositoryTypes: true,
            reasoningSignals: true,
            summary: true,
            evolutionSummary: true,
          },
        },
      },
    });

    const results = repositories
      .map((repo) => {
        const domains = Array.from(
          new Set(
            repo.architectureChanges
              .map((change) => change.architectureDomain)
              .filter((item): item is string => Boolean(item))
          )
        );

        const technologies = Array.from(
          new Set(
            repo.architectureChanges
              .map((change) => change.detectedTechnology)
              .filter((item): item is string => Boolean(item))
          )
        );

        const repositoryTypes = Array.from(
          new Set(
            repo.architectureChanges
              .flatMap((change) => change.repositoryTypes?.split(",") || [])
              .map((item) => item.trim())
              .filter(Boolean)
          )
        );

        const reasoningSignals = Array.from(
          new Set(
            repo.architectureChanges
              .flatMap((change) => change.reasoningSignals?.split(" | ") || [])
              .map((item) => item.trim())
              .filter(Boolean)
          )
        );

        const searchableText = [
          repo.name,
          repo.fullName,
          repo.description,
          repo.language,
          ...domains,
          ...technologies,
          ...repositoryTypes,
          ...reasoningSignals,
          ...repo.architectureChanges.map((change) => change.summary),
          ...repo.architectureChanges.map((change) => change.evolutionSummary),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesQuery = normalizedQuery
          ? searchableText.includes(normalizedQuery)
          : true;

        const matchesRepositoryType = normalizedRepositoryType
          ? repositoryTypes.some(
            (type) => normalize(type) === normalizedRepositoryType
          )
          : true;

        const matchesDomain = normalizedDomain
          ? domains.some((item) => normalize(item) === normalizedDomain)
          : true;

        const matchesTechnology = normalizedTechnology
          ? technologies.some((item) =>
            normalize(item).includes(normalizedTechnology)
          )
          : true;

        const hasAnyIntelligence =
          domains.length > 0 ||
          technologies.length > 0 ||
          repositoryTypes.length > 0;

        if (
          !hasAnyIntelligence ||
          !matchesQuery ||
          !matchesRepositoryType ||
          !matchesDomain ||
          !matchesTechnology
        ) {
          return null;
        }

        const semanticProfile = generateRepositorySemanticProfile({
          repositoryName: repo.name,
          fullName: repo.fullName,
          description: repo.description,
          language: repo.language,
          repositoryTypes,
          domains,
          technologies,
          reasoningSignals,
        });

        return {
          id: repo.id,
          name: repo.name,
          fullName: repo.fullName,
          description: repo.description,
          language: repo.language,
          semanticLabel: semanticProfile.semanticLabel,
          semanticCategory: semanticProfile.semanticCategory,
          confidence: semanticProfile.confidence,
          repositoryTypes,
          dominantDomains: domains.slice(0, 5),
          technologies: technologies.slice(0, 8),
          matchedSignals: {
            query: query || null,
            repositoryType: repositoryType || null,
            domain: domain || null,
            technology: technology || null,
          },
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    return {
      success: true,
      message: "Repository intelligence search completed successfully",
      data: {
        count: results.length,
        filters: {
          query: query || null,
          repositoryType: repositoryType || null,
          domain: domain || null,
          technology: technology || null,
        },
        results,
      },
    };
  });

  // markdown report analysis
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/intelligence-report/markdown",
    async (request, reply) => {
      const { repositoryId } = request.params;

      const repository = await prisma.repository.findUnique({
        where: {
          id: repositoryId,
        },
        select: {
          id: true,
          name: true,
          fullName: true,
          description: true,
          language: true,

          /*
           * The latest intelligence snapshot owns repository purpose.
           *
           * ArchitectureChange rows still provide supporting engineering
           * evidence, but they no longer decide what the repository IS.
           */
          intelligenceSnapshots: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            select: {
              primaryRepositoryType: true,
              repositoryTypes: true,
              createdAt: true,
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

      const latestSnapshot =
        repository.intelligenceSnapshots[0];

      if (!latestSnapshot) {
        return reply.status(404).send({
          success: false,
          message:
            "Repository intelligence has not been generated yet. Reprocess the repository first.",
        });
      }

      const architectureChanges =
        await prisma.architectureChange.findMany({
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
            reasoningSignals: true,
            summary: true,
            evolutionSummary: true,
            createdAt: true,
          },
        });

      const domains = Array.from(
        new Set(
          architectureChanges
            .map(
              (change) =>
                change.architectureDomain
            )
            .filter(
              (domain): domain is string =>
                Boolean(domain)
            )
        )
      );

      const technologies = Array.from(
        new Set(
          architectureChanges
            .map(
              (change) =>
                change.detectedTechnology
            )
            .filter(
              (technology): technology is string =>
                Boolean(technology)
            )
        )
      );

      /**
    * Prisma exposes Json columns as JsonValue.
    *
    * Future me:
    * RepositoryIntelligenceSnapshot.repositoryTypes is persisted as a JSON array
    * of strings, but TypeScript only knows that it could be any valid JSON value.
    *
    * Convert it back into a clean string[] before giving it to intelligence
    * helpers or rendering it in Markdown.
    */
      const repositoryTypes: string[] =
        Array.isArray(
          latestSnapshot.repositoryTypes,
        )
          ? latestSnapshot.repositoryTypes.filter(
            (value): value is string =>
              typeof value === "string",
          )
          : [];

      const reasoningSignals = Array.from(
        new Set(
          architectureChanges
            .flatMap(
              (change) =>
                change.reasoningSignals?.split(" | ") ||
                []
            )
            .map((signal) => signal.trim())
            .filter(Boolean)
        )
      );

      const semanticProfile =
        generateRepositorySemanticProfile({
          repositoryName: repository.name,
          fullName: repository.fullName,
          description: repository.description,
          language: repository.language,
          repositoryTypes,
          domains,
          technologies,
          reasoningSignals,
        });

      const markdown = `# ${repository.name} Intelligence Report

## Repository

- Full Name: ${repository.fullName}
- Language: ${repository.language || "Unknown"}
- Primary Repository Type: ${latestSnapshot.primaryRepositoryType || "Unknown"}
- Semantic Category: ${semanticProfile.semanticLabel}
- Confidence: ${semanticProfile.confidence.confidenceLevel} (${semanticProfile.confidence.confidenceScore}%)

## Semantic Description

${semanticProfile.semanticDescription}

## Repository Types

${repositoryTypes
          .map((type) => `- ${type}`)
          .join("\n") || "- None detected"
        }

## Architecture Domains

${domains
          .map((domain) => `- ${domain}`)
          .join("\n") || "- None detected"
        }

## Detected Technologies

${technologies
          .map((tech) => `- ${tech}`)
          .join("\n") || "- None detected"
        }

## Reasoning Signals

${reasoningSignals
          .map((signal) => `- ${signal}`)
          .join("\n") || "- None available"
        }

## Recent Evidence

${architectureChanges
          .slice(0, 10)
          .map(
            (change) =>
              `- ${change.summary} (${change.architectureDomain || "GENERAL"})`
          )
          .join("\n")}
`;

      return {
        success: true,
        message:
          "Repository intelligence markdown report generated successfully",
        data: {
          repository: {
            id: repository.id,
            name: repository.name,
            fullName: repository.fullName,
            description: repository.description,
            language: repository.language,
          },
          markdown,
        },
      };
    }
  );


  // intelligence audit analysis
  // intelligence audit analysis
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/intelligence-audit",
    async (request, reply) => {
      const { repositoryId } = request.params;

      /**
       * Intelligence Audit is a CURRENT-STATE intelligence endpoint.
       *
       * Future me:
       * Do not rebuild current repository intelligence from ArchitectureChange.
       *
       * ArchitectureChange contains historical event-level evidence and stores
       * reasoningSignals as a legacy string field.
       *
       * RepositoryIntelligenceSnapshot contains the authoritative full-repository
       * intelligence generated during reprocessing, including structured signal
       * arrays with their original logical boundaries intact.
       */
      const repository =
        await prisma.repository.findUnique({
          where: {
            id: repositoryId,
          },

          select: {
            id: true,
            name: true,
            fullName: true,

            intelligenceSnapshots: {
              orderBy: [
                {
                  createdAt: "desc",
                },
                {
                  id: "desc",
                },
              ],

              take: 1,

              select: {
                id: true,

                repositoryTypes: true,
                technologies: true,
                architectureDomains: true,
                intelligence: true,

                createdAt: true,
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

      const latestSnapshot =
        repository.intelligenceSnapshots[0];

      /**
       * Do not silently downgrade to historical ArchitectureChange evidence.
       *
       * The intelligence report already follows the same rule: if canonical
       * repository intelligence has not been generated yet, reprocessing is
       * required.
       */
      if (!latestSnapshot) {
        return reply.status(404).send({
          success: false,
          message:
            "Repository intelligence has not been generated yet. Reprocess the repository first.",
        });
      }

      /**
       * These dedicated snapshot columns represent the complete canonical
       * signal sets generated during the latest repository refresh.
       */
      const repositoryTypes =
        readAuditStringArray(
          latestSnapshot.repositoryTypes
        );

      const domains =
        readAuditStringArray(
          latestSnapshot.architectureDomains
        );

      const technologies =
        readAuditStringArray(
          latestSnapshot.technologies
        );

      /**
       * reasoningSignals lives inside the full intelligence JSON payload.
       *
       * Unlike ArchitectureChange.reasoningSignals, this value is already a
       * structured string[] produced by the detector pipeline.
       */
      const reasoningSignals =
        readAuditReasoningSignals(
          latestSnapshot.intelligence
        );

      const audit =
        auditRepositoryIntelligence({
          repositoryTypes,
          domains,
          technologies,
          reasoningSignals,
        });

      return {
        success: true,
        message:
          "Repository intelligence audit fetched successfully",

        data: {
          repository: {
            id: repository.id,
            name: repository.name,
            fullName: repository.fullName,
          },

          audit,

          signals: {
            repositoryTypes,
            domains,
            technologies,
            reasoningSignals,
          },
        },
      };
    }
  );


  // comprehensive intelligence report
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/intelligence-report",
    async (request, reply) => {
      const { repositoryId } = request.params;

      /**
       * The intelligence report is a READ endpoint.
       *
       * Future me:
       * Do not regenerate the technology fingerprint here.
       *
       * Repository reprocessing already performs the expensive full-repository
       * analysis and stores the canonical result in RepositoryIntelligenceSnapshot.
       *
       * Re-running detectTechnologyFingerprint() from ArchitectureChange rows
       * gives the detector only partial historical evidence. That can downgrade
       * specialised repositories such as DEVTOOL_PLATFORM or FINTECH_PLATFORM
       * back to JAVASCRIPT_TYPESCRIPT_PROJECT.
       */
      const repository = await prisma.repository.findUnique({
        where: {
          id: repositoryId,
        },
        select: {
          id: true,
          name: true,
          fullName: true,
          description: true,
          language: true,
          stars: true,
          forks: true,
          createdAt: true,
          updatedAt: true,
          userId: true,

          architectureChanges: {
            orderBy: {
              createdAt: "desc",
            },
            select: {
              id: true,
              changeType: true,
              detectedTechnology: true,
              fileAffected: true,
              summary: true,
              repositoryTypes: true,
              reasoningSignals: true,
              architectureDomain: true,
              evolutionSummary: true,
              createdAt: true,
            },
          },

          /**
           * The newest snapshot is the authoritative repository intelligence
           * generated by the full reprocessing pipeline.
           */
          intelligenceSnapshots: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            select: {
              id: true,
              primaryRepositoryType: true,
              repositoryTypes: true,

              /**
               * This is the JSON intelligence payload stored by
               * RepositoryIntelligenceSnapshot.
               */
              intelligence: true,

              createdAt: true,
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

      const latestSnapshot =
        repository.intelligenceSnapshots[0];

      /**
       * A report without a canonical snapshot would force us to reconstruct
       * repository identity from weaker historical data.
       *
       * Do not silently do that.
       */
      if (!latestSnapshot) {
        return reply.status(404).send({
          success: false,
          message:
            "Repository intelligence has not been generated yet. Reprocess the repository first.",
        });
      }

      /**
       * Prisma exposes JSON columns as JsonValue.
       *
       * We persist repositoryTypes as an array of strings, so convert the JSON
       * value back into a safe string[] before using it downstream.
       */
      const canonicalRepositoryTypes: string[] =
        Array.isArray(
          latestSnapshot.repositoryTypes,
        )
          ? latestSnapshot.repositoryTypes.filter(
            (value): value is string =>
              typeof value === "string",
          )
          : [];

      /**
       * repositoryIntelligence is also persisted as JSON.
       *
       * The snapshot was created from TechnologyFingerprintResult, so this is
       * the canonical report generated during repository reprocessing.
       */
      const repositoryIntelligence =
        latestSnapshot.intelligence as any;

      /**
       * Keep canonical identity synchronized with the dedicated snapshot
       * columns.
       *
       * This gives us one source of truth even for snapshots produced before
       * every nested identity field was persisted consistently.
       */
      if (
        repositoryIntelligence?.identity
      ) {
        repositoryIntelligence.identity.primaryRepositoryType =
          latestSnapshot.primaryRepositoryType;

        repositoryIntelligence.identity.repositoryTypes =
          canonicalRepositoryTypes;

        if (
          repositoryIntelligence.identity.repositoryDNA
        ) {
          repositoryIntelligence.identity.repositoryDNA.engineeringProfile =
            latestSnapshot.primaryRepositoryType;

          repositoryIntelligence.identity.repositoryDNA.repositoryTypes =
            canonicalRepositoryTypes;
        }
      }

      /**
       * The summary must come from the same canonical identity returned inside
       * repositoryIntelligence.
       *
       * This prevents:
       *
       * summary = DEVTOOL_PLATFORM
       * identity = JAVASCRIPT_TYPESCRIPT_PROJECT
       *
       * or the reverse.
       */
      const summary = {
        primaryRepositoryType:
          latestSnapshot.primaryRepositoryType,

        persona:
          repositoryIntelligence?.identity
            ?.repositoryPersona ?? null,

        healthStatus:
          repositoryIntelligence?.assessment
            ?.repositoryHealth?.status ?? null,

        healthScore:
          repositoryIntelligence?.assessment
            ?.repositoryHealth?.score ?? null,

        maturityLevel:
          repositoryIntelligence?.assessment
            ?.repositoryMaturity?.level ?? null,

        maturityScore:
          repositoryIntelligence?.assessment
            ?.repositoryMaturity?.score ?? null,

        productionReadinessLevel:
          repositoryIntelligence?.assessment
            ?.productionReadiness?.level ?? null,

        productionReadinessScore:
          repositoryIntelligence?.assessment
            ?.productionReadiness?.score ?? null,

        engineeringQualityScore:
          repositoryIntelligence?.assessment
            ?.engineeringQuality?.overallScore ?? null,
      };

      /**
       * Everything below this point is legacy/report enrichment.
       *
       * ArchitectureChange records may still be used for timelines,
       * relationships, narratives, recommendations, and historical reasoning.
       *
       * They must NOT redefine canonical repository purpose.
       */
      const architectureChanges =
        repository.architectureChanges;

      const domains = Array.from(
        new Set(
          architectureChanges
            .map(
              (change) =>
                change.architectureDomain,
            )
            .filter(
              (
                domain,
              ): domain is string =>
                Boolean(domain),
            ),
        ),
      );

      const technologies = Array.from(
        new Set(
          architectureChanges
            .map(
              (change) =>
                change.detectedTechnology,
            )
            .filter(
              (
                technology,
              ): technology is string =>
                Boolean(technology),
            ),
        ),
      );

      const reasoningSignals =
        Array.from(
          new Set(
            architectureChanges
              .flatMap(
                (change) =>
                  change.reasoningSignals?.split(
                    " | ",
                  ) || [],
              )
              .map((signal) =>
                signal.trim(),
              )
              .filter(Boolean),
          ),
        );

      /**
       * Critical:
       *
       * Legacy report generators now receive the canonical repository purpose
       * instead of rebuilding purpose from ArchitectureChange history.
       */
      const repositoryTypes =
        canonicalRepositoryTypes;

      const architectureStyles =
        detectArchitectureStyle({
          domains,
          technologies,
          signals: [],
          repositoryTypes,
        });

      const capabilities = {
        frontendArchitecture:
          domains.includes(
            "FRONTEND_ARCHITECTURE",
          ),

        apiLayer:
          domains.includes(
            "API_LAYER",
          ),

        authentication:
          domains.includes(
            "AUTHENTICATION",
          ),

        realtimeSystems:
          domains.includes(
            "REALTIME_SYSTEMS",
          ),

        queueInfrastructure:
          domains.includes(
            "QUEUE_INFRASTRUCTURE",
          ),

        databaseLayer:
          domains.includes(
            "DATABASE_LAYER",
          ),

        cachingLayer:
          domains.includes(
            "CACHING_LAYER",
          ),

        architectureIntelligence:
          domains.includes(
            "ARCHITECTURE_INTELLIGENCE",
          ),
      };

      const semanticProfile =
        generateRepositorySemanticProfile({
          repositoryName:
            repository.name,

          fullName:
            repository.fullName,

          description:
            repository.description,

          language:
            repository.language,

          repositoryTypes,

          domains,

          technologies,

          reasoningSignals,
        });

      const narrative =
        generateRepositoryNarrative({
          repositoryName:
            repository.name,

          repositoryTypes,

          technologies,

          domains,

          capabilities,

          architectureStyles,

          architectureChangeCount:
            architectureChanges.length,
        });

      const confidence =
        calculateIntelligenceConfidence({
          repositoryTypes,
          domains,
          technologies,
          reasoningSignals,
        });

      const audit =
        auditRepositoryIntelligence({
          repositoryTypes,
          domains,
          technologies,
          reasoningSignals,
        });

      const evolutionDirection =
        inferEvolutionDirection({
          domains,
          repositoryTypes,
        });

      const engineeringReasoning =
        generateEngineeringReasoning({
          capabilities,
          domains,
          technologies,
          repositoryTypes,
          architectureStyles,
        });

      const syncedRecommendations =
        await syncEngineeringRecommendations({
          repositoryId,
          recommendations:
            engineeringReasoning.recommendations,
        });

      /**
       * Keep these calculations because recommendation synchronization may
       * depend on them elsewhere, even though they are not currently returned
       * directly by this endpoint.
       */
      const activeRecommendations =
        syncedRecommendations.filter(
          (recommendation) =>
            recommendation.status ===
            "ACTIVE",
        );

      const resolvedRecommendations =
        syncedRecommendations.filter(
          (recommendation) =>
            recommendation.status ===
            "RESOLVED",
        );

      const knowledgeGraph = [
        ...buildTechnologyRelationships({
          technologies,
          domains,
          repositoryTypes,
        }),

        ...buildDomainRelationships(
          domains,
        ),
      ];

      return {
        success: true,

        message:
          "Repository intelligence report fetched successfully",

        data: {
          repository: {
            id: repository.id,
            name: repository.name,
            fullName: repository.fullName,
            description:
              repository.description,
            language:
              repository.language,
            stars: repository.stars,
            forks: repository.forks,
            createdAt:
              repository.createdAt,
            updatedAt:
              repository.updatedAt,
          },

          /**
           * Both objects now originate from the same persisted snapshot.
           */
          summary,

          repositoryIntelligence,

          /**
           * Legacy intelligence remains available for existing frontend
           * consumers, but canonical repository purpose is supplied by the
           * snapshot.
           */
          legacy: {
            audit,
            confidence,
            engineeringReasoning,
            evolutionDirection,
            knowledgeGraph,
            narrative,
          },
        },
      };
    },
  );


  // intelligence timeline analysis
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/intelligence-timeline",
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
        orderBy: { createdAt: "asc" },
        select: {
          architectureDomain: true,
          detectedTechnology: true,
          summary: true,
          evolutionSummary: true,
          createdAt: true,
        },
      });

      const phases = buildIntelligenceTimeline(architectureChanges);

      return {
        success: true,
        message: "Repository intelligence timeline fetched successfully",
        data: {
          repository,
          timelineType: "INTELLIGENCE_PHASES",
          phases,
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
        where: {
          id: repositoryId,
        },
        select: {
          id: true,
          name: true,
          fullName: true,
          description: true,
          language: true,
          userId: true,

          architectureChanges: {
            orderBy: {
              createdAt: "desc",
            },
            select: {
              changeType: true,
              detectedTechnology: true,
              fileAffected: true,
              summary: true,
              repositoryTypes: true,
              reasoningSignals: true,
              architectureDomain: true,
              evolutionSummary: true,
            },
          },

          /**
           * Canonical repository intelligence is generated during reprocessing.
           *
           * Future me:
           * Narrative generation is a read operation. Do not rerun the repository
           * classifier here from partial ArchitectureChange history.
           */
          intelligenceSnapshots: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            select: {
              id: true,
              primaryRepositoryType: true,
              repositoryTypes: true,
              technologies: true,
              architectureDomains: true,
              capabilities: true,
              intelligence: true,
              createdAt: true,
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

      const latestSnapshot =
        repository.intelligenceSnapshots[0];

      if (!latestSnapshot) {
        return reply.status(404).send({
          success: false,
          message:
            "Repository intelligence has not been generated yet. Reprocess the repository first.",
        });
      }

      /**
       * Prisma JSON fields are returned as JsonValue, so normalise the values
       * we expect to use as arrays before passing them to intelligence helpers.
       */
      const repositoryTypes: string[] =
        Array.isArray(
          latestSnapshot.repositoryTypes,
        )
          ? latestSnapshot.repositoryTypes.filter(
            (value): value is string =>
              typeof value === "string",
          )
          : [];

      const snapshotTechnologies: string[] =
        Array.isArray(
          latestSnapshot.technologies,
        )
          ? latestSnapshot.technologies.filter(
            (value): value is string =>
              typeof value === "string",
          )
          : [];

      const snapshotArchitectureDomains: string[] =
        Array.isArray(
          latestSnapshot.architectureDomains,
        )
          ? latestSnapshot.architectureDomains.filter(
            (value): value is string =>
              typeof value === "string",
          )
          : [];

      /**
       * The complete intelligence report was persisted during the authoritative
       * repository-generation pipeline.
       */
      const repositoryIntelligence =
        latestSnapshot.intelligence as any;

      /**
       * Keep nested identity aligned with the dedicated canonical snapshot
       * columns.
       */
      if (
        repositoryIntelligence?.identity
      ) {
        repositoryIntelligence.identity.primaryRepositoryType =
          latestSnapshot.primaryRepositoryType;

        repositoryIntelligence.identity.repositoryTypes =
          repositoryTypes;

        if (
          repositoryIntelligence.identity.repositoryDNA
        ) {
          repositoryIntelligence.identity.repositoryDNA.engineeringProfile =
            latestSnapshot.primaryRepositoryType;

          repositoryIntelligence.identity.repositoryDNA.repositoryTypes =
            repositoryTypes;
        }
      }

      /**
       * Prefer persisted intelligence signals.
       *
       * Dedicated snapshot columns provide a safe fallback for older snapshots
       * where the nested intelligence JSON may not contain every signal.
       */
      const domains =
        repositoryIntelligence?.signals
          ?.architectureDomains?.length > 0
          ? repositoryIntelligence.signals
            .architectureDomains
          : snapshotArchitectureDomains;

      const technologies =
        repositoryIntelligence?.signals
          ?.technologies?.length > 0
          ? repositoryIntelligence.signals
            .technologies
          : snapshotTechnologies;

      const reasoningSignals: string[] =
        repositoryIntelligence?.signals
          ?.reasoningSignals?.length > 0
          ? repositoryIntelligence.signals
            .reasoningSignals
          : Array.from(
            new Set(
              repository.architectureChanges
                .flatMap(
                  (change) =>
                    change.reasoningSignals
                      ?.split(" | ") || [],
                )
                .map((signal) =>
                  signal.trim(),
                )
                .filter(Boolean),
            ),
          );

      const repositoryPurpose =
        inferRepositoryPurpose(
          repositoryTypes,
        );

      const intelligenceCapabilities =
        Array.isArray(
          repositoryIntelligence?.signals
            ?.capabilities,
        )
          ? repositoryIntelligence.signals
            .capabilities
          : [];

      const capabilities = {
        frontendArchitecture:
          domains.includes(
            "FRONTEND_ARCHITECTURE",
          ),

        apiLayer:
          domains.includes(
            "API_LAYER",
          ) ||
          domains.includes(
            "BACKEND_SYSTEMS",
          ),

        authentication:
          domains.includes(
            "AUTHENTICATION",
          ) ||
          intelligenceCapabilities.some(
            (capability: {
              key?: string;
            }) =>
              capability.key ===
              "AUTHENTICATION",
          ),

        realtimeSystems:
          domains.includes(
            "REALTIME_SYSTEMS",
          ) ||
          intelligenceCapabilities.some(
            (capability: {
              key?: string;
            }) =>
              capability.key ===
              "REALTIME_SYSTEMS",
          ),

        queueInfrastructure:
          domains.includes(
            "QUEUE_INFRASTRUCTURE",
          ) ||
          intelligenceCapabilities.some(
            (capability: {
              key?: string;
            }) =>
              capability.key ===
              "QUEUE_INFRASTRUCTURE",
          ),

        databaseLayer:
          domains.includes(
            "DATABASE_LAYER",
          ) ||
          intelligenceCapabilities.some(
            (capability: {
              key?: string;
            }) =>
              capability.key ===
              "DATABASE_LAYER",
          ),

        architectureIntelligence:
          repositoryTypes.includes(
            "ENGINEERING_INTELLIGENCE_PLATFORM",
          ) ||
          domains.includes(
            "ENGINEERING_INTELLIGENCE",
          ),
      };

      const engineeringSignals: string[] =
        Array.isArray(
          repositoryIntelligence?.signals
            ?.engineeringSignals,
        )
          ? repositoryIntelligence.signals
            .engineeringSignals
          : [];

      const architectureStyles =
        detectArchitectureStyle({
          domains,
          technologies,
          signals:
            engineeringSignals,
          repositoryTypes,
        });

      const narrative =
        generateRepositoryNarrative({
          repositoryName:
            repository.name,

          repositoryTypes,

          technologies,

          domains,

          capabilities,

          architectureStyles,

          architectureChangeCount:
            Math.max(
              repository
                .architectureChanges
                .length,
              domains.length,
            ),
        });

      const confidence =
        calculateIntelligenceConfidence({
          repositoryTypes,
          domains,
          technologies,
          reasoningSignals,
        });

      return {
        success: true,
        message:
          "Repository narrative generated successfully",
        data: {
          repository: {
            id: repository.id,
            name: repository.name,
            fullName:
              repository.fullName,
            language:
              repository.language,
            userId:
              repository.userId,
          },

          narrative,

          confidence,

          reasoningSignals,

          repositoryPurpose,

          repositoryIntelligence,
        },
      };
    },
  );

  // Architecture radar data for visualization
  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/architecture-radar",
    async (request, reply) => {
      const { repositoryId } = request.params;

      /**
       * Architecture Radar is a read endpoint.
       *
       * Future me:
       * Do not call detectTechnologyFingerprint() from here.
       *
       * Repository classification belongs to the intelligence generation
       * pipeline. Once that pipeline has resolved and persisted repository
       * identity, read endpoints should consume that canonical snapshot
       * rather than attempting to classify the repository again from
       * partial ArchitectureChange history.
       */
      const repository = await prisma.repository.findUnique({
        where: {
          id: repositoryId,
        },
        select: {
          id: true,
          name: true,
          fullName: true,
          description: true,
          language: true,
          userId: true,

          /**
           * The latest intelligence snapshot is the authoritative
           * representation of the generated repository intelligence.
           */
          intelligenceSnapshots: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            select: {
              id: true,
              intelligence: true,
              createdAt: true,
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

      const latestSnapshot =
        repository.intelligenceSnapshots[0];

      if (!latestSnapshot) {
        return reply.status(404).send({
          success: false,
          message:
            "Repository intelligence has not been generated yet. Reprocess the repository first.",
        });
      }

      /**
       * Prisma exposes JSON columns as JsonValue.
       *
       * The intelligence generator is responsible for writing a complete
       * RepositoryIntelligenceReport into this snapshot. We only validate
       * enough here to safely consume it.
       */
      const snapshotValue =
        latestSnapshot.intelligence;

      if (
        !snapshotValue ||
        typeof snapshotValue !== "object" ||
        Array.isArray(snapshotValue)
      ) {
        return reply.status(500).send({
          success: false,
          message:
            "Stored repository intelligence snapshot is invalid.",
        });
      }

      /**
       * This cast is intentionally performed only after validating that the
       * stored JSON value is an object.
       *
       * Most importantly, we are NOT rebuilding repository identity here.
       */
      const repositoryIntelligence =
        snapshotValue as unknown as RepositoryIntelligenceReport;

      /**
       * Architecture intelligence is derived from the canonical persisted
       * report. This keeps the radar aligned with Repository Purpose,
       * Narrative, Intelligence Report, and every other read surface.
       */
      const architectureIntelligence =
        buildArchitectureIntelligence({
          repositoryIntelligence,
        });

      return {
        success: true,
        message:
          "Repository architecture radar fetched successfully",
        data: {
          repository: {
            id: repository.id,
            name: repository.name,
            fullName: repository.fullName,
            language: repository.language,
            userId: repository.userId,
          },

          radar:
            architectureIntelligence.radar,

          strongestDomain:
            architectureIntelligence.strongestDomain,

          repositoryIntelligence,

          architectureIntelligence,

          /**
           * Useful when debugging stale intelligence later.
           * This tells us exactly which persisted snapshot powered
           * the response.
           */
          intelligenceSnapshot: {
            id: latestSnapshot.id,
            createdAt: latestSnapshot.createdAt,
          },
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
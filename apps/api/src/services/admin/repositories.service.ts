import { prisma } from "@archive/database";
import { GENERATED_CHANGE_TYPE } from "../../constants/intelligence.constants";
import { generateRepositoryIntelligence } from "../repository-intelligence.service";

type GetRepositoriesParams = {
  page?: number;
  limit?: number;
  search?: string;
  language?: string;
  tracked?: boolean;
};

const normalizePagination = ({
  page = 1,
  limit = 20,
}: GetRepositoriesParams) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
};

const splitStoredList = (value?: string | null) => {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const adminRepositoriesService = {
  async getRepositories(params: GetRepositoriesParams = {}) {
    const { page, limit, skip } = normalizePagination(params);
    const search = params.search?.trim();

    const where = {
      ...(typeof params.tracked === "boolean"
        ? { isTracked: params.tracked }
        : {}),
      ...(params.language
        ? {
            language: {
              equals: params.language,
              mode: "insensitive" as const,
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { owner: { contains: search, mode: "insensitive" as const } },
              { fullName: { contains: search, mode: "insensitive" as const } },
              {
                description: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    const [totalItems, repositories] = await Promise.all([
      prisma.repository.count({ where }),
      prisma.repository.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          owner: true,
          fullName: true,
          description: true,
          language: true,
          stars: true,
          forks: true,
          isTracked: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          architectureChanges: {
            where: { changeType: GENERATED_CHANGE_TYPE },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              repositoryTypes: true,
              architectureDomain: true,
              detectedTechnology: true,
              reasoningSignals: true,
              evolutionSummary: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              events: true,
              timelineEntries: true,
              architectureChanges: true,
              engineeringRecommendations: true,
            },
          },
        },
      }),
    ]);

    return {
      repositories: repositories.map((repository) => {
        const latestIntelligence = repository.architectureChanges[0];
        const repositoryTypes = splitStoredList(
          latestIntelligence?.repositoryTypes
        );

        return {
          id: repository.id,
          name: repository.name,
          owner: repository.owner,
          fullName: repository.fullName,
          description: repository.description,
          language: repository.language,
          stars: repository.stars,
          forks: repository.forks,
          tracked: repository.isTracked,
          createdAt: repository.createdAt,
          updatedAt: repository.updatedAt,
          ownerUser: repository.user,
          intelligence: {
            primaryRepositoryType:
              repositoryTypes[0] || "GENERAL_ENGINEERING_PROJECT",
            repositoryTypes,
            architectureDomain:
              latestIntelligence?.architectureDomain || "GENERAL_ENGINEERING",
            detectedTechnology: latestIntelligence?.detectedTechnology || null,
            reasoningSignals: splitStoredList(
              latestIntelligence?.reasoningSignals
            ),
            evolutionSummary: latestIntelligence?.evolutionSummary || null,
            lastGeneratedAt: latestIntelligence?.createdAt || null,
          },
          counts: {
            events: repository._count.events,
            timelineEntries: repository._count.timelineEntries,
            architectureChanges: repository._count.architectureChanges,
            recommendations: repository._count.engineeringRecommendations,
          },
        };
      }),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  },

  async getRepository(repositoryId: string) {
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
      select: {
        id: true,
        githubRepoId: true,
        name: true,
        owner: true,
        fullName: true,
        description: true,
        defaultBranch: true,
        language: true,
        stars: true,
        forks: true,
        isTracked: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
        timelineEntries: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            summary: true,
            importanceScore: true,
            generatedByAI: true,
            createdAt: true,
          },
        },
        architectureChanges: {
          orderBy: { createdAt: "desc" },
          take: 20,
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
        engineeringRecommendations: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            recommendationKey: true,
            title: true,
            description: true,
            status: true,
            evidence: true,
            resolvedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: {
          select: {
            events: true,
            timelineEntries: true,
            architectureChanges: true,
            engineeringRecommendations: true,
          },
        },
      },
    });

    if (!repository) return null;

    const latestIntelligence = repository.architectureChanges.find(
      (change) => change.changeType === GENERATED_CHANGE_TYPE
    );

    const repositoryTypes = splitStoredList(latestIntelligence?.repositoryTypes);

    return {
      ...repository,
      intelligence: {
        primaryRepositoryType:
          repositoryTypes[0] || "GENERAL_ENGINEERING_PROJECT",
        repositoryTypes,
        architectureDomain:
          latestIntelligence?.architectureDomain || "GENERAL_ENGINEERING",
        detectedTechnology: latestIntelligence?.detectedTechnology || null,
        reasoningSignals: splitStoredList(latestIntelligence?.reasoningSignals),
        evolutionSummary: latestIntelligence?.evolutionSummary || null,
        lastGeneratedAt: latestIntelligence?.createdAt || null,
      },
    };
  },

  async reprocessRepository(repositoryId: string) {
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
      select: {
        id: true,
        name: true,
        fullName: true,
      },
    });

    if (!repository) return null;

    const result = await generateRepositoryIntelligence({ repositoryId });

    return {
      repository,
      result,
    };
  },

  async deleteRepository(repositoryId: string) {
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
      select: {
        id: true,
        name: true,
        fullName: true,
      },
    });

    if (!repository) return null;

    await prisma.repository.delete({
      where: { id: repositoryId },
    });

    return repository;
  },
};
import { prisma } from "@archive/database";

type GetUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
};

const normalizePagination = ({ page = 1, limit = 20 }: GetUsersParams) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
};

export const adminUsersService = {
  async getUsers(params: GetUsersParams = {}) {
    const { page, limit, skip } = normalizePagination(params);
    const search = params.search?.trim();

    const where = search
      ? {
          OR: [
            {
              username: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {};

    const [totalItems, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          repositories: {
            select: {
              id: true,
              isTracked: true,
              updatedAt: true,
            },
          },
        },
      }),
    ]);

    return {
      users: users.map((user) => {
        const lastRepositoryActivity =
          user.repositories
            .map((repository) => repository.updatedAt)
            .sort((a, b) => b.getTime() - a.getTime())[0] || null;

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
          joinedAt: user.createdAt,
          updatedAt: user.updatedAt,
          repositoryCount: user.repositories.length,
          trackedRepositories: user.repositories.filter(
            (repository) => repository.isTracked
          ).length,
          lastActivity: lastRepositoryActivity,
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

  async getUser(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        githubId: true,
        username: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        repositories: {
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            name: true,
            owner: true,
            fullName: true,
            language: true,
            stars: true,
            forks: true,
            isTracked: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                events: true,
                timelineEntries: true,
                architectureChanges: true,
                engineeringRecommendations: true,
              },
            },
          },
        },
      },
    });
  },
};
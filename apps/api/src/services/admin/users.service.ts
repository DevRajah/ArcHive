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
  async getUsers(params: GetUsersParams) {
    const { page, limit, skip } = normalizePagination(params);
    const search = params.search?.trim();

    const where = search
      ? {
          OR: [
            {
              githubUsername: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              name: {
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
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        select: {
          id: true,
          githubUsername: true,
          name: true,
          avatarUrl: true,
          createdAt: true,
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

    const mappedUsers = users.map((user) => {
      const repositoryCount = user.repositories.length;

      const trackedRepositories = user.repositories.filter(
        (repository) => repository.isTracked
      ).length;

      // Last activity is currently inferred from repository updates.
      // This keeps the admin dashboard useful before a dedicated activity table exists.
      const lastActivity =
        user.repositories
          .map((repository) => repository.updatedAt)
          .sort((a, b) => b.getTime() - a.getTime())[0] || null;

      return {
        id: user.id,
        githubUsername: user.githubUsername,
        name: user.name,
        avatarUrl: user.avatarUrl,
        joinedAt: user.createdAt,
        repositoryCount,
        trackedRepositories,
        lastActivity,
      };
    });

    return {
      users: mappedUsers,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  },
};
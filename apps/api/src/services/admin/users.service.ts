import { prisma } from "@archive/database";

type GetUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
};

const normalizePagination = ({
  page = 1,
  limit = 20,
}: GetUsersParams) => {
  const safePage =
    Math.max(
      Number(page) || 1,
      1,
    );

  const safeLimit =
    Math.min(
      Math.max(
        Number(limit) || 20,
        1,
      ),
      100,
    );

  return {
    page: safePage,
    limit: safeLimit,
    skip:
      (safePage - 1) *
      safeLimit,
  };
};

export const adminUsersService = {
  async getUsers(
    params: GetUsersParams = {},
  ) {
    const {
      page,
      limit,
      skip,
    } =
      normalizePagination(
        params,
      );

    const search =
      params.search?.trim();

    const where = search
      ? {
          OR: [
            {
              username: {
                contains:
                  search,

                mode:
                  "insensitive" as const,
              },
            },
            {
              email: {
                contains:
                  search,

                mode:
                  "insensitive" as const,
              },
            },
          ],
        }
      : {};

    const [
      totalItems,
      users,
    ] =
      await Promise.all([
        prisma.user.count({
          where,
        }),

        prisma.user.findMany({
          where,

          orderBy: {
            createdAt: "desc",
          },

          skip,
          take: limit,

          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,

            /**
             * joinedAt represents when the
             * ArcHive account was created.
             */
            createdAt: true,

            /**
             * updatedAt is Prisma's normal row
             * modification timestamp.
             *
             * Do not use it as user activity.
             */
            updatedAt: true,

            /**
             * This is now the canonical
             * user-activity timestamp.
             *
             * It is updated only by genuine
             * user-driven ArcHive actions.
             */
            lastActivityAt: true,

            repositories: {
              select: {
                id: true,
                isTracked: true,
              },
            },
          },
        }),
      ]);

    return {
      users:
        users.map(
          (user) => {
            return {
              id: user.id,

              username:
                user.username,

              email:
                user.email,

              avatarUrl:
                user.avatarUrl,

              joinedAt:
                user.createdAt,

              updatedAt:
                user.updatedAt,

              repositoryCount:
                user.repositories.length,

              trackedRepositories:
                user.repositories.filter(
                  (
                    repository,
                  ) =>
                    repository.isTracked,
                ).length,

              /**
               * Future me:
               *
               * Do not derive this from
               * Repository.updatedAt.
               *
               * Repository timestamps can change
               * because of background processing,
               * GitHub webhooks, metadata syncing,
               * or automatic intelligence work.
               *
               * lastActivityAt represents the
               * most recent intentional human
               * interaction with ArcHive.
               */
              lastActivityAt:
                user.lastActivityAt,
            };
          },
        ),

      pagination: {
        page,
        limit,
        totalItems,

        totalPages:
          Math.ceil(
            totalItems /
              limit,
          ),
      },
    };
  },

  async getUser(
    userId: string,
  ) {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        githubId: true,
        username: true,
        email: true,
        avatarUrl: true,

        createdAt: true,
        updatedAt: true,

        /**
         * Keep the detailed user endpoint
         * aligned with the admin users list.
         */
        lastActivityAt: true,

        repositories: {
          orderBy: {
            updatedAt: "desc",
          },

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
                timelineEntries:
                  true,

                architectureChanges:
                  true,

                engineeringRecommendations:
                  true,
              },
            },
          },
        },
      },
    });
  },
};
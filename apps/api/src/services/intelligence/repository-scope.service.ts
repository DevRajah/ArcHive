import { prisma } from "@archive/database";

import {
  RepositoryScope,
  RepositoryScopeType,
} from "../../types/repository-scope.types";

/**
 * Single source of truth for loading repositories used by
 * Organization Intelligence, Executive Reports and future Team Intelligence.
 *
 * Future me:
 * Never query repositories directly from organization services.
 * Always come through this service so USER and TEAM scopes stay consistent.
 */

const ensureValidScope = (scope: RepositoryScope) => {
  switch (scope.type) {
    case RepositoryScopeType.USER:
      if (!scope.userId?.trim()) {
        throw new Error(
          "USER repository scope requires a userId.",
        );
      }
      return;

    case RepositoryScopeType.TEAM:
      if (!scope.teamId?.trim()) {
        throw new Error(
          "TEAM repository scope requires a teamId.",
        );
      }
      return;

    default:
      throw new Error(
        "Unsupported repository scope.",
      );
  }
};

export const getRepositoriesForScope = async (
  scope: RepositoryScope,
) => {
  ensureValidScope(scope);

  switch (scope.type) {
    case RepositoryScopeType.USER:
      return prisma.repository.findMany({
        where: {
          userId: scope.userId!,
          isTracked: true,
        },
      });

    case RepositoryScopeType.TEAM: {
      const repositories =
        await prisma.teamRepository.findMany({
          where: {
            teamId: scope.teamId!,
          },

          include: {
            repository: true,
          },
        });

      return repositories.map(
        (item) => item.repository,
      );
    }
  }
};

export const getRepositoryIdsForScope =
  async (scope: RepositoryScope) => {
    const repositories =
      await getRepositoriesForScope(scope);

    return repositories.map(
      (repository) => repository.id,
    );
  };

export const getRepositoryCountForScope =
  async (scope: RepositoryScope) => {
    const repositoryIds =
      await getRepositoryIdsForScope(scope);

    return repositoryIds.length;
  };

export const getTrackedRepositoryCountForScope =
  async (scope: RepositoryScope) => {
    const repositories =
      await getRepositoriesForScope(scope);

    return repositories.filter(
      (repository) => repository.isTracked,
    ).length;
  };
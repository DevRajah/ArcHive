import { TeamMemberRole } from "@prisma/client";

import { prisma } from "@archive/database";

import type {
  AddTeamRepositoryInput,
  TeamRepositoryResponse,
} from "../../types/team.types";

import {
  requireTeamMembership,
  requireTeamRole,
  TeamNotFoundError,
  TeamValidationError,
} from "./team-permission.service";

export const getTeamRepositories = async ({
  teamId,
  actorUserId,
}: {
  teamId: string;
  actorUserId: string;
}): Promise<TeamRepositoryResponse[]> => {
  await requireTeamMembership({
    teamId,
    userId: actorUserId,
  });

  const repositories =
    await prisma.teamRepository.findMany({
      where: {
        teamId,
      },

      orderBy: {
        addedAt: "desc",
      },

      include: {
        repository: {
          select: {
            id: true,
            name: true,
            owner: true,
            fullName: true,
            description: true,
            language: true,
            isTracked: true,
          },
        },

        addedBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

  return repositories.map((item) => ({
    id: item.id,
    repositoryId: item.repository.id,
    name: item.repository.name,
    owner: item.repository.owner,
    fullName: item.repository.fullName,
    description:
      item.repository.description,
    language: item.repository.language,
    isTracked: item.repository.isTracked,
    addedAt: item.addedAt,
    addedBy: item.addedBy,
  }));
};

export const addTeamRepository = async ({
  teamId,
  input,
}: {
  teamId: string;
  input: AddTeamRepositoryInput;
}) => {
  await requireTeamRole({
    teamId,
    userId: input.actorUserId,
    allowedRoles: [
      TeamMemberRole.OWNER,
      TeamMemberRole.ADMIN,
      TeamMemberRole.MEMBER,
    ],
  });

  const repository =
    await prisma.repository.findUnique({
      where: {
        id: input.repositoryId,
      },
      select: {
        id: true,
        userId: true,
      },
    });

  if (!repository) {
    throw new TeamValidationError(
      "The selected repository does not exist.",
    );
  }

  /**
   * A user may only share a repository that they originally imported.
   * This prevents team members from attaching unrelated users' repositories.
   */
  if (repository.userId !== input.actorUserId) {
    throw new TeamValidationError(
      "You can only add repositories that belong to your ArcHive account.",
    );
  }

  const existing =
    await prisma.teamRepository.findUnique({
      where: {
        teamId_repositoryId: {
          teamId,
          repositoryId:
            input.repositoryId,
        },
      },
    });

  if (existing) {
    throw new TeamValidationError(
      "This repository already belongs to the team.",
    );
  }

  return prisma.teamRepository.create({
    data: {
      teamId,
      repositoryId:
        input.repositoryId,
      addedById:
        input.actorUserId,
    },
  });
};

export const removeTeamRepository = async ({
  teamId,
  repositoryId,
  actorUserId,
}: {
  teamId: string;
  repositoryId: string;
  actorUserId: string;
}) => {
  await requireTeamRole({
    teamId,
    userId: actorUserId,
    allowedRoles: [
      TeamMemberRole.OWNER,
      TeamMemberRole.ADMIN,
      TeamMemberRole.MEMBER,
    ],
  });

  const teamRepository =
    await prisma.teamRepository.findUnique({
      where: {
        teamId_repositoryId: {
          teamId,
          repositoryId,
        },
      },
    });

  if (!teamRepository) {
    throw new TeamNotFoundError(
      "Team repository not found.",
    );
  }

  /**
   * Members may remove repositories they added themselves.
   * Owners and administrators may remove any repository.
   */
  const membership =
    await requireTeamMembership({
      teamId,
      userId: actorUserId,
    });

  const isManager =
    membership.role === TeamMemberRole.OWNER ||
    membership.role === TeamMemberRole.ADMIN;

  if (
    !isManager &&
    teamRepository.addedById !==
      actorUserId
  ) {
    throw new TeamValidationError(
      "Members can only remove repositories they added themselves.",
    );
  }

  await prisma.teamRepository.delete({
    where: {
      id: teamRepository.id,
    },
  });
};
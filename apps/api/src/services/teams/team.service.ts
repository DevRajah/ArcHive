import { TeamMemberRole } from "@prisma/client";

import { prisma } from "@archive/database";

import type {
  CreateTeamInput,
  TeamSummary,
  UpdateTeamInput,
} from "../../types/team.types";

import {
  requireTeamMembership,
  requireTeamRole,
  TeamNotFoundError,
  TeamValidationError,
} from "./team-permission.service";

const createSlugBase = (name: string) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

/**
 * Generates a unique team slug without forcing users to invent one.
 */
const createUniqueTeamSlug = async (
  name: string,
): Promise<string> => {
  const baseSlug = createSlugBase(name);

  if (!baseSlug) {
    throw new TeamValidationError(
      "The team name must contain at least one letter or number.",
    );
  }

  let slug = baseSlug;
  let suffix = 1;

  while (
    await prisma.team.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    })
  ) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
};

export const createTeam = async (
  input: CreateTeamInput,
) => {
  const name = input.name?.trim();
  const description =
    input.description?.trim() || null;

  if (!input.userId?.trim()) {
    throw new TeamValidationError(
      "A userId is required to create a team.",
    );
  }

  if (!name) {
    throw new TeamValidationError(
      "A team name is required.",
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: input.userId,
    },
    select: {
      id: true,
      username: true,
    },
  });

  if (!user) {
    throw new TeamValidationError(
      "The selected ArcHive user does not exist.",
    );
  }

  const slug = await createUniqueTeamSlug(name);

  return prisma.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        name,
        slug,
        description,
        createdById: user.id,
      },
    });

    /**
     * The creator automatically becomes the permanent initial owner.
     */
    await tx.teamMember.create({
      data: {
        teamId: team.id,
        userId: user.id,
        role: TeamMemberRole.OWNER,
      },
    });

    return {
      ...team,
      role: TeamMemberRole.OWNER,
      memberCount: 1,
      repositoryCount: 0,
    };
  });
};

export const getUserTeams = async (
  userId: string,
): Promise<TeamSummary[]> => {
  const memberships =
    await prisma.teamMember.findMany({
      where: {
        userId,
      },

      orderBy: {
        team: {
          updatedAt: "desc",
        },
      },

      include: {
        team: {
          include: {
            _count: {
              select: {
                members: true,
                repositories: true,
              },
            },
          },
        },
      },
    });

  return memberships.map((membership) => ({
    id: membership.team.id,
    name: membership.team.name,
    slug: membership.team.slug,
    description: membership.team.description,
    role: membership.role,
    memberCount:
      membership.team._count.members,
    repositoryCount:
      membership.team._count.repositories,
    createdAt: membership.team.createdAt,
    updatedAt: membership.team.updatedAt,
  }));
};

export const getTeamDetails = async ({
  teamId,
  userId,
}: {
  teamId: string;
  userId: string;
}) => {
  const membership =
    await requireTeamMembership({
      teamId,
      userId,
    });

  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },

    include: {
      createdBy: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },

      _count: {
        select: {
          members: true,
          repositories: true,
        },
      },
    },
  });

  if (!team) {
    throw new TeamNotFoundError();
  }

  return {
    id: team.id,
    name: team.name,
    slug: team.slug,
    description: team.description,
    currentUserRole: membership.role,
    createdBy: team.createdBy,
    memberCount: team._count.members,
    repositoryCount:
      team._count.repositories,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  };
};

export const updateTeam = async ({
  teamId,
  input,
}: {
  teamId: string;
  input: UpdateTeamInput;
}) => {
  await requireTeamRole({
    teamId,
    userId: input.actorUserId,
    allowedRoles: [
      TeamMemberRole.OWNER,
      TeamMemberRole.ADMIN,
    ],
  });

  const data: {
    name?: string;
    slug?: string;
    description?: string | null;
  } = {};

  if (input.name !== undefined) {
    const name = input.name.trim();

    if (!name) {
      throw new TeamValidationError(
        "The team name cannot be empty.",
      );
    }

    data.name = name;
    data.slug = await createUniqueTeamSlug(name);
  }

  if (input.description !== undefined) {
    data.description =
      input.description?.trim() || null;
  }

  return prisma.team.update({
    where: {
      id: teamId,
    },
    data,
  });
};

export const deleteTeam = async ({
  teamId,
  actorUserId,
}: {
  teamId: string;
  actorUserId: string;
}) => {
  await requireTeamRole({
    teamId,
    userId: actorUserId,
    allowedRoles: [TeamMemberRole.OWNER],
  });

  await prisma.team.delete({
    where: {
      id: teamId,
    },
  });
};
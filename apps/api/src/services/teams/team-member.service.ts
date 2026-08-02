import { TeamMemberRole } from "@prisma/client";

import { prisma } from "@archive/database";

import type {
  AddTeamMemberInput,
  TeamMemberResponse,
  UpdateTeamMemberInput,
} from "../../types/team.types";

import {
  requireTeamMembership,
  requireTeamRole,
  TeamAccessDeniedError,
  TeamNotFoundError,
  TeamValidationError,
} from "./team-permission.service";

const managementRoles = [
  TeamMemberRole.OWNER,
  TeamMemberRole.ADMIN,
];

export const getTeamMembers = async ({
  teamId,
  actorUserId,
}: {
  teamId: string;
  actorUserId: string;
}): Promise<TeamMemberResponse[]> => {
  await requireTeamMembership({
    teamId,
    userId: actorUserId,
  });

  const members =
    await prisma.teamMember.findMany({
      where: {
        teamId,
      },

      orderBy: [
        {
          role: "asc",
        },
        {
          joinedAt: "asc",
        },
      ],

      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

  return members.map((member) => ({
    id: member.id,
    userId: member.userId,
    username: member.user.username,
    email: member.user.email,
    avatarUrl: member.user.avatarUrl,
    role: member.role,
    joinedAt: member.joinedAt,
  }));
};

export const addTeamMember = async ({
  teamId,
  input,
}: {
  teamId: string;
  input: AddTeamMemberInput;
}) => {
  await requireTeamRole({
    teamId,
    userId: input.actorUserId,
    allowedRoles: managementRoles,
  });

  if (input.role === TeamMemberRole.OWNER) {
    throw new TeamValidationError(
      "A new owner cannot be assigned through the member endpoint.",
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: input.userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new TeamValidationError(
      "The selected ArcHive user does not exist.",
    );
  }

  const existing =
    await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: input.userId,
        },
      },
    });

  if (existing) {
    throw new TeamValidationError(
      "This user is already a team member.",
    );
  }

  return prisma.teamMember.create({
    data: {
      teamId,
      userId: input.userId,
      role:
        input.role ?? TeamMemberRole.MEMBER,
    },
  });
};

export const updateTeamMemberRole = async ({
  teamId,
  memberId,
  input,
}: {
  teamId: string;
  memberId: string;
  input: UpdateTeamMemberInput;
}) => {
  const actorMembership =
    await requireTeamRole({
      teamId,
      userId: input.actorUserId,
      allowedRoles: managementRoles,
    });

  const target =
    await prisma.teamMember.findFirst({
      where: {
        id: memberId,
        teamId,
      },
    });

  if (!target) {
    throw new TeamNotFoundError(
      "Team member not found.",
    );
  }

  if (target.role === TeamMemberRole.OWNER) {
    throw new TeamAccessDeniedError(
      "The team owner's role cannot be changed through this endpoint.",
    );
  }

  if (
    actorMembership.role === TeamMemberRole.ADMIN &&
    target.role === TeamMemberRole.ADMIN
  ) {
    throw new TeamAccessDeniedError(
      "An administrator cannot change another administrator's role.",
    );
  }

  return prisma.teamMember.update({
    where: {
      id: target.id,
    },
    data: {
      role: input.role,
    },
  });
};

export const removeTeamMember = async ({
  teamId,
  memberId,
  actorUserId,
}: {
  teamId: string;
  memberId: string;
  actorUserId: string;
}) => {
  const actorMembership =
    await requireTeamRole({
      teamId,
      userId: actorUserId,
      allowedRoles: managementRoles,
    });

  const target =
    await prisma.teamMember.findFirst({
      where: {
        id: memberId,
        teamId,
      },
    });

  if (!target) {
    throw new TeamNotFoundError(
      "Team member not found.",
    );
  }

  if (target.role === TeamMemberRole.OWNER) {
    throw new TeamAccessDeniedError(
      "The team owner cannot be removed.",
    );
  }

  if (
    actorMembership.role === TeamMemberRole.ADMIN &&
    target.role === TeamMemberRole.ADMIN
  ) {
    throw new TeamAccessDeniedError(
      "An administrator cannot remove another administrator.",
    );
  }

  await prisma.teamMember.delete({
    where: {
      id: target.id,
    },
  });
};
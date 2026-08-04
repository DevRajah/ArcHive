import {
  TeamInvitationStatus,
  TeamMemberRole,
} from "@prisma/client";

import { prisma } from "@archive/database";

import type {
  CreateTeamInvitationInput,
  TeamInvitationResponse,
} from "../../types/team-invitation.types";

import {
  requireTeamMembership,
  requireTeamRole,
  TeamAccessDeniedError,
  TeamNotFoundError,
} from "./team-permission.service";

import {
  TeamInvitationConflictError,
  TeamInvitationNotFoundError,
  TeamInvitationValidationError,
} from "./team-invitation.errors";

const invitationManagementRoles = [
  TeamMemberRole.OWNER,
  TeamMemberRole.ADMIN,
];

const INVITATION_EXPIRY_DAYS = 7;

const mapInvitation = (
  invitation: {
    id: string;
    teamId: string;
    role: TeamMemberRole;
    status: TeamInvitationStatus;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
    acceptedAt: Date | null;
    rejectedAt: Date | null;
    cancelledAt: Date | null;

    invitedBy: {
      id: string;
      username: string;
      avatarUrl: string | null;
    };

    invitee: {
      id: string;
      username: string;
      email: string | null;
      avatarUrl: string | null;
    };
  },
): TeamInvitationResponse => {
  return {
    ...invitation,

    role:
      invitation.role as Exclude<
        TeamMemberRole,
        "OWNER"
      >,
  };
};

/**
 * Converts old pending invitations to EXPIRED before returning them.
 */
const expireOldInvitations = async (
  teamId?: string,
): Promise<void> => {
  await prisma.teamInvitation.updateMany({
    where: {
      ...(teamId
        ? {
            teamId,
          }
        : {}),

      status:
        TeamInvitationStatus.PENDING,

      expiresAt: {
        lte: new Date(),
      },
    },

    data: {
      status:
        TeamInvitationStatus.EXPIRED,
    },
  });
};

export const createTeamInvitation = async ({
  teamId,
  input,
}: {
  teamId: string;
  input: CreateTeamInvitationInput;
}): Promise<TeamInvitationResponse> => {
  await requireTeamRole({
    teamId,
    userId: input.actorUserId,
    allowedRoles:
      invitationManagementRoles,
  });

  if (!input.inviteeUserId?.trim()) {
    throw new TeamInvitationValidationError(
      "An inviteeUserId is required.",
    );
  }

//   if (
//     input.role ===
//     TeamMemberRole.OWNER
//   ) {
//     throw new TeamInvitationValidationError(
//       "OWNER cannot be assigned through a team invitation.",
//     );
//   }

  const team =
    await prisma.team.findUnique({
      where: {
        id: teamId,
      },

      select: {
        id: true,
      },
    });

  if (!team) {
    throw new TeamNotFoundError();
  }

  const invitee =
    await prisma.user.findUnique({
      where: {
        id: input.inviteeUserId,
      },

      select: {
        id: true,
      },
    });

  if (!invitee) {
    throw new TeamInvitationValidationError(
      "The selected ArcHive user does not exist.",
    );
  }

  const existingMembership =
    await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId:
            input.inviteeUserId,
        },
      },
    });

  if (existingMembership) {
    throw new TeamInvitationConflictError(
      "This user is already a team member.",
    );
  }

  await expireOldInvitations(teamId);

  const existingInvitation =
    await prisma.teamInvitation.findFirst({
      where: {
        teamId,

        inviteeUserId:
          input.inviteeUserId,

        status:
          TeamInvitationStatus.PENDING,
      },
    });

  if (existingInvitation) {
    throw new TeamInvitationConflictError(
      "A pending invitation already exists for this user.",
    );
  }

  const expiresAt =
    new Date();

  expiresAt.setDate(
    expiresAt.getDate() +
      INVITATION_EXPIRY_DAYS,
  );

  const invitation =
    await prisma.teamInvitation.create({
      data: {
        teamId,

        invitedById:
          input.actorUserId,

        inviteeUserId:
          input.inviteeUserId,

        role:
          input.role,

        expiresAt,
      },

      include: {
        invitedBy: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },

        invitee: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

  return mapInvitation(
    invitation,
  );
};

export const getTeamInvitations = async ({
  teamId,
  actorUserId,
}: {
  teamId: string;
  actorUserId: string;
}): Promise<
  TeamInvitationResponse[]
> => {
  await requireTeamRole({
    teamId,
    userId: actorUserId,
    allowedRoles:
      invitationManagementRoles,
  });

  await expireOldInvitations(teamId);

  const invitations =
    await prisma.teamInvitation.findMany({
      where: {
        teamId,
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        invitedBy: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },

        invitee: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

  return invitations.map(
    mapInvitation,
  );
};

export const cancelTeamInvitation = async ({
  teamId,
  invitationId,
  actorUserId,
}: {
  teamId: string;
  invitationId: string;
  actorUserId: string;
}): Promise<void> => {
  await requireTeamRole({
    teamId,
    userId: actorUserId,
    allowedRoles:
      invitationManagementRoles,
  });

  const invitation =
    await prisma.teamInvitation.findFirst({
      where: {
        id: invitationId,
        teamId,
      },
    });

  if (!invitation) {
    throw new TeamInvitationNotFoundError();
  }

  if (
    invitation.status !==
    TeamInvitationStatus.PENDING
  ) {
    throw new TeamInvitationConflictError(
      "Only pending invitations can be cancelled.",
    );
  }

  await prisma.teamInvitation.update({
    where: {
      id: invitation.id,
    },

    data: {
      status:
        TeamInvitationStatus.CANCELLED,

      cancelledAt:
        new Date(),
    },
  });
};

export const acceptTeamInvitation = async ({
  invitationId,
  actorUserId,
}: {
  invitationId: string;
  actorUserId: string;
}) => {
  await expireOldInvitations();

  const invitation =
    await prisma.teamInvitation.findUnique({
      where: {
        id: invitationId,
      },
    });

  if (!invitation) {
    throw new TeamInvitationNotFoundError();
  }

  if (
    invitation.inviteeUserId !==
    actorUserId
  ) {
    throw new TeamAccessDeniedError(
      "Only the invited user can accept this invitation.",
    );
  }

  if (
    invitation.status ===
    TeamInvitationStatus.EXPIRED
  ) {
    throw new TeamInvitationConflictError(
      "This team invitation has expired.",
    );
  }

  if (
    invitation.status !==
    TeamInvitationStatus.PENDING
  ) {
    throw new TeamInvitationConflictError(
      "This team invitation is no longer pending.",
    );
  }

  const result =
    await prisma.$transaction(
      async (tx) => {
        const existingMembership =
          await tx.teamMember.findUnique({
            where: {
              teamId_userId: {
                teamId:
                  invitation.teamId,

                userId:
                  actorUserId,
              },
            },
          });

        if (existingMembership) {
          throw new TeamInvitationConflictError(
            "You are already a member of this team.",
          );
        }

        const membership =
          await tx.teamMember.create({
            data: {
              teamId:
                invitation.teamId,

              userId:
                actorUserId,

              role:
                invitation.role,
            },
          });

        await tx.teamInvitation.update({
          where: {
            id: invitation.id,
          },

          data: {
            status:
              TeamInvitationStatus.ACCEPTED,

            acceptedAt:
              new Date(),
          },
        });

        return membership;
      },
    );

  return result;
};

export const rejectTeamInvitation = async ({
  invitationId,
  actorUserId,
}: {
  invitationId: string;
  actorUserId: string;
}): Promise<void> => {
  await expireOldInvitations();

  const invitation =
    await prisma.teamInvitation.findUnique({
      where: {
        id: invitationId,
      },
    });

  if (!invitation) {
    throw new TeamInvitationNotFoundError();
  }

  if (
    invitation.inviteeUserId !==
    actorUserId
  ) {
    throw new TeamAccessDeniedError(
      "Only the invited user can reject this invitation.",
    );
  }

  if (
    invitation.status ===
    TeamInvitationStatus.EXPIRED
  ) {
    throw new TeamInvitationConflictError(
      "This team invitation has expired.",
    );
  }

  if (
    invitation.status !==
    TeamInvitationStatus.PENDING
  ) {
    throw new TeamInvitationConflictError(
      "This team invitation is no longer pending.",
    );
  }

  await prisma.teamInvitation.update({
    where: {
      id: invitation.id,
    },

    data: {
      status:
        TeamInvitationStatus.REJECTED,

      rejectedAt:
        new Date(),
    },
  });
};
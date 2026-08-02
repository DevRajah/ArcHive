import type { TeamMemberRole } from "@prisma/client";

import { prisma } from "@archive/database";

export class TeamNotFoundError extends Error {
  constructor(message = "Team not found.") {
    super(message);
    this.name = "TeamNotFoundError";
  }
}

export class TeamAccessDeniedError extends Error {
  constructor(
    message = "You do not have permission to perform this team action.",
  ) {
    super(message);
    this.name = "TeamAccessDeniedError";
  }
}

export class TeamValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TeamValidationError";
  }
}

/**
 * Returns a user's membership for one team.
 *
 * Every protected team operation uses this helper so role checks remain
 * consistent rather than being rewritten differently in each service.
 */
export const getTeamMembership = async ({
  teamId,
  userId,
}: {
  teamId: string;
  userId: string;
}) => {
  return prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });
};

export const requireTeamMembership = async ({
  teamId,
  userId,
}: {
  teamId: string;
  userId: string;
}) => {
  const membership = await getTeamMembership({
    teamId,
    userId,
  });

  if (!membership) {
    throw new TeamAccessDeniedError(
      "You are not a member of this team.",
    );
  }

  return membership;
};

export const requireTeamRole = async ({
  teamId,
  userId,
  allowedRoles,
}: {
  teamId: string;
  userId: string;
  allowedRoles: TeamMemberRole[];
}) => {
  const membership = await requireTeamMembership({
    teamId,
    userId,
  });

  if (!allowedRoles.includes(membership.role)) {
    throw new TeamAccessDeniedError();
  }

  return membership;
};
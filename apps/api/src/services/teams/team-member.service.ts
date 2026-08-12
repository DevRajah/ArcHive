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
}): Promise<TeamMemberResponse> => {
  /**
   * Only OWNER and ADMIN members can manage membership.
   *
   * Keep actor identity internal and canonical. The username change applies
   * only to the TARGET user being added, not the actor performing the action.
   */
  await requireTeamRole({
    teamId,
    userId: input.actorUserId,
    allowedRoles: managementRoles,
  });

  /**
   * request.body comes from HTTP and cannot be trusted simply because our
   * TypeScript type uses a mutually-exclusive union.
   *
   * Future me:
   * Explicitly enforce exactly one target identifier here.
   */
  const rawUsername =
    "username" in input &&
      typeof input.username === "string"
      ? input.username
      : undefined;

  const rawUserId =
    "userId" in input &&
      typeof input.userId === "string"
      ? input.userId
      : undefined;

  const hasUsername =
    Boolean(rawUsername?.trim());

  const hasUserId =
    Boolean(rawUserId?.trim());

  if (
    (hasUsername && hasUserId) ||
    (!hasUsername && !hasUserId)
  ) {
    throw new TeamValidationError(
      "Provide exactly one team member identifier: username or userId.",
    );
  }

  /**
   * HTTP input can still contain values that TypeScript excludes at compile time.
   *
   * Future me:
   * The AddTeamMemberInput type prevents OWNER in application code, but an
   * external client can still send "OWNER" in raw JSON. Validate the raw value
   * before trusting the typed role.
   */
  const requestedRole =
    (input as {
      role?: unknown;
    }).role;

  if (
    requestedRole ===
    TeamMemberRole.OWNER
  ) {
    throw new TeamAccessDeniedError(
      "The OWNER role cannot be assigned through this endpoint.",
    );
  }

  /**
   * Resolve the target ArcHive user.
   *
   * Preferred path:
   *
   *   "  @DevRajah  "
   *          ↓
   *      "DevRajah"
   *          ↓
   * case-insensitive database lookup
   *
   * Do not lowercase the stored/display username.
   */
  let user:
    | {
      id: string;
      username: string;
      email: string | null;
      avatarUrl: string | null;
    }
    | null = null;

  if (hasUsername) {
    const normalizedUsername =
      rawUsername!
        .trim()
        .replace(/^@/, "")
        .trim();

    if (!normalizedUsername) {
      throw new TeamValidationError(
        "A valid GitHub username is required.",
      );
    }

    user =
      await prisma.user.findFirst({
        where: {
          username: {
            equals:
              normalizedUsername,

            /**
             * PostgreSQL performs the comparison without requiring us to
             * destroy the user's canonical username casing.
             */
            mode: "insensitive",
          },
        },

        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
        },
      });
  } else {
    /**
     * Temporary compatibility path for existing internal consumers.
     */
    user =
      await prisma.user.findUnique({
        where: {
          id: rawUserId!.trim(),
        },

        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
        },
      });
  }

  if (!user) {
    throw new TeamValidationError(
      hasUsername
        ? "No existing ArcHive account matches that GitHub username."
        : "The selected ArcHive user does not exist.",
    );
  }

  /**
   * From this point onward, always use the RESOLVED canonical user ID.
   *
   * Do not continue using raw input.userId or the submitted username.
   */
  const targetUserId =
    user.id;

  /**
   * TeamMember already has @@unique([teamId, userId]), but checking first
   * lets us return a human-readable validation error rather than leaking a
   * database uniqueness exception.
   */
  const existing =
    await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId:
            targetUserId,
        },
      },
    });

  if (existing) {
    throw new TeamValidationError(
      "This user is already a team member.",
    );
  }

  /**
   * Create the membership and return display-ready user information so the
   * frontend can update immediately without another UUID-based lookup.
   */
  const member =
    await prisma.teamMember.create({
      data: {
        teamId,

        userId:
          targetUserId,

        role:
          input.role ??
          TeamMemberRole.MEMBER,
      },

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

  return {
    id: member.id,
    userId: member.userId,

    username:
      member.user.username,

    email:
      member.user.email,

    avatarUrl:
      member.user.avatarUrl,

    role: member.role,

    joinedAt:
      member.joinedAt,
  };
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
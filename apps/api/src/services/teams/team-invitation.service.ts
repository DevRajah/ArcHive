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

import {
    resolveInvitationTargetInput,
} from "./team-invitation-target.service";

const invitationManagementRoles = [
    TeamMemberRole.OWNER,
    TeamMemberRole.ADMIN,
];

const INVITATION_EXPIRY_DAYS = 7;



/**
 * Resolve the user being invited.
 *
 * GitHub username is the public/user-facing identifier.
 * inviteeUserId remains temporarily supported for older internal callers.
 *
 * Exactly one identifier must be supplied.
 */
const resolveExistingInvitee = async (
    input: CreateTeamInvitationInput,
) => {
    /**
     * Validate and normalize the user-facing identifier separately from
     * persistence concerns.
     */
    const target =
        resolveInvitationTargetInput(
            input,
        );

    if (target.type === "USERNAME") {
        const invitee =
            await prisma.user.findFirst({
                where: {
                    username: {
                        equals:
                            target.username,
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

        if (!invitee) {
            throw new TeamInvitationValidationError(
                "No existing ArcHive account matches that GitHub username.",
            );
        }

        return invitee;
    }

    /**
     * Legacy UUID compatibility.
     */
    const invitee =
        await prisma.user.findUnique({
            where: {
                id:
                    target.inviteeUserId,
            },

            select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
            },
        });

    if (!invitee) {
        throw new TeamInvitationValidationError(
            "The selected ArcHive user does not exist.",
        );
    }

    return invitee;
};

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

        team: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
        };

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
        id: invitation.id,
        teamId: invitation.teamId,

        role:
            invitation.role as Exclude<
                TeamMemberRole,
                "OWNER"
            >,

        status: invitation.status,

        team: invitation.team,

        invitedBy: invitation.invitedBy,

        invitee: invitation.invitee,

        createdAt: invitation.createdAt,
        updatedAt: invitation.updatedAt,
        expiresAt: invitation.expiresAt,

        acceptedAt: invitation.acceptedAt,
        rejectedAt: invitation.rejectedAt,
        cancelledAt: invitation.cancelledAt,
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
    /**
     * Only OWNER and ADMIN members can manage invitations.
     *
     * Keep this before doing any invitation work so an unauthorized actor
     * cannot use this endpoint to probe ArcHive usernames.
     */
    await requireTeamRole({
        teamId,
        userId: input.actorUserId,
        allowedRoles:
            invitationManagementRoles,
    });

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

    /**
     * Resolve the external/user-facing identifier once.
     *
     * Everything after this point should use invitee.id.
     * The rest of the invitation system does not need to care whether
     * the request originally contained a username or legacy UUID.
     */
    const invitee =
        await resolveExistingInvitee(input);

    /**
     * The TypeScript input contract already excludes OWNER.
     *
     * Runtime HTTP requests, however, are not protected by TypeScript,
     * so we still guard this explicitly.
     */
    if (
        (input.role as TeamMemberRole) ===
        TeamMemberRole.OWNER
    ) {
        throw new TeamInvitationValidationError(
            "OWNER cannot be assigned through a team invitation.",
        );
    }

    const existingMembership =
        await prisma.teamMember.findUnique({
            where: {
                teamId_userId: {
                    teamId,
                    userId: invitee.id,
                },
            },
        });

    if (existingMembership) {
        throw new TeamInvitationConflictError(
            "This user is already a team member.",
        );
    }

    /**
     * Expire stale pending invitations before checking whether the
     * resolved user already has an active invitation.
     */
    await expireOldInvitations(teamId);

    const existingInvitation =
        await prisma.teamInvitation.findFirst({
            where: {
                teamId,

                inviteeUserId:
                    invitee.id,

                status:
                    TeamInvitationStatus.PENDING,
            },
        });

    if (existingInvitation) {
        throw new TeamInvitationConflictError(
            "A pending invitation already exists for this user.",
        );
    }

    const expiresAt = new Date();

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

                /**
                 * Invitations continue storing the stable internal relationship.
                 * Username is only the lookup mechanism at the API boundary.
                 */
                inviteeUserId:
                    invitee.id,

                role:
                    input.role,

                expiresAt,
            },

            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                    },
                },

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
                team: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                    },
                },

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

export const getUserTeamInvitations = async ({
    userId,
}: {
    userId: string;
}): Promise<TeamInvitationResponse[]> => {
    if (!userId?.trim()) {
        throw new TeamInvitationValidationError(
            "A userId is required.",
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },

        select: {
            id: true,
        },
    });

    if (!user) {
        throw new TeamInvitationValidationError(
            "The selected ArcHive user does not exist.",
        );
    }

    /**
     * Expire stale pending invitations before returning the inbox.
     */
    await prisma.teamInvitation.updateMany({
        where: {
            inviteeUserId: userId,

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

    const invitations =
        await prisma.teamInvitation.findMany({
            where: {
                inviteeUserId: userId,
            },

            orderBy: {
                createdAt: "desc",
            },

            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                    },
                },

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

    return invitations.map((invitation) => ({
        id:
            invitation.id,

        teamId:
            invitation.teamId,

        role:
            invitation.role as Exclude<
                TeamMemberRole,
                "OWNER"
            >,

        status:
            invitation.status,

        invitedBy:
            invitation.invitedBy,

        invitee:
            invitation.invitee,

        createdAt:
            invitation.createdAt,

        updatedAt:
            invitation.updatedAt,

        expiresAt:
            invitation.expiresAt,

        acceptedAt:
            invitation.acceptedAt,

        rejectedAt:
            invitation.rejectedAt,

        cancelledAt:
            invitation.cancelledAt,

        /**
         * Extra team context for the invitation inbox.
         */
        team:
            invitation.team,
    })) as TeamInvitationResponse[];
};
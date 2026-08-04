import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  acceptTeamInvitation,
  cancelTeamInvitation,
  createTeamInvitation,
  getTeamInvitations,
  rejectTeamInvitation,
  getUserTeamInvitations,
} from "../services/teams/team-invitation.service";

import {
  TeamInvitationConflictError,
  TeamInvitationNotFoundError,
  TeamInvitationValidationError,
} from "../services/teams/team-invitation.errors";

import {
  TeamAccessDeniedError,
  TeamNotFoundError,
} from "../services/teams/team-permission.service";

const sendInvitationError = (
  error: unknown,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  if (
    error instanceof
      TeamInvitationValidationError
  ) {
    return reply.status(400).send({
      success: false,
      message: error.message,
    });
  }

  if (
    error instanceof
      TeamAccessDeniedError
  ) {
    return reply.status(403).send({
      success: false,
      message: error.message,
    });
  }

  if (
    error instanceof
      TeamInvitationNotFoundError ||
    error instanceof
      TeamNotFoundError
  ) {
    return reply.status(404).send({
      success: false,
      message: error.message,
    });
  }

  if (
    error instanceof
      TeamInvitationConflictError
  ) {
    return reply.status(409).send({
      success: false,
      message: error.message,
    });
  }

  request.log.error(
    error,
    "Team invitation request failed",
  );

  return reply.status(500).send({
    success: false,
    message:
      "The team invitation request could not be completed.",
  });
};

export const createTeamInvitationController =
  async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const { teamId } =
        request.params as {
          teamId: string;
        };

      const invitation =
        await createTeamInvitation({
          teamId,
          input:
            request.body as any,
        });

      return reply.status(201).send({
        success: true,
        message:
          "Team invitation created successfully.",
        data: invitation,
      });
    } catch (error) {
      return sendInvitationError(
        error,
        request,
        reply,
      );
    }
  };

export const listTeamInvitationsController =
  async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const { teamId } =
        request.params as {
          teamId: string;
        };

      const { userId } =
        request.query as {
          userId: string;
        };

      const invitations =
        await getTeamInvitations({
          teamId,
          actorUserId:
            userId,
        });

      return reply.send({
        success: true,
        count:
          invitations.length,
        data:
          invitations,
      });
    } catch (error) {
      return sendInvitationError(
        error,
        request,
        reply,
      );
    }
  };

export const cancelTeamInvitationController =
  async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const {
        teamId,
        invitationId,
      } = request.params as {
        teamId: string;
        invitationId: string;
      };

      const { actorUserId } =
        request.query as {
          actorUserId: string;
        };

      await cancelTeamInvitation({
        teamId,
        invitationId,
        actorUserId,
      });

      return reply.send({
        success: true,
        invitationId,
        message:
          "Team invitation cancelled successfully.",
      });
    } catch (error) {
      return sendInvitationError(
        error,
        request,
        reply,
      );
    }
  };

export const acceptTeamInvitationController =
  async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const { invitationId } =
        request.params as {
          invitationId: string;
        };

      const { actorUserId } =
        request.body as {
          actorUserId: string;
        };

      const membership =
        await acceptTeamInvitation({
          invitationId,
          actorUserId,
        });

      return reply.send({
        success: true,
        message:
          "Team invitation accepted successfully.",
        data: membership,
      });
    } catch (error) {
      return sendInvitationError(
        error,
        request,
        reply,
      );
    }
  };

export const rejectTeamInvitationController =
  async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const { invitationId } =
        request.params as {
          invitationId: string;
        };

      const { actorUserId } =
        request.body as {
          actorUserId: string;
        };

      await rejectTeamInvitation({
        invitationId,
        actorUserId,
      });

      return reply.send({
        success: true,
        invitationId,
        message:
          "Team invitation rejected successfully.",
      });
    } catch (error) {
      return sendInvitationError(
        error,
        request,
        reply,
      );
    }
  };

  export const listUserTeamInvitationsController =
  async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const { userId } =
        request.params as {
          userId: string;
        };

      const invitations =
        await getUserTeamInvitations({
          userId,
        });

      return reply.send({
        success: true,
        count:
          invitations.length,
        data:
          invitations,
      });
    } catch (error) {
      return sendInvitationError(
        error,
        request,
        reply,
      );
    }
  };
import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  TeamAccessDeniedError,
  TeamNotFoundError,
  TeamValidationError,
} from "../services/teams/team-permission.service";

import {
  createTeam,
  deleteTeam,
  getTeamDetails,
  getUserTeams,
  updateTeam,
} from "../services/teams/team.service";

import {
  addTeamMember,
  getTeamMembers,
  removeTeamMember,
  updateTeamMemberRole,
} from "../services/teams/team-member.service";

import {
  addTeamRepository,
  getTeamRepositories,
  removeTeamRepository,
} from "../services/teams/team-repository.service";

const sendTeamError = (
  error: unknown,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  if (error instanceof TeamValidationError) {
    return reply.status(400).send({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof TeamAccessDeniedError) {
    return reply.status(403).send({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof TeamNotFoundError) {
    return reply.status(404).send({
      success: false,
      message: error.message,
    });
  }

  request.log.error(
    error,
    "Team request failed",
  );

  return reply.status(500).send({
    success: false,
    message:
      "The team request could not be completed.",
  });
};

export const createTeamController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const team = await createTeam(
      request.body as {
        userId: string;
        name: string;
        description?: string;
      },
    );

    return reply.status(201).send({
      success: true,
      message: "Team created successfully.",
      data: team,
    });
  } catch (error) {
    return sendTeamError(
      error,
      request,
      reply,
    );
  }
};

export const listUserTeamsController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { userId } = request.params as {
      userId: string;
    };

    const teams = await getUserTeams(userId);

    return reply.send({
      success: true,
      count: teams.length,
      data: teams,
    });
  } catch (error) {
    return sendTeamError(
      error,
      request,
      reply,
    );
  }
};

export const getTeamController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { teamId } = request.params as {
      teamId: string;
    };

    const { userId } = request.query as {
      userId: string;
    };

    const team = await getTeamDetails({
      teamId,
      userId,
    });

    return reply.send({
      success: true,
      data: team,
    });
  } catch (error) {
    return sendTeamError(
      error,
      request,
      reply,
    );
  }
};

export const updateTeamController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { teamId } = request.params as {
      teamId: string;
    };

    const team = await updateTeam({
      teamId,
      input: request.body as {
        actorUserId: string;
        name?: string;
        description?: string | null;
      },
    });

    return reply.send({
      success: true,
      message: "Team updated successfully.",
      data: team,
    });
  } catch (error) {
    return sendTeamError(
      error,
      request,
      reply,
    );
  }
};

export const deleteTeamController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { teamId } = request.params as {
      teamId: string;
    };

    const { actorUserId } =
      request.query as {
        actorUserId: string;
      };

    await deleteTeam({
      teamId,
      actorUserId,
    });

    return reply.send({
      success: true,
      message: "Team deleted successfully.",
    });
  } catch (error) {
    return sendTeamError(
      error,
      request,
      reply,
    );
  }
};

export const listTeamMembersController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { teamId } = request.params as {
      teamId: string;
    };

    const { userId } = request.query as {
      userId: string;
    };

    const members = await getTeamMembers({
      teamId,
      actorUserId: userId,
    });

    return reply.send({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    return sendTeamError(
      error,
      request,
      reply,
    );
  }
};

export const addTeamMemberController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { teamId } = request.params as {
      teamId: string;
    };

    const member = await addTeamMember({
      teamId,
      input: request.body as any,
    });

    return reply.status(201).send({
      success: true,
      message:
        "Team member added successfully.",
      data: member,
    });
  } catch (error) {
    return sendTeamError(
      error,
      request,
      reply,
    );
  }
};

export const updateTeamMemberController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const {
      teamId,
      memberId,
    } = request.params as {
      teamId: string;
      memberId: string;
    };

    const member =
      await updateTeamMemberRole({
        teamId,
        memberId,
        input: request.body as any,
      });

    return reply.send({
      success: true,
      message:
        "Team member role updated successfully.",
      data: member,
    });
  } catch (error) {
    return sendTeamError(
      error,
      request,
      reply,
    );
  }
};

export const removeTeamMemberController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const {
      teamId,
      memberId,
    } = request.params as {
      teamId: string;
      memberId: string;
    };

    const { actorUserId } =
      request.query as {
        actorUserId: string;
      };

    await removeTeamMember({
      teamId,
      memberId,
      actorUserId,
    });

    return reply.send({
      success: true,
      message:
        "Team member removed successfully.",
    });
  } catch (error) {
    return sendTeamError(
      error,
      request,
      reply,
    );
  }
};

export const listTeamRepositoriesController =
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

      const repositories =
        await getTeamRepositories({
          teamId,
          actorUserId: userId,
        });

      return reply.send({
        success: true,
        count: repositories.length,
        data: repositories,
      });
    } catch (error) {
      return sendTeamError(
        error,
        request,
        reply,
      );
    }
  };

export const addTeamRepositoryController =
  async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const { teamId } =
        request.params as {
          teamId: string;
        };

      const repository =
        await addTeamRepository({
          teamId,
          input: request.body as any,
        });

      return reply.status(201).send({
        success: true,
        message:
          "Repository added to the team successfully.",
        data: repository,
      });
    } catch (error) {
      return sendTeamError(
        error,
        request,
        reply,
      );
    }
  };

export const removeTeamRepositoryController =
  async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const {
        teamId,
        repositoryId,
      } = request.params as {
        teamId: string;
        repositoryId: string;
      };

      const { actorUserId } =
        request.query as {
          actorUserId: string;
        };

      await removeTeamRepository({
        teamId,
        repositoryId,
        actorUserId,
      });

      return reply.send({
        success: true,
        message:
          "Repository removed from the team successfully.",
      });
    } catch (error) {
      return sendTeamError(
        error,
        request,
        reply,
      );
    }
  };
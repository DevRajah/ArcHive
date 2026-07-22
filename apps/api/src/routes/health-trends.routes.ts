import { FastifyInstance } from "fastify";

import { healthTrendsService } from "../services/health-trends.service";
import { architectureAdvisorService } from "../services/architecture-advisor.service";
import { getAuthenticatedUser } from "../utils/authenticated-user";
import { isPlatformAdmin } from "../utils/admin";

type RepositoryParams = {
  repositoryId: string;
};

const sendAuthenticationError = ({
  reply,
  reason,
}: {
  reply: {
    status: (code: number) => {
      send: (payload: object) => unknown;
    };
  };

  reason: "MISSING_TOKEN" | "INVALID_TOKEN";
}) => {
  return reply.status(401).send({
    success: false,

    message:
      reason === "MISSING_TOKEN"
        ? "Authentication required."
        : "Invalid or expired authentication token.",
  });
};

const verifyRepositoryAccess = async ({
  repositoryId,
  authenticatedUserId,
  authenticatedUsername,
}: {
  repositoryId: string;

  authenticatedUserId: string;

  authenticatedUsername: string;
}) => {
  if (isPlatformAdmin(authenticatedUsername)) {
    return {
      exists: true,
      hasAccess: true,
    };
  }

  const ownerUserId =
    await architectureAdvisorService.getRepositoryOwnerId(
      repositoryId
    );

  if (!ownerUserId) {
    return {
      exists: false,
      hasAccess: false,
    };
  }

  return {
    exists: true,

    hasAccess:
      ownerUserId === authenticatedUserId,
  };
};

export const healthTrendsRoutes =
  async (app: FastifyInstance) => {
    app.get<{ Params: RepositoryParams }>(
  "/:repositoryId/health-trends",

  async (request, reply) => {
    const authentication =
      getAuthenticatedUser(request);

    if (!authentication.authenticated) {
      return sendAuthenticationError({
        reply,
        reason: authentication.reason,
      });
    }

    const access =
      await verifyRepositoryAccess({
        repositoryId:
          request.params.repositoryId,

        authenticatedUserId:
          authentication.user.userId,

        authenticatedUsername:
          authentication.user.username,
      });

    if (!access.exists) {
      return reply.status(404).send({
        success: false,
        message: "Repository not found.",
      });
    }

    if (!access.hasAccess) {
      return reply.status(403).send({
        success: false,
        message:
          "You do not have permission to access repository health trends.",
      });
    }

    const response =
      await healthTrendsService.getRepositoryHealth(
        request.params.repositoryId
      );

    return reply.send({
      success: true,

      message:
        "Repository health trends fetched successfully.",

      data: response,
    });
  }
);

app.get<{ Params: RepositoryParams }>(
  "/:repositoryId/health-trends/summary",

  async (request, reply) => {
    const summary =
      await healthTrendsService.getHealthSummary(
        request.params.repositoryId
      );

    return reply.send({
      success: true,

      message:
        "Repository health summary fetched successfully.",

      data: summary,
    });
  }
);

app.get<{ Params: RepositoryParams }>(
  "/:repositoryId/health-trends/history",

  async (request, reply) => {
    const history =
      await healthTrendsService.getHistory(
        request.params.repositoryId
      );

    return reply.send({
      success: true,

      message:
        "Repository health history fetched successfully.",

      data: history,
    });
  }
);

app.get<{ Params: RepositoryParams }>(
  "/:repositoryId/health-trends/changes",

  async (request, reply) => {
    const changes =
      await healthTrendsService.getChanges(
        request.params.repositoryId
      );

    return reply.send({
      success: true,

      message:
        "Repository health changes fetched successfully.",

      data: changes,
    });
  }
);

app.post<{ Params: RepositoryParams }>(
  "/:repositoryId/health-trends/refresh",

  async (request, reply) => {
    const refreshed =
      await healthTrendsService.refresh(
        request.params.repositoryId
      );

    return reply.send({
      success: true,

      message:
        "Repository health trends refreshed successfully.",

      data: refreshed,
    });
  }
);
};
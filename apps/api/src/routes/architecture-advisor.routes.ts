import { FastifyInstance } from "fastify";

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

export const architectureAdvisorRoutes =
  async (app: FastifyInstance) => {
    /*
     * GET returns the most recent advisor snapshot. When no assessment exists,
     * the service creates the repository's first evidence-based baseline.
     */
    app.get<{ Params: RepositoryParams }>(
      "/:repositoryId/advisor",
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
              "You do not have permission to access this repository advisor.",
          });
        }

        const assessment =
          await architectureAdvisorService.getLatestAssessment(
            request.params.repositoryId
          );

        if (!assessment) {
          return reply.status(404).send({
            success: false,
            message: "Repository not found.",
          });
        }

        return reply.send({
          success: true,
          message:
            "Architecture advisor assessment fetched successfully.",
          data: assessment,
        });
      }
    );

    /*
     * POST performs a fresh evaluation and stores a new immutable snapshot.
     * Older snapshots remain available for advisor-history comparisons.
     */
    app.post<{ Params: RepositoryParams }>(
      "/:repositoryId/advisor/refresh",
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
              "You do not have permission to refresh this repository advisor.",
          });
        }

        const assessment =
          await architectureAdvisorService.refreshAssessment(
            request.params.repositoryId
          );

        if (!assessment) {
          return reply.status(404).send({
            success: false,
            message: "Repository not found.",
          });
        }

        return reply.status(201).send({
          success: true,
          message:
            "Architecture advisor assessment refreshed successfully.",
          data: assessment,
        });
      }
    );

    /*
     * History provides the foundation for future architecture risk trends and
     * before-versus-after advisor comparisons.
     */
    app.get<{ Params: RepositoryParams }>(
      "/:repositoryId/advisor/history",
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
              "You do not have permission to access this advisor history.",
          });
        }

        const history =
          await architectureAdvisorService.getAssessmentHistory(
            request.params.repositoryId
          );

        if (!history) {
          return reply.status(404).send({
            success: false,
            message: "Repository not found.",
          });
        }

        return reply.send({
          success: true,
          message:
            "Architecture advisor history fetched successfully.",
          data: {
            repositoryId:
              request.params.repositoryId,

            totalAssessments: history.length,

            assessments: history,
          },
        });
      }
    );
  };
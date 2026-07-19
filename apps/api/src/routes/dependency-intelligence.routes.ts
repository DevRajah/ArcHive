import { FastifyInstance } from "fastify";

import { dependencyIntelligenceService } from "../services/dependency-intelligence.service";
import { getAuthenticatedUser } from "../utils/authenticated-user";
import { isPlatformAdmin } from "../utils/admin";

type UserParams = {
  userId: string;
};

type TechnologyParams = {
  userId: string;
  technology: string;
};

const verifyPortfolioAccess = ({
  requestUserId,
  authenticatedUserId,
  authenticatedUsername,
}: {
  requestUserId: string;
  authenticatedUserId: string;
  authenticatedUsername: string;
}) => {
  return (
    requestUserId === authenticatedUserId ||
    isPlatformAdmin(authenticatedUsername)
  );
};

const authenticateRequest = (
  request: Parameters<
    typeof getAuthenticatedUser
  >[0]
) => {
  return getAuthenticatedUser(request);
};

export const dependencyIntelligenceRoutes =
  async (app: FastifyInstance) => {
    app.get<{ Params: UserParams }>(
      "/:userId/dependencies",
      async (request, reply) => {
        const authentication =
          authenticateRequest(request);

        if (!authentication.authenticated) {
          return reply.status(401).send({
            success: false,
            message:
              authentication.reason ===
              "MISSING_TOKEN"
                ? "Authentication required."
                : "Invalid or expired authentication token.",
          });
        }

        const hasAccess =
          verifyPortfolioAccess({
            requestUserId:
              request.params.userId,

            authenticatedUserId:
              authentication.user.userId,

            authenticatedUsername:
              authentication.user.username,
          });

        if (!hasAccess) {
          return reply.status(403).send({
            success: false,
            message:
              "You do not have permission to access this dependency portfolio.",
          });
        }

        const overview =
          await dependencyIntelligenceService.getDependencyOverview(
            request.params.userId
          );

        if (!overview) {
          return reply.status(404).send({
            success: false,
            message: "User not found.",
          });
        }

        return reply.send({
          success: true,
          message:
            "Engineering dependency intelligence fetched successfully.",
          data: overview,
        });
      }
    );

    app.get<{ Params: TechnologyParams }>(
      "/:userId/dependencies/:technology",
      async (request, reply) => {
        const authentication =
          authenticateRequest(request);

        if (!authentication.authenticated) {
          return reply.status(401).send({
            success: false,
            message:
              authentication.reason ===
              "MISSING_TOKEN"
                ? "Authentication required."
                : "Invalid or expired authentication token.",
          });
        }

        const hasAccess =
          verifyPortfolioAccess({
            requestUserId:
              request.params.userId,

            authenticatedUserId:
              authentication.user.userId,

            authenticatedUsername:
              authentication.user.username,
          });

        if (!hasAccess) {
          return reply.status(403).send({
            success: false,
            message:
              "You do not have permission to access this technology dependency.",
          });
        }

        const technology =
          decodeURIComponent(
            request.params.technology
          ).trim();

        if (!technology) {
          return reply.status(400).send({
            success: false,
            message: "Technology is required.",
          });
        }

        const detail =
          await dependencyIntelligenceService.getTechnologyDependencyDetail(
            {
              userId: request.params.userId,
              technology,
            }
          );

        if (!detail) {
          return reply.status(404).send({
            success: false,
            message:
              "Technology was not found in this dependency portfolio.",
          });
        }

        return reply.send({
          success: true,
          message:
            "Technology dependency intelligence fetched successfully.",
          data: detail,
        });
      }
    );

    app.get<{ Params: TechnologyParams }>(
      "/:userId/impact/:technology",
      async (request, reply) => {
        const authentication =
          authenticateRequest(request);

        if (!authentication.authenticated) {
          return reply.status(401).send({
            success: false,
            message:
              authentication.reason ===
              "MISSING_TOKEN"
                ? "Authentication required."
                : "Invalid or expired authentication token.",
          });
        }

        const hasAccess =
          verifyPortfolioAccess({
            requestUserId:
              request.params.userId,

            authenticatedUserId:
              authentication.user.userId,

            authenticatedUsername:
              authentication.user.username,
          });

        if (!hasAccess) {
          return reply.status(403).send({
            success: false,
            message:
              "You do not have permission to access this technology impact report.",
          });
        }

        const technology =
          decodeURIComponent(
            request.params.technology
          ).trim();

        if (!technology) {
          return reply.status(400).send({
            success: false,
            message: "Technology is required.",
          });
        }

        const impactReport =
          await dependencyIntelligenceService.getTechnologyImpact(
            {
              userId: request.params.userId,
              technology,
            }
          );

        if (!impactReport) {
          return reply.status(404).send({
            success: false,
            message:
              "Technology was not found in this engineering portfolio.",
          });
        }

        return reply.send({
          success: true,
          message:
            "Technology impact report fetched successfully.",
          data: impactReport,
        });
      }
    );
  };
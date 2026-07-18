import { FastifyInstance } from "fastify";

import { technologyIntelligenceService } from "../services/technology-intelligence.service";
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

export const technologyIntelligenceRoutes = async (
  app: FastifyInstance
) => {
  app.get<{ Params: UserParams }>(
    "/:userId/technologies",
    async (request, reply) => {
      const authentication = getAuthenticatedUser(request);

      if (!authentication.authenticated) {
        return reply.status(401).send({
          success: false,
          message:
            authentication.reason === "MISSING_TOKEN"
              ? "Authentication required."
              : "Invalid or expired authentication token.",
        });
      }

      const hasAccess = verifyPortfolioAccess({
        requestUserId: request.params.userId,
        authenticatedUserId:
          authentication.user.userId,
        authenticatedUsername:
          authentication.user.username,
      });

      if (!hasAccess) {
        return reply.status(403).send({
          success: false,
          message:
            "You do not have permission to access this technology portfolio.",
        });
      }

      const technologyOverview =
        await technologyIntelligenceService.getTechnologyOverview(
          request.params.userId
        );

      if (!technologyOverview) {
        return reply.status(404).send({
          success: false,
          message: "User not found.",
        });
      }

      return reply.send({
        success: true,
        message:
          "Portfolio technology intelligence fetched successfully.",
        data: technologyOverview,
      });
    }
  );

  app.get<{ Params: TechnologyParams }>(
    "/:userId/technologies/:technology",
    async (request, reply) => {
      const authentication = getAuthenticatedUser(request);

      if (!authentication.authenticated) {
        return reply.status(401).send({
          success: false,
          message:
            authentication.reason === "MISSING_TOKEN"
              ? "Authentication required."
              : "Invalid or expired authentication token.",
        });
      }

      const hasAccess = verifyPortfolioAccess({
        requestUserId: request.params.userId,
        authenticatedUserId:
          authentication.user.userId,
        authenticatedUsername:
          authentication.user.username,
      });

      if (!hasAccess) {
        return reply.status(403).send({
          success: false,
          message:
            "You do not have permission to access this technology portfolio.",
        });
      }

      const decodedTechnology = decodeURIComponent(
        request.params.technology
      ).trim();

      if (!decodedTechnology) {
        return reply.status(400).send({
          success: false,
          message: "Technology is required.",
        });
      }

      const technologyDetail =
        await technologyIntelligenceService.getTechnologyDetail({
          userId: request.params.userId,
          technology: decodedTechnology,
        });

      if (!technologyDetail) {
        return reply.status(404).send({
          success: false,
          message:
            "Technology was not found in this engineering portfolio.",
        });
      }

      return reply.send({
        success: true,
        message:
          "Technology intelligence fetched successfully.",
        data: technologyDetail,
      });
    }
  );
};
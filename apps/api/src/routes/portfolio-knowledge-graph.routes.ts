import { FastifyInstance } from "fastify";

import { knowledgeGraphService } from "../services/knowledge-graph.service";
import { getAuthenticatedUser } from "../utils/authenticated-user";
import { isPlatformAdmin } from "../utils/admin";

type PortfolioKnowledgeGraphParams = {
  userId: string;
};

export const portfolioKnowledgeGraphRoutes = async (
  app: FastifyInstance
) => {
  app.get<{ Params: PortfolioKnowledgeGraphParams }>(
    "/:userId/knowledge-graph",
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

      const { userId } = request.params;

      const isOwner =
        authentication.user.userId === userId;

      const hasAdminAccess = isPlatformAdmin(
        authentication.user.username
      );

      if (!isOwner && !hasAdminAccess) {
        return reply.status(403).send({
          success: false,
          message:
            "You do not have permission to access this engineering portfolio.",
        });
      }

      const knowledgeGraph =
        await knowledgeGraphService.getPortfolioGraph(userId);

      if (!knowledgeGraph) {
        return reply.status(404).send({
          success: false,
          message: "User not found.",
        });
      }

      return reply.send({
        success: true,
        message:
          "Portfolio engineering knowledge graph fetched successfully.",
        data: knowledgeGraph,
      });
    }
  );
};
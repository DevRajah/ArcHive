import { FastifyInstance } from "fastify";
import { portfolioService } from "../services/portfolio.service";

type PortfolioParams = {
  userId: string;
};

export const portfolioRoutes = async (app: FastifyInstance) => {
  app.get<{ Params: PortfolioParams }>(
    "/:userId/portfolio",
    async (request, reply) => {
      const { userId } = request.params;

      const portfolio =
        await portfolioService.getUserPortfolio(userId);

      if (!portfolio) {
        return reply.status(404).send({
          success: false,
          message: "User not found.",
        });
      }

      return reply.send({
        success: true,
        message:
          "Engineering portfolio fetched successfully.",
        data: portfolio,
      });
    }
  );
};
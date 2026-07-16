import { FastifyInstance } from "fastify";
import {
  portfolioTimelineService,
} from "../services/portfolio-timeline.service";
import {
  portfolioTrendsService,
} from "../services/portfolio-trends.service";

type PortfolioParams = {
  userId: string;
};

type PortfolioTimelineQuery = {
  page?: string;
  limit?: string;
  repositoryId?: string;
  activityType?:
    | "TIMELINE"
    | "ENGINEERING_EVENT"
    | "ARCHITECTURE_CHANGE"
    | "RECOMMENDATION";
};

type PortfolioTrendsQuery = {
  period?: "7d" | "30d" | "90d" | "1y";
};

export const portfolioIntelligenceRoutes = async (
  app: FastifyInstance
) => {
  app.get<{
    Params: PortfolioParams;
    Querystring: PortfolioTimelineQuery;
  }>(
    "/:userId/portfolio/timeline",
    async (request, reply) => {
      const result =
        await portfolioTimelineService.getTimeline({
          userId: request.params.userId,
          page: request.query.page
            ? Number(request.query.page)
            : undefined,
          limit: request.query.limit
            ? Number(request.query.limit)
            : undefined,
          repositoryId: request.query.repositoryId,
          activityType: request.query.activityType,
        });

      if (!result) {
        return reply.status(404).send({
          success: false,
          message: "User not found.",
        });
      }

      return reply.send({
        success: true,
        message:
          "Portfolio engineering timeline fetched successfully.",
        data: result,
      });
    }
  );

  app.get<{
    Params: PortfolioParams;
    Querystring: PortfolioTrendsQuery;
  }>(
    "/:userId/portfolio/trends",
    async (request, reply) => {
      const result =
        await portfolioTrendsService.getTrends({
          userId: request.params.userId,
          period: request.query.period || "30d",
        });

      if (!result) {
        return reply.status(404).send({
          success: false,
          message: "User not found.",
        });
      }

      return reply.send({
        success: true,
        message:
          "Portfolio engineering trends fetched successfully.",
        data: result,
      });
    }
  );
};
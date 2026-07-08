import { FastifyPluginAsync } from "fastify";
import { adminAnalyticsService } from "../../services/admin/analytics.service";
import { successResponse } from "../../utils/http-response";

const analyticsRoute: FastifyPluginAsync = async (app) => {
  app.get("/analytics", async (_request, reply) => {
    const analytics = await adminAnalyticsService.getAnalytics();

    return successResponse(
      reply,
      "Admin analytics fetched successfully.",
      analytics
    );
  });
};

export default analyticsRoute;
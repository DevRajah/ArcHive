import { FastifyPluginAsync } from "fastify";
import { adminDashboardService } from "../../services/admin/dashboard.service";
import { successResponse } from "../../utils/http-response";

const dashboardRoute: FastifyPluginAsync = async (app) => {
  app.get("/dashboard", async (_request, reply) => {
    const dashboard = await adminDashboardService.getDashboard();

    return successResponse(
      reply,
      "Admin dashboard loaded successfully.",
      dashboard
    );
  });
};

export default dashboardRoute;
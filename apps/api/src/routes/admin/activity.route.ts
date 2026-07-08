import { FastifyPluginAsync } from "fastify";
import { adminActivityService } from "../../services/admin/activity.service";
import { successResponse } from "../../utils/http-response";

type ActivityQuery = {
  limit?: string;
};

const activityRoute: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: ActivityQuery }>("/activity", async (request, reply) => {
    const activity = await adminActivityService.getActivity(
      request.query.limit ? Number(request.query.limit) : undefined
    );

    return successResponse(reply, "Admin activity fetched successfully.", {
      activity,
    });
  });
};

export default activityRoute;
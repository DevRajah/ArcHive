import { FastifyPluginAsync } from "fastify";
import { adminQueueService } from "../../services/admin/queue.service";
import { successResponse } from "../../utils/http-response";

const queueRoute: FastifyPluginAsync = async (app) => {
  app.get("/queue", async (_request, reply) => {
    const queue = await adminQueueService.getQueueOverview();

    return successResponse(reply, "Admin queue overview fetched successfully.", {
      queue,
    });
  });
};

export default queueRoute;
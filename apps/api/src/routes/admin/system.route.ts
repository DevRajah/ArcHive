import { FastifyPluginAsync } from "fastify";
import { adminSystemService } from "../../services/admin/system.service";
import { successResponse } from "../../utils/http-response";

const systemRoute: FastifyPluginAsync = async (app) => {
  app.get("/system", async (_request, reply) => {
    const system = await adminSystemService.getSystemOverview();

    return successResponse(reply, "Admin system overview fetched successfully.", {
      system,
    });
  });
};

export default systemRoute;
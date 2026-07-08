import { FastifyPluginAsync } from "fastify";
import { adminOnly } from "../../middleware/admin.middleware";

const adminRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", adminOnly);

  app.get("/dashboard", async () => {
    return {
      success: true,
      message: "Welcome, Platform Administrator.",
      data: {
        status: "ONLINE",
      },
    };
  });
};

export default adminRoutes;
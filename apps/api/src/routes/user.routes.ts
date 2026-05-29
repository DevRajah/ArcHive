import { FastifyInstance } from "fastify";
import { getUserDashboardController } from "../controllers/user-dashboard.controller";

export const userRoutes = async (app: FastifyInstance) => {
  app.get("/:userId/dashboard", getUserDashboardController);
};
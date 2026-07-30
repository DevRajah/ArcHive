import { FastifyInstance } from "fastify";

import { generateReport } from "../controllers/report.controller";

/**
 * Executive Reports
 */
export async function reportRoutes(
  app: FastifyInstance,
) {
  /**
   * Queue a new Executive Report.
   */
  app.post(
    "/generate",
    generateReport,
  );
}
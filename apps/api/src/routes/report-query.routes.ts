import type { FastifyInstance } from "fastify";

import {
  deleteReportController,
  getReportController,
  getReportStatusController,
  listUserReportsController,
} from "../controllers/report-query.controller";

import {
  downloadReportController,
} from "../controllers/report-download.controller";

/**
 * Routes for browsing and managing generated Executive Reports.
 *
 * All report-specific routes include userId so every database query can
 * enforce report ownership.
 */
export const reportQueryRoutes = async (
  app: FastifyInstance,
): Promise<void> => {
  /**
   * Returns lightweight report history.
   */
  app.get(
    "/users/:userId/reports",
    listUserReportsController,
  );

  /**
   * Returns the full stored report snapshot.
   *
   * This route must be registered before "/:reportId" only if another
   * route uses a conflicting dynamic segment. Here the paths are safe.
   */
  app.get(
    "/users/:userId/reports/:reportId/status",
    getReportStatusController,
  );

    /**
   * Downloads a generated Executive Report file.
   */
  app.get(
    "/users/:userId/reports/:reportId/download/:fileType",
    downloadReportController,
  );

  /**
   * Returns one complete Executive Report.
   */
  app.get(
    "/users/:userId/reports/:reportId",
    getReportController,
  );

  /**
   * Removes one Executive Report.
   */
  app.delete(
    "/users/:userId/reports/:reportId",
    deleteReportController,
  );


};
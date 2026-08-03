import type {
  FastifyInstance,
} from "fastify";

import {
  deleteTeamReportController,
  downloadTeamReportController,
  generateTeamReportController,
  getTeamReportController,
  listTeamReportsController,
} from "../controllers/team-report.controller";

export const teamReportRoutes =
  async (
    app: FastifyInstance,
  ) => {
    app.post(
      "/teams/:teamId/reports/generate",
      generateTeamReportController,
    );

    app.get(
      "/teams/:teamId/reports",
      listTeamReportsController,
    );

    /**
     * Download routes are registered before the generic report details route.
     */
    app.get(
      "/teams/:teamId/reports/:reportId/download/:fileType",
      downloadTeamReportController,
    );

    app.get(
      "/teams/:teamId/reports/:reportId",
      getTeamReportController,
    );

    app.delete(
      "/teams/:teamId/reports/:reportId",
      deleteTeamReportController,
    );
  };
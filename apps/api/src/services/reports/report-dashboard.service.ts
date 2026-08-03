import {
  getOrganizationDashboard,
} from "../organization/dashboard.service";

import {
  getTeamDashboard,
} from "../teams/team-dashboard.service";

import {
  ReportSource,
  ReportSourceType,
} from "../../types/report-source.types";

/**
 * Future me:
 * Reports should never know whether they were generated
 * for a User or a Team.
 *
 * This resolver is the single place responsible for
 * obtaining the dashboard used during report generation.
 */
export const getDashboardForReport = async (
  source: ReportSource,
) => {
  switch (source.type) {
    case ReportSourceType.USER:
      if (!source.userId) {
        throw new Error(
          "User report requires userId.",
        );
      }

      return getOrganizationDashboard({
        userId: source.userId,
      });

    case ReportSourceType.TEAM:
      if (!source.teamId) {
        throw new Error(
          "Team report requires teamId.",
        );
      }

      return getTeamDashboard({
        teamId: source.teamId,
      });

    default:
      throw new Error(
        "Unsupported report source.",
      );
  }
};
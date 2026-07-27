import {
  OrganizationDashboard,
  OrganizationQueryOptions,
} from "../../types/organization.types";

import { getOrganizationOverview } from "./overview.service";
import { getRepositoryRankings } from "./rankings.service";
import { getTechnologyInventory } from "./technology.service";
import { getOrganizationRecommendations } from "./recommendations.service";
import { getOrganizationRisks } from "./risks.service";
import { getOrganizationActivityFeed } from "./activity.service";
import { getOrganizationTrends } from "./trends.service";

/**
 * Builds the complete Organization Dashboard.
 *
 * Rather than performing every calculation itself,
 * this service simply asks each specialised service
 * for its own data.
 *
 * Using Promise.all() allows all independent queries
 * to run at the same time, making the dashboard load
 * much faster than executing them one after another.
 */
export const getOrganizationDashboard = async (
  options: OrganizationQueryOptions,
): Promise<OrganizationDashboard> => {
  const [
    overview,
    rankings,
    technology,
    recommendations,
    risks,
    activity,
    trends,
  ] = await Promise.all([
    getOrganizationOverview(options),
    getRepositoryRankings(options),
    getTechnologyInventory(options),
    getOrganizationRecommendations(options),
    getOrganizationRisks(options),
    getOrganizationActivityFeed(options),
    getOrganizationTrends(options),
  ]);

  return {
    overview,
    rankings,
    technology,
    recommendations,
    risks,
    activity,
    trends,
  };
};
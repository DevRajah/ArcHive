// import {
//   getOrganizationOverview,
// } from "../organization/overview.service";

// import {
//   getRepositoryRankings,
// } from "../organization/rankings.service";

// import {
//   getTechnologyInventory,
// } from "../organization/technology.service";

// import {
//   getOrganizationRecommendations,
// } from "../organization/recommendations.service";

// import {
//   getOrganizationRisks,
// } from "../organization/risks.service";

// import {
//   getOrganizationActivityFeed,
// } from "../organization/activity.service";

// import {
//   getOrganizationTrends,
// } from "../organization/trends.service";

// import {
//   RepositoryScopeType,
// } from "../../types/repository-scope.types";

// /**
//  * Team dashboard.
//  *
//  * This reuses the existing Organization Intelligence engine.
//  * The only difference is that repositories come from a Team
//  * instead of directly from a User.
//  */
// export const getTeamOrganizationDashboard =
// async ({
//   teamId,
// }: {
//   teamId: string;
// }) => {
//   const scope = {
//     type: RepositoryScopeType.TEAM,
//     teamId,
//   };

//   const [
//     overview,
//     rankings,
//     technology,
//     recommendations,
//     risks,
//     activity,
//     trends,
//   ] = await Promise.all([
//     getOrganizationOverview(scope),
//     getRepositoryRankings(scope),
//     getTechnologyInventory(scope),
//     getOrganizationRecommendations(scope),
//     getOrganizationRisks(scope),
//     getOrganizationActivityFeed(scope),
//     getOrganizationTrends(scope),
//   ]);

//   return {
//     overview,
//     rankings,
//     technology,
//     recommendations,
//     risks,
//     activity,
//     trends,
//   };
// };
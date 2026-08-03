// import { FastifyInstance } from "fastify";

// import {
//   getTeamOrganizationDashboard,
// } from "../services/team-organization/team-organization-dashboard.service";

// export const teamOrganizationRoutes =
// async (
//   app: FastifyInstance,
// ) => {
//   app.get(
//     "/teams/:teamId/organization/dashboard",
//     async (request) => {
//       const { teamId } =
//         request.params as {
//           teamId: string;
//         };

//       return getTeamOrganizationDashboard({
//         teamId,
//       });
//     },
//   );
// };
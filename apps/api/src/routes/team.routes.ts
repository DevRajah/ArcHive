import type { FastifyInstance } from "fastify";

import {
    addTeamMemberController,
    addTeamRepositoryController,
    createTeamController,
    deleteTeamController,
    getTeamController,
    listTeamMembersController,
    listTeamRepositoriesController,
    listUserTeamsController,
    removeTeamMemberController,
    removeTeamRepositoryController,
    updateTeamController,
    updateTeamMemberController,
} from "../controllers/team.controller";

import {
    getTeamDashboard,
} from "../services/teams/team-dashboard.service";

export const teamRoutes = async (
    app: FastifyInstance,
) => {
    app.post(
        "/teams",
        createTeamController,
    );

    app.get(
        "/users/:userId/teams",
        listUserTeamsController,
    );

    app.get(
        "/teams/:teamId",
        getTeamController,
    );

    app.patch(
        "/teams/:teamId",
        updateTeamController,
    );

    app.delete(
        "/teams/:teamId",
        deleteTeamController,
    );

    app.get(
        "/teams/:teamId/members",
        listTeamMembersController,
    );

    app.post(
        "/teams/:teamId/members",
        addTeamMemberController,
    );

    app.patch(
        "/teams/:teamId/members/:memberId",
        updateTeamMemberController,
    );

    app.delete(
        "/teams/:teamId/members/:memberId",
        removeTeamMemberController,
    );

    app.get(
        "/teams/:teamId/repositories",
        listTeamRepositoriesController,
    );

    app.post(
        "/teams/:teamId/repositories",
        addTeamRepositoryController,
    );

    app.delete(
        "/teams/:teamId/repositories/:repositoryId",
        removeTeamRepositoryController,
    );

    app.get(
        "/teams/:teamId/dashboard",
        async (request) => {
            const { teamId } =
                request.params as {
                    teamId: string;
                };

            return getTeamDashboard({
                teamId,
            });
        },
    );
};
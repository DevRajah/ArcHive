import type {
    FastifyInstance,
} from "fastify";

import {
    acceptTeamInvitationController,
    cancelTeamInvitationController,
    createTeamInvitationController,
    listTeamInvitationsController,
    rejectTeamInvitationController,
    listUserTeamInvitationsController,
} from "../controllers/team-invitation.controller";

export const teamInvitationRoutes =
    async (
        app: FastifyInstance,
    ) => {
        app.post(
            "/teams/:teamId/invitations",
            createTeamInvitationController,
        );

        app.get(
            "/teams/:teamId/invitations",
            listTeamInvitationsController,
        );

        app.delete(
            "/teams/:teamId/invitations/:invitationId",
            cancelTeamInvitationController,
        );

        app.post(
            "/team-invitations/:invitationId/accept",
            acceptTeamInvitationController,
        );

        app.post(
            "/team-invitations/:invitationId/reject",
            rejectTeamInvitationController,
        );
        app.get(
            "/users/:userId/team-invitations",
            listUserTeamInvitationsController,
        );
    };
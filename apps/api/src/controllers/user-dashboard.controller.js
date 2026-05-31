"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserDashboardController = void 0;
const fastify_1 = require("fastify");
const user_dashboard_service_1 = require("../services/user-dashboard.service");
const getUserDashboardController = async (request, reply) => {
    const { userId } = request.params;
    const dashboardSummary = await (0, user_dashboard_service_1.getUserDashboardSummary)(userId);
    if (!dashboardSummary) {
        return reply.status(404).send({
            success: false,
            message: "User not found",
        });
    }
    return reply.status(200).send({
        success: true,
        message: "User dashboard summary fetched successfully",
        data: dashboardSummary,
    });
};
exports.getUserDashboardController = getUserDashboardController;
//# sourceMappingURL=user-dashboard.controller.js.map
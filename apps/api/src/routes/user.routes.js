"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const fastify_1 = require("fastify");
const user_dashboard_controller_1 = require("../controllers/user-dashboard.controller");
const userRoutes = async (app) => {
    app.get("/:userId/dashboard", user_dashboard_controller_1.getUserDashboardController);
};
exports.userRoutes = userRoutes;
//# sourceMappingURL=user.routes.js.map
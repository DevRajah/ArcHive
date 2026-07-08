import { FastifyPluginAsync } from "fastify";
import { adminOnly } from "../../middleware/admin.middleware";
import { successResponse } from "../../utils/http-response";
import dashboardRoute from "./dashboard.route";
import usersRoute from "./users.route";
import repositoriesRoute from "./repositories.route";
import activityRoute from "./activity.route";
import analyticsRoute from "./analytics.route";
import queueRoute from "./queue.route";
import systemRoute from "./system.route";

// import dashboardRoute from "./dashboard.route";
// import usersRoute from "./users.route";
// import repositoriesRoute from "./repositories.route";
// import activityRoute from "./activity.route";
// import analyticsRoute from "./analytics.route";
// import queueRoute from "./queue.route";
// import systemRoute from "./system.route";

// const adminRoutes: FastifyPluginAsync = async (app) => {
//  
//   app.register(usersRoute);
//   
//   app.register(activityRoute);
//   app.register(analyticsRoute);
//   app.register(queueRoute);
//   app.register(systemRoute);
// };

const adminRoutes: FastifyPluginAsync = async (app) => {
    app.addHook("preHandler", adminOnly);

    app.register(dashboardRoute);
    app.register(usersRoute);
    app.register(repositoriesRoute);
    app.register(activityRoute);
    app.register(analyticsRoute);
    app.register(queueRoute);
    app.register(systemRoute);

    app.get("/dashboard", async (_request, reply) => {
        return successResponse(reply, "Admin dashboard loaded successfully.", {
            status: "ONLINE",
        });
    });
};

export default adminRoutes;
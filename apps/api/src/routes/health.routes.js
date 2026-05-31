"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = void 0;
const fastify_1 = require("fastify");
// This route lets me quickly confirm that the API is alive before adding database,
// queues, GitHub webhooks, and other serious platform features.
const healthRoutes = async (app) => {
    app.get("/", async () => {
        return {
            success: true,
            message: "ArcHive API is healthy",
            data: {
                service: "archive-api",
                status: "ONLINE",
                timestamp: new Date().toISOString(),
            },
        };
    });
};
exports.healthRoutes = healthRoutes;
//# sourceMappingURL=health.routes.js.map
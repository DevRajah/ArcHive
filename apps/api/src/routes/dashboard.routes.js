"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRoutes = void 0;
const fastify_1 = require("fastify");
const database_1 = require("@archive/database");
const queue_1 = require("@archive/queue");
const dashboardRoutes = async (app) => {
    app.get("/summary", async () => {
        const [repositoryCount, engineeringEventCount, timelineEntryCount, architectureChangeCount, queueCounts,] = await Promise.all([
            database_1.prisma.repository.count(),
            database_1.prisma.engineeringEvent.count(),
            database_1.prisma.timelineEntry.count(),
            database_1.prisma.architectureChange.count(),
            queue_1.engineeringEventQueue.getJobCounts("waiting", "active", "completed", "failed", "delayed"),
        ]);
        return {
            success: true,
            message: "Dashboard summary fetched successfully",
            data: {
                repositories: repositoryCount,
                engineeringEvents: engineeringEventCount,
                timelineEntries: timelineEntryCount,
                architectureChanges: architectureChangeCount,
                queue: queueCounts,
            },
        };
    });
};
exports.dashboardRoutes = dashboardRoutes;
//# sourceMappingURL=dashboard.routes.js.map
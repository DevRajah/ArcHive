"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = void 0;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const health_routes_1 = require("./routes/health.routes");
const repository_routes_1 = require("./routes/repository.routes");
const engineering_event_routes_1 = require("./routes/engineering-event.routes");
const timeline_routes_1 = require("./routes/timeline.routes");
const architecture_change_routes_1 = require("./routes/architecture-change.routes");
const queue_routes_1 = require("./routes/queue.routes");
const dashboard_routes_1 = require("./routes/dashboard.routes");
const github_routes_1 = require("./routes/github.routes");
const fastify_raw_body_1 = __importDefault(require("fastify-raw-body"));
const github_sync_routes_1 = require("./routes/github-sync.routes");
const dev_routes_1 = require("./routes/dev.routes");
const user_routes_1 = require("./routes/user.routes");
const github_oauth_routes_1 = require("./routes/github-oauth.routes");
// This makes future testing easier because I can import the app without starting the port.
const buildApp = async () => {
    const app = (0, fastify_1.default)({
        logger: true,
    });
    await app.register(cors_1.default, {
        origin: true,
        credentials: true,
    });
    await app.register(fastify_raw_body_1.default, {
        field: "rawBody",
        global: false,
        encoding: "utf8",
        runFirst: true,
    });
    // I keep routes modular so ArcHive does not become messy as it grows.
    await app.register(health_routes_1.healthRoutes, {
        prefix: "/api/health",
    });
    await app.register(repository_routes_1.repositoryRoutes, {
        prefix: "/api/repositories",
    });
    await app.register(engineering_event_routes_1.engineeringEventRoutes, {
        prefix: "/api/repositories",
    });
    await app.register(timeline_routes_1.timelineRoutes, {
        prefix: "/api/repositories",
    });
    await app.register(architecture_change_routes_1.architectureChangeRoutes, {
        prefix: "/api/repositories",
    });
    await app.register(queue_routes_1.queueRoutes, {
        prefix: "/api/queues",
    });
    await app.register(dashboard_routes_1.dashboardRoutes, {
        prefix: "/api/dashboard",
    });
    await app.register(github_routes_1.githubRoutes, {
        prefix: "/api/github",
    });
    await app.register(github_sync_routes_1.githubSyncRoutes, {
        prefix: "/api/github",
    });
    await app.register(dev_routes_1.devRoutes, {
        prefix: "/api/dev",
    });
    await app.register(user_routes_1.userRoutes, {
        prefix: "/api/users",
    });
    await app.register(github_oauth_routes_1.githubOAuthRoutes, {
        prefix: "/api/github/oauth",
    });
    return app;
};
exports.buildApp = buildApp;
//# sourceMappingURL=app.js.map
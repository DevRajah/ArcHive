"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyGitHubPushEvent = void 0;
const client_1 = require("@prisma/client");
const classifyGitHubPushEvent = ({ filesChanged, commitMessages, history, }) => {
    const combined = `${filesChanged.join(" ")} ${commitMessages.join(" ")}`.toLowerCase();
    const hasQueueSignal = combined.includes("queue") ||
        combined.includes("bullmq") ||
        combined.includes("worker");
    const hasRedisSignal = combined.includes("redis") ||
        combined.includes("ioredis") ||
        combined.includes("cache");
    const hasDockerSignal = combined.includes("docker") ||
        combined.includes("docker-compose");
    const hasDatabaseSignal = combined.includes("schema.prisma") ||
        combined.includes("migration") ||
        combined.includes("database");
    const hasApiSignal = combined.includes("route") ||
        combined.includes("controller") ||
        combined.includes("service");
    const hasAuthSignal = combined.includes("auth") ||
        combined.includes("jwt") ||
        combined.includes("oauth") ||
        combined.includes("security");
    const hasDependencySignal = combined.includes("package.json") ||
        combined.includes("package-lock.json");
    const hasFrontendSignal = combined.includes(".tsx") ||
        combined.includes(".jsx") ||
        combined.includes("components") ||
        combined.includes("apps/web");
    // I check queue before API/frontend because queue files often live inside routes/components too.
    if (hasQueueSignal) {
        return history.hasQueueHistory
            ? client_1.EngineeringEventType.QUEUE_INFRASTRUCTURE_UPDATED
            : client_1.EngineeringEventType.QUEUE_ADDED;
    }
    if (hasRedisSignal) {
        return history.hasRedisHistory
            ? client_1.EngineeringEventType.REDIS_INFRASTRUCTURE_UPDATED
            : client_1.EngineeringEventType.REDIS_INFRASTRUCTURE_ADDED;
    }
    if (hasDockerSignal) {
        return history.hasDockerHistory
            ? client_1.EngineeringEventType.DOCKER_INFRASTRUCTURE_UPDATED
            : client_1.EngineeringEventType.DOCKER_INFRASTRUCTURE_CHANGED;
    }
    if (hasDatabaseSignal) {
        return history.hasDatabaseHistory
            ? client_1.EngineeringEventType.DATABASE_SCHEMA_UPDATED
            : client_1.EngineeringEventType.DATABASE_SCHEMA_CHANGED;
    }
    if (hasAuthSignal) {
        return client_1.EngineeringEventType.AUTH_SYSTEM_CHANGED;
    }
    if (hasApiSignal) {
        return client_1.EngineeringEventType.API_ENDPOINT_CHANGED;
    }
    if (hasDependencySignal) {
        return client_1.EngineeringEventType.DEPENDENCY_CHANGED;
    }
    if (hasFrontendSignal) {
        return client_1.EngineeringEventType.FRONTEND_UI_CHANGED;
    }
    return client_1.EngineeringEventType.ENGINEERING_EVENT;
};
exports.classifyGitHubPushEvent = classifyGitHubPushEvent;
//# sourceMappingURL=github-push-classifier.js.map
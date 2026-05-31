"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyEngineeringEventForDashboard = void 0;
const humanRepository = (name) => name || "This repository";
const getPayloadText = (rawPayload) => {
    if (!rawPayload)
        return "";
    const commitMessages = Array.isArray(rawPayload.commitMessages)
        ? rawPayload.commitMessages.join(" ")
        : "";
    const filesChanged = Array.isArray(rawPayload.filesChanged)
        ? rawPayload.filesChanged.join(" ")
        : "";
    const commits = Array.isArray(rawPayload.commits)
        ? rawPayload.commits
            .map((commit) => {
            const added = Array.isArray(commit.added) ? commit.added.join(" ") : "";
            const modified = Array.isArray(commit.modified)
                ? commit.modified.join(" ")
                : "";
            const removed = Array.isArray(commit.removed)
                ? commit.removed.join(" ")
                : "";
            return `${commit.message || ""} ${added} ${modified} ${removed}`;
        })
            .join(" ")
        : "";
    return `${commitMessages} ${filesChanged} ${commits}`.toLowerCase();
};
const classifyEngineeringEventForDashboard = ({ rawEventType, rawPayload, repositoryName, history, }) => {
    const repo = humanRepository(repositoryName);
    const payloadText = getPayloadText(rawPayload);
    const safeRawType = typeof rawEventType === "string" && rawEventType.trim().length > 0
        ? rawEventType
        : "ENGINEERING_EVENT";
    const known = {
        QUEUE_ADDED: history?.hasQueueHistory
            ? {
                eventType: "QUEUE_INFRASTRUCTURE_UPDATED",
                title: "Queue Processing Updated",
                summary: `${repo} updated queue-based background processing or job infrastructure.`,
            }
            : {
                eventType: "QUEUE_ADDED",
                title: "Queue Infrastructure Added",
                summary: `${repo} introduced queue-based background processing.`,
            },
        QUEUE_INFRASTRUCTURE_UPDATED: {
            eventType: "QUEUE_INFRASTRUCTURE_UPDATED",
            title: "Queue Processing Updated",
            summary: `${repo} updated queue-based background processing or job infrastructure.`,
        },
        REDIS_ADDED: history?.hasRedisHistory
            ? {
                eventType: "REDIS_INFRASTRUCTURE_UPDATED",
                title: "Redis Infrastructure Updated",
                summary: `${repo} updated Redis-related infrastructure for caching, queues, or realtime workflows.`,
            }
            : {
                eventType: "REDIS_INFRASTRUCTURE_ADDED",
                title: "Redis Infrastructure Added",
                summary: `${repo} introduced Redis infrastructure for caching, queues, or realtime workflows.`,
            },
        REDIS_INFRASTRUCTURE_ADDED: {
            eventType: "REDIS_INFRASTRUCTURE_ADDED",
            title: "Redis Infrastructure Added",
            summary: `${repo} introduced Redis infrastructure for caching, queues, or realtime workflows.`,
        },
        REDIS_INFRASTRUCTURE_UPDATED: {
            eventType: "REDIS_INFRASTRUCTURE_UPDATED",
            title: "Redis Infrastructure Updated",
            summary: `${repo} updated Redis-related infrastructure for caching, queues, or realtime workflows.`,
        },
        DOCKER_ADDED: history?.hasDockerHistory
            ? {
                eventType: "DOCKER_INFRASTRUCTURE_UPDATED",
                title: "Docker Infrastructure Updated",
                summary: `${repo} updated Docker or container infrastructure.`,
            }
            : {
                eventType: "DOCKER_INFRASTRUCTURE_CHANGED",
                title: "Docker Infrastructure Added",
                summary: `${repo} introduced Docker or container infrastructure.`,
            },
        DOCKER_INFRASTRUCTURE_CHANGED: {
            eventType: "DOCKER_INFRASTRUCTURE_CHANGED",
            title: "Docker Infrastructure Added",
            summary: `${repo} introduced Docker or container infrastructure.`,
        },
        DOCKER_INFRASTRUCTURE_UPDATED: {
            eventType: "DOCKER_INFRASTRUCTURE_UPDATED",
            title: "Docker Infrastructure Updated",
            summary: `${repo} updated Docker or container infrastructure.`,
        },
        DATABASE_CHANGE: history?.hasDatabaseHistory
            ? {
                eventType: "DATABASE_SCHEMA_UPDATED",
                title: "Database Schema Updated",
                summary: `${repo} updated its database schema or persistence layer.`,
            }
            : {
                eventType: "DATABASE_SCHEMA_CHANGED",
                title: "Database Schema Changed",
                summary: `${repo} introduced a database or persistence-layer change.`,
            },
        DATABASE_SCHEMA_CHANGED: {
            eventType: "DATABASE_SCHEMA_CHANGED",
            title: "Database Schema Changed",
            summary: `${repo} changed its database schema or persistence layer.`,
        },
        DATABASE_SCHEMA_UPDATED: {
            eventType: "DATABASE_SCHEMA_UPDATED",
            title: "Database Schema Updated",
            summary: `${repo} updated its database schema or persistence layer.`,
        },
        API_ENDPOINT_CHANGED: {
            eventType: "API_ENDPOINT_CHANGED",
            title: "API Layer Changed",
            summary: `${repo} updated API routes, controllers, or service logic.`,
        },
        AUTH_SYSTEM_CHANGED: {
            eventType: "AUTH_SYSTEM_CHANGED",
            title: "Auth System Changed",
            summary: `${repo} updated authentication or security-related logic.`,
        },
        DEPENDENCY_CHANGED: {
            eventType: "DEPENDENCY_CHANGED",
            title: "Dependencies Changed",
            summary: `${repo} updated project dependencies.`,
        },
        FRONTEND_UI_CHANGED: {
            eventType: "FRONTEND_UI_CHANGED",
            title: "Frontend UI Changed",
            summary: `${repo} updated frontend UI or application components.`,
        },
        PR_MERGED: {
            eventType: "PR_MERGED",
            title: "Pull Request Merged",
            summary: `${repo} merged a pull request into the codebase.`,
        },
        PULL_REQUEST: {
            eventType: "PULL_REQUEST",
            title: "Pull Request Activity",
            summary: `${repo} recorded pull request activity.`,
        },
        COMMIT_PUSHED: {
            eventType: "COMMIT_PUSHED",
            title: "Code Pushed",
            summary: `${repo} received new code changes from GitHub.`,
        },
        ENGINEERING_EVENT: {
            eventType: "ENGINEERING_EVENT",
            title: "Engineering Activity Recorded",
            summary: "ArcHive detected repository activity that could not yet be mapped to a known architecture category.",
        },
        UNKNOWN: {
            eventType: "ENGINEERING_EVENT",
            title: "Engineering Activity Recorded",
            summary: "ArcHive detected repository activity that could not yet be mapped to a known architecture category.",
        },
    };
    // known database event types are handled before keyword inference.
    // This prevents QUEUE_INFRASTRUCTURE_UPDATED from accidentally being reclassified as QUEUE_ADDED.
    if (known[safeRawType]) {
        return known[safeRawType];
    }
    const hasQueueSignal = payloadText.includes("bullmq") ||
        payloadText.includes("queue") ||
        payloadText.includes("worker");
    const hasRedisSignal = payloadText.includes("redis") ||
        payloadText.includes("ioredis") ||
        payloadText.includes("cache");
    const hasDockerSignal = payloadText.includes("docker") ||
        payloadText.includes("docker-compose");
    const hasDatabaseSignal = payloadText.includes("schema.prisma") ||
        payloadText.includes("migration") ||
        payloadText.includes("database");
    if (hasQueueSignal) {
        if (history?.hasQueueHistory) {
            return {
                eventType: "QUEUE_INFRASTRUCTURE_UPDATED",
                title: "Queue Processing Updated",
                summary: `${repo} updated queue-based background processing or job infrastructure.`,
            };
        }
        return {
            eventType: "QUEUE_ADDED",
            title: "Queue Infrastructure Added",
            summary: `${repo} introduced queue-based background processing.`,
        };
    }
    if (hasRedisSignal) {
        if (history?.hasRedisHistory) {
            return {
                eventType: "REDIS_INFRASTRUCTURE_UPDATED",
                title: "Redis Infrastructure Updated",
                summary: `${repo} updated Redis-related infrastructure for caching, queues, or realtime workflows.`,
            };
        }
        return {
            eventType: "REDIS_INFRASTRUCTURE_ADDED",
            title: "Redis Infrastructure Added",
            summary: `${repo} introduced Redis infrastructure for caching, queues, or realtime workflows.`,
        };
    }
    if (hasDockerSignal) {
        if (history?.hasDockerHistory) {
            return {
                eventType: "DOCKER_INFRASTRUCTURE_UPDATED",
                title: "Docker Infrastructure Updated",
                summary: `${repo} updated Docker or container infrastructure.`,
            };
        }
        return {
            eventType: "DOCKER_INFRASTRUCTURE_CHANGED",
            title: "Docker Infrastructure Added",
            summary: `${repo} introduced Docker or container infrastructure.`,
        };
    }
    if (hasDatabaseSignal) {
        if (history?.hasDatabaseHistory) {
            return {
                eventType: "DATABASE_SCHEMA_UPDATED",
                title: "Database Schema Updated",
                summary: `${repo} updated its database schema or persistence layer.`,
            };
        }
        return {
            eventType: "DATABASE_SCHEMA_CHANGED",
            title: "Database Schema Changed",
            summary: `${repo} introduced a database or persistence-layer change.`,
        };
    }
    if (payloadText.includes("route") ||
        payloadText.includes("controller") ||
        payloadText.includes("service")) {
        return {
            eventType: "API_ENDPOINT_CHANGED",
            title: "API Layer Changed",
            summary: `${repo} updated API routes, controllers, or service logic.`,
        };
    }
    if (payloadText.includes("auth") ||
        payloadText.includes("jwt") ||
        payloadText.includes("oauth") ||
        payloadText.includes("security")) {
        return {
            eventType: "AUTH_SYSTEM_CHANGED",
            title: "Auth System Changed",
            summary: `${repo} updated authentication or security-related logic.`,
        };
    }
    if (payloadText.includes("package.json") ||
        payloadText.includes("package-lock.json")) {
        return {
            eventType: "DEPENDENCY_CHANGED",
            title: "Dependencies Changed",
            summary: `${repo} updated project dependencies.`,
        };
    }
    if (payloadText.includes(".tsx") ||
        payloadText.includes(".jsx") ||
        payloadText.includes("components") ||
        payloadText.includes("app/")) {
        return {
            eventType: "FRONTEND_UI_CHANGED",
            title: "Frontend UI Changed",
            summary: `${repo} updated frontend UI or application components.`,
        };
    }
    return {
        eventType: "ENGINEERING_EVENT",
        title: "Engineering Activity Recorded",
        summary: "ArcHive detected repository activity that could not yet be mapped to a known architecture category.",
    };
};
exports.classifyEngineeringEventForDashboard = classifyEngineeringEventForDashboard;
//# sourceMappingURL=engineering-event-classifier.js.map
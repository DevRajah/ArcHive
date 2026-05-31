"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubRoutes = void 0;
const fastify_1 = require("fastify");
const database_1 = require("@archive/database");
const client_1 = require("@prisma/client");
const queue_1 = require("@archive/queue");
const github_signature_1 = require("../utils/github-signature");
const getChangedFilesFromCommits = (commits) => {
    const changedFiles = new Set();
    for (const commit of commits) {
        const added = Array.isArray(commit.added) ? commit.added : [];
        const modified = Array.isArray(commit.modified) ? commit.modified : [];
        const removed = Array.isArray(commit.removed) ? commit.removed : [];
        [...added, ...modified, ...removed].forEach((file) => {
            if (typeof file === "string") {
                changedFiles.add(file);
            }
        });
    }
    return Array.from(changedFiles);
};
const detectEventTypeFromPush = ({ filesChanged, commitMessages, }) => {
    const fileText = filesChanged.join(" ").toLowerCase();
    const messageText = commitMessages.join(" ").toLowerCase();
    const combined = `${fileText} ${messageText}`;
    if (combined.includes("queue") ||
        combined.includes("worker") ||
        combined.includes("bullmq")) {
        return client_1.EngineeringEventType.QUEUE_ADDED;
    }
    if (combined.includes("redis") ||
        combined.includes("cache") ||
        combined.includes("ioredis")) {
        return client_1.EngineeringEventType.REDIS_ADDED;
    }
    if (combined.includes("docker") || combined.includes("container")) {
        return client_1.EngineeringEventType.DOCKER_ADDED;
    }
    if (combined.includes("schema.prisma") ||
        combined.includes("migration") ||
        combined.includes("database")) {
        return client_1.EngineeringEventType.DATABASE_CHANGE;
    }
    return client_1.EngineeringEventType.UNKNOWN;
};
const githubRoutes = async (app) => {
    app.post("/webhook", {
        config: {
            rawBody: true,
        },
    }, async (request, reply) => {
        const githubEvent = request.headers["x-github-event"];
        const signature = request.headers["x-hub-signature-256"];
        const rawBody = request.rawBody;
        if (process.env.NODE_ENV !== "development") {
            const verification = (0, github_signature_1.verifyGitHubSignature)({
                payload: rawBody || "",
                signature,
                secret: process.env.GITHUB_WEBHOOK_SECRET,
            });
            if (!verification.valid) {
                return reply.status(401).send({
                    success: false,
                    message: verification.reason,
                });
            }
        }
        const payload = request.body;
        if (githubEvent === "ping") {
            return reply.status(200).send({
                success: true,
                message: "GitHub webhook ping received successfully",
            });
        }
        if (githubEvent !== "push") {
            return reply.status(200).send({
                success: true,
                message: `Ignoring unsupported GitHub event: ${githubEvent}`,
            });
        }
        const repositoryFullName = payload.repository?.full_name;
        if (!repositoryFullName) {
            return reply.status(400).send({
                success: false,
                message: "Repository full name missing from GitHub payload",
            });
        }
        const repository = await database_1.prisma.repository.findUnique({
            where: {
                fullName: repositoryFullName,
            },
        });
        if (!repository) {
            return reply.status(404).send({
                success: false,
                message: "Repository not registered in ArcHive",
            });
        }
        const commits = Array.isArray(payload.commits)
            ? payload.commits
            : [];
        const filesChanged = getChangedFilesFromCommits(commits);
        const commitMessages = commits
            .map((commit) => commit.message)
            .filter((message) => typeof message === "string");
        const detectedEventType = detectEventTypeFromPush({
            filesChanged,
            commitMessages,
        });
        const engineeringEvent = await database_1.prisma.engineeringEvent.create({
            data: {
                repositoryId: repository.id,
                eventType: detectedEventType,
                source: "github-webhook",
                rawPayload: {
                    githubEvent,
                    repository: repositoryFullName,
                    commitMessages,
                    commits,
                    filesChanged,
                },
                occurredAt: new Date(),
            },
        });
        await queue_1.engineeringEventQueue.add("process-engineering-event", {
            eventId: engineeringEvent.id,
            repositoryId: repository.id,
        }, {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 3000,
            },
        });
        return reply.status(200).send({
            success: true,
            message: "GitHub webhook processed successfully",
            data: {
                repositoryId: repository.id,
                engineeringEventId: engineeringEvent.id,
                detectedEventType,
                filesChanged,
                commitMessages,
                commitCount: commits.length,
            },
        });
    });
};
exports.githubRoutes = githubRoutes;
//# sourceMappingURL=github-signature.js.map
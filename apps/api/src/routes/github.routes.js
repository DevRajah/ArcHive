"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubRoutes = void 0;
const fastify_1 = require("fastify");
const database_1 = require("@archive/database");
const client_1 = require("@prisma/client");
const queue_1 = require("@archive/queue");
const github_push_classifier_1 = require("../utils/github-push-classifier");
const githubRoutes = async (app) => {
    app.post("/webhook", async (request, reply) => {
        // GitHub tells us what type of event this webhook represents.
        const githubEvent = request.headers["x-github-event"];
        const payload = request.body;
        console.log("GitHub event received:", githubEvent);
        // For now, we only support push and pull_request events.
        // Later we'll add release, deployment, etc.
        if (githubEvent === "pull_request") {
            const repositoryFullName = payload.repository?.full_name;
            const action = payload.action;
            const pullRequest = payload.pull_request;
            if (!repositoryFullName || !pullRequest) {
                return reply.status(400).send({
                    success: false,
                    message: "Repository or pull request payload missing",
                });
            }
            const repository = await database_1.prisma.repository.findUnique({
                where: { fullName: repositoryFullName },
            });
            if (!repository) {
                return reply.status(404).send({
                    success: false,
                    message: "Repository not registered in ArcHive",
                });
            }
            const isMerged = action === "closed" && pullRequest.merged === true;
            const eventType = isMerged
                ? client_1.EngineeringEventType.PR_MERGED
                : client_1.EngineeringEventType.PULL_REQUEST;
            const engineeringEvent = await database_1.prisma.engineeringEvent.create({
                data: {
                    repositoryId: repository.id,
                    eventType,
                    source: "github-webhook",
                    rawPayload: {
                        githubEvent,
                        action,
                        repository: repositoryFullName,
                        pullRequest: {
                            id: pullRequest.id,
                            number: pullRequest.number,
                            title: pullRequest.title,
                            body: pullRequest.body,
                            merged: pullRequest.merged,
                            additions: pullRequest.additions,
                            deletions: pullRequest.deletions,
                            changedFiles: pullRequest.changed_files,
                        },
                    },
                    occurredAt: new Date(pullRequest.updated_at || Date.now()),
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
                message: "GitHub pull request webhook processed successfully",
                data: {
                    repositoryId: repository.id,
                    engineeringEventId: engineeringEvent.id,
                    eventType,
                    action,
                    pullRequestNumber: pullRequest.number,
                },
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
        // ArcHive only processes repositories already registered in the system.
        if (!repository) {
            return reply.status(404).send({
                success: false,
                message: "Repository not registered in ArcHive",
            });
        }
        const commits = Array.isArray(payload.commits)
            ? payload.commits
            : [];
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
        // Very early/simple architecture classification logic.
        // This will become much smarter later.
        let detectedEventType = client_1.EngineeringEventType.UNKNOWN;
        const fileList = Array.from(changedFiles).join(" ").toLowerCase();
        if (fileList.includes("queue") ||
            fileList.includes("worker") ||
            fileList.includes("bullmq")) {
            detectedEventType = client_1.EngineeringEventType.QUEUE_ADDED;
        }
        else if (fileList.includes("redis") ||
            fileList.includes("cache")) {
            detectedEventType = client_1.EngineeringEventType.REDIS_ADDED;
        }
        else if (fileList.includes("docker")) {
            detectedEventType = client_1.EngineeringEventType.DOCKER_ADDED;
        }
        else if (fileList.includes("schema.prisma") ||
            fileList.includes("migration")) {
            detectedEventType = client_1.EngineeringEventType.DATABASE_CHANGE;
        }
        const engineeringEvent = await database_1.prisma.engineeringEvent.create({
            data: {
                repositoryId: repository.id,
                eventType: detectedEventType,
                source: "github-webhook",
                rawPayload: {
                    githubEvent,
                    repository: repositoryFullName,
                    commits,
                    filesChanged: Array.from(changedFiles),
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
                engineeringEventId: engineeringEvent.id,
                detectedEventType,
                filesChanged: Array.from(changedFiles),
                commitCount: commits.length,
            },
        });
    });
};
exports.githubRoutes = githubRoutes;
//# sourceMappingURL=github.routes.js.map
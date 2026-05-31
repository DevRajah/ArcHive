"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.engineeringEventRoutes = void 0;
const fastify_1 = require("fastify");
const database_1 = require("@archive/database");
const client_1 = require("@prisma/client");
const queue_1 = require("@archive/queue");
const engineeringEventRoutes = async (app) => {
    app.post("/:repositoryId/events", async (request, reply) => {
        const { repositoryId } = request.params;
        const { eventType, source, rawPayload, occurredAt } = request.body;
        if (!eventType || !rawPayload) {
            return reply.status(400).send({
                success: false,
                message: "eventType and rawPayload are required",
            });
        }
        const repository = await database_1.prisma.repository.findUnique({
            where: { id: repositoryId },
        });
        if (!repository) {
            return reply.status(404).send({
                success: false,
                message: "Repository not found",
            });
        }
        const event = await database_1.prisma.engineeringEvent.create({
            data: {
                repositoryId,
                eventType,
                source: source || "manual",
                rawPayload,
                occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
            },
        });
        // I queue the heavy processing instead of creating timeline entries inside the API request.
        // This keeps the API fast and lets the worker handle retries safely.
        await queue_1.engineeringEventQueue.add("process-engineering-event", {
            eventId: event.id,
            repositoryId: event.repositoryId,
        }, {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 3000,
            },
            removeOnComplete: 100,
            removeOnFail: 500,
        });
        return reply.status(201).send({
            success: true,
            message: "Engineering event created and queued for processing",
            data: {
                event,
                queued: true,
            },
        });
    });
    app.get("/:repositoryId/events", async (request, reply) => {
        const { repositoryId } = request.params;
        const repository = await database_1.prisma.repository.findUnique({
            where: { id: repositoryId },
        });
        if (!repository) {
            return reply.status(404).send({
                success: false,
                message: "Repository not found",
            });
        }
        const events = await database_1.prisma.engineeringEvent.findMany({
            where: { repositoryId },
            orderBy: { occurredAt: "desc" },
        });
        return {
            success: true,
            message: "Engineering events fetched successfully",
            data: events,
        };
    });
};
exports.engineeringEventRoutes = engineeringEventRoutes;
//# sourceMappingURL=engineering-event.routes.js.map
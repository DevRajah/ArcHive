"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timelineRoutes = void 0;
const fastify_1 = require("fastify");
const database_1 = require("@archive/database");
const timelineRoutes = async (app) => {
    app.post("/:repositoryId/timeline", async (request, reply) => {
        const { repositoryId } = request.params;
        const { relatedEventId, title, summary, importanceScore, generatedByAI, } = request.body;
        if (!title || !summary) {
            return reply.status(400).send({
                success: false,
                message: "title and summary are required",
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
        if (relatedEventId) {
            const event = await database_1.prisma.engineeringEvent.findFirst({
                where: {
                    id: relatedEventId,
                    repositoryId,
                },
            });
            if (!event) {
                return reply.status(404).send({
                    success: false,
                    message: "Related engineering event not found for this repository",
                });
            }
        }
        const timelineEntry = await database_1.prisma.timelineEntry.create({
            data: {
                repositoryId,
                relatedEventId,
                title,
                summary,
                importanceScore: importanceScore || 1,
                generatedByAI: generatedByAI || false,
            },
        });
        return reply.status(201).send({
            success: true,
            message: "Timeline entry created successfully",
            data: timelineEntry,
        });
    });
    app.get("/:repositoryId/timeline", async (request, reply) => {
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
        const timeline = await database_1.prisma.timelineEntry.findMany({
            where: { repositoryId },
            include: {
                relatedEvent: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return {
            success: true,
            message: "Timeline fetched successfully",
            data: timeline,
        };
    });
};
exports.timelineRoutes = timelineRoutes;
//# sourceMappingURL=timeline.routes.js.map
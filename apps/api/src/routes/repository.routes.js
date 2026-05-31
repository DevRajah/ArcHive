"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repositoryRoutes = void 0;
const fastify_1 = require("fastify");
const database_1 = require("@archive/database");
const repositoryRoutes = async (app) => {
    app.post("/", async (request, reply) => {
        const { name, owner, fullName, description, defaultBranch } = request.body;
        if (!name || !owner || !fullName) {
            return reply.status(400).send({
                success: false,
                message: "name, owner and fullName are required",
            });
        }
        const existingRepository = await database_1.prisma.repository.findUnique({
            where: { fullName },
        });
        if (existingRepository) {
            return reply.status(409).send({
                success: false,
                message: "Repository already exists",
            });
        }
        const repository = await database_1.prisma.repository.create({
            data: {
                name,
                owner,
                fullName,
                description,
                defaultBranch: defaultBranch || "main",
            },
        });
        return reply.status(201).send({
            success: true,
            message: "Repository created successfully",
            data: repository,
        });
    });
    app.get("/", async () => {
        const repositories = await database_1.prisma.repository.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        return {
            success: true,
            message: "Repositories fetched successfully",
            data: repositories,
        };
    });
    app.get("/:repositoryId", async (request, reply) => {
        const { repositoryId } = request.params;
        const repository = await database_1.prisma.repository.findUnique({
            where: { id: repositoryId },
            include: {
                timelineEntries: {
                    orderBy: { createdAt: "desc" },
                    take: 5,
                },
                architectureChanges: {
                    orderBy: { createdAt: "desc" },
                    take: 5,
                },
                events: {
                    orderBy: { occurredAt: "desc" },
                    take: 5,
                },
            },
        });
        if (!repository) {
            return reply.status(404).send({
                success: false,
                message: "Repository not found",
            });
        }
        return {
            success: true,
            message: "Repository details fetched successfully",
            data: repository,
        };
    });
    //mini dashboard
    app.get("/:repositoryId/overview", async (request, reply) => {
        const { repositoryId } = request.params;
        const repository = await database_1.prisma.repository.findUnique({
            where: { id: repositoryId },
            include: {
                _count: {
                    select: {
                        events: true,
                        timelineEntries: true,
                        architectureChanges: true,
                    },
                },
            },
        });
        if (!repository) {
            return reply.status(404).send({
                success: false,
                message: "Repository not found",
            });
        }
        const [recentEvents, recentTimelineEntries, recentArchitectureChanges] = await Promise.all([
            database_1.prisma.engineeringEvent.findMany({
                where: { repositoryId },
                orderBy: { occurredAt: "desc" },
                take: 10,
            }),
            database_1.prisma.timelineEntry.findMany({
                where: { repositoryId },
                orderBy: { createdAt: "desc" },
                take: 10,
            }),
            database_1.prisma.architectureChange.findMany({
                where: { repositoryId },
                orderBy: { createdAt: "desc" },
                take: 10,
            }),
        ]);
        return {
            success: true,
            message: "Repository overview fetched successfully",
            data: {
                repository,
                metrics: {
                    totalEvents: repository._count.events,
                    totalTimelineEntries: repository._count.timelineEntries,
                    totalArchitectureChanges: repository._count.architectureChanges,
                },
                recentEvents,
                recentTimelineEntries,
                recentArchitectureChanges,
            },
        };
    });
    //reset repo for dev testing - not exposed in frontend
    app.delete("/reset-user-repositories/:userId", async (request, reply) => {
        const { userId } = request.params;
        const result = await database_1.prisma.repository.updateMany({
            where: { userId },
            data: { userId: null },
        });
        return {
            success: true,
            message: "User repositories detached successfully",
            data: {
                detachedCount: result.count,
            },
        };
    });
};
exports.repositoryRoutes = repositoryRoutes;
//# sourceMappingURL=repository.routes.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.architectureChangeRoutes = void 0;
const fastify_1 = require("fastify");
const database_1 = require("@archive/database");
const architectureChangeRoutes = async (app) => {
    app.post("/:repositoryId/architecture-changes", async (request, reply) => {
        const { repositoryId } = request.params;
        const { changeType, detectedTechnology, fileAffected, summary } = request.body;
        if (!changeType || !summary) {
            return reply.status(400).send({
                success: false,
                message: "changeType and summary are required",
            });
        }
        // I check the repository first so we do not create architecture history for a project ArcHive does not know.
        const repository = await database_1.prisma.repository.findUnique({
            where: { id: repositoryId },
        });
        if (!repository) {
            return reply.status(404).send({
                success: false,
                message: "Repository not found",
            });
        }
        const architectureChange = await database_1.prisma.architectureChange.create({
            data: {
                repositoryId,
                changeType,
                detectedTechnology,
                fileAffected,
                summary,
            },
        });
        return reply.status(201).send({
            success: true,
            message: "Architecture change recorded successfully",
            data: architectureChange,
        });
    });
    app.get("/:repositoryId/architecture-changes", async (request, reply) => {
        const { repositoryId } = request.params;
        // Same safety check here: a wrong repository ID should return 404, not an empty misleading list.
        const repository = await database_1.prisma.repository.findUnique({
            where: { id: repositoryId },
        });
        if (!repository) {
            return reply.status(404).send({
                success: false,
                message: "Repository not found",
            });
        }
        const architectureChanges = await database_1.prisma.architectureChange.findMany({
            where: { repositoryId },
            orderBy: { createdAt: "desc" },
        });
        return {
            success: true,
            message: "Architecture changes fetched successfully",
            data: architectureChanges,
        };
    });
};
exports.architectureChangeRoutes = architectureChangeRoutes;
//# sourceMappingURL=architecture-change.routes.js.map
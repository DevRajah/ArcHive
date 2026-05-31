"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devRoutes = void 0;
const fastify_1 = require("fastify");
const database_1 = require("@archive/database");
const devRoutes = async (app) => {
    app.post("/seed-user", async () => {
        // I use upsert so rerunning the seed route does not create duplicate dev users.
        const user = await database_1.prisma.user.upsert({
            where: {
                username: "DevRajah",
            },
            update: {},
            create: {
                githubId: "github_dev_001",
                username: "DevRajah",
                email: "devrajah@example.com",
                avatarUrl: "https://github.com/devrajah.png",
            },
        });
        return {
            success: true,
            message: "Development user seeded successfully",
            data: user,
        };
    });
    app.patch("/attach-repositories-to-user", async (request, reply) => {
        const { userId } = request.body;
        if (!userId) {
            return reply.status(400).send({
                success: false,
                message: "userId is required",
            });
        }
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return reply.status(404).send({
                success: false,
                message: "User not found",
            });
        }
        // I attach existing repositories owned by this GitHub username to my dev user.
        // This fixes old repos that were created before user ownership existed.
        const result = await database_1.prisma.repository.updateMany({
            where: {
                owner: user.username,
                userId: null,
            },
            data: {
                userId: user.id,
            },
        });
        return {
            success: true,
            message: "Repositories attached to user successfully",
            data: {
                matchedOwner: user.username,
                updatedCount: result.count,
            },
        };
    });
    app.delete("/reset-user-repositories/:userId", async (request, reply) => {
        const { userId } = request.params;
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return reply.status(404).send({
                success: false,
                message: "User not found",
            });
        }
        // I detach repos instead of deleting them so old timeline/event data is not destroyed during testing.
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
exports.devRoutes = devRoutes;
//# sourceMappingURL=dev.routes.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubSyncRoutes = void 0;
const fastify_1 = require("fastify");
const database_1 = require("@archive/database");
const axios_1 = __importDefault(require("axios"));
const githubSyncRoutes = async (app) => {
    app.post("/repositories/sync", async (request, reply) => {
        const { userId, githubRepoId, name, owner, fullName, description, defaultBranch, } = request.body;
        if (!name || !owner || !fullName) {
            return reply.status(400).send({
                success: false,
                message: "name, owner and fullName are required",
            });
        }
        // I use upsert because syncing should create a repo if it is new,
        // but update it if ArcHive already knows about it.
        const repository = await database_1.prisma.repository.upsert({
            where: { fullName },
            create: {
                userId,
                githubRepoId,
                name,
                owner,
                fullName,
                description,
                defaultBranch: defaultBranch || "main",
            },
            update: {
                userId,
                githubRepoId,
                name,
                owner,
                description,
                defaultBranch,
            },
        });
        return reply.status(200).send({
            success: true,
            message: "Repository synced successfully",
            data: repository,
        });
    });
    app.post("/users/:userId/repositories/import", async (request, reply) => {
        const { userId } = request.params;
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.githubAccessToken) {
            return reply.status(404).send({
                success: false,
                message: "GitHub-connected user not found",
            });
        }
        const githubReposResponse = await axios_1.default.get("https://api.github.com/user/repos", {
            headers: {
                Authorization: `Bearer ${user.githubAccessToken}`,
                Accept: "application/vnd.github+json",
            },
            params: {
                per_page: 100,
                sort: "updated",
            },
        });
        const githubRepos = githubReposResponse.data;
        const syncedRepositories = [];
        for (const repo of githubRepos) {
            const repository = await database_1.prisma.repository.upsert({
                where: {
                    fullName: repo.full_name,
                },
                create: {
                    githubRepoId: String(repo.id),
                    name: repo.name,
                    owner: repo.owner.login,
                    fullName: repo.full_name,
                    description: repo.description,
                    defaultBranch: repo.default_branch,
                    userId: user.id,
                },
                update: {
                    githubRepoId: String(repo.id),
                    name: repo.name,
                    owner: repo.owner.login,
                    description: repo.description,
                    defaultBranch: repo.default_branch,
                    userId: user.id,
                },
            });
            syncedRepositories.push(repository);
        }
        return {
            success: true,
            message: "GitHub repositories imported successfully",
            data: {
                importedCount: syncedRepositories.length,
                repositories: syncedRepositories,
            },
        };
    });
    app.get("/users/:userId/repositories/available", async (request, reply) => {
        const { userId } = request.params;
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.githubAccessToken) {
            return reply.status(404).send({
                success: false,
                message: "GitHub-connected user not found",
            });
        }
        const githubReposResponse = await axios_1.default.get("https://api.github.com/user/repos", {
            headers: {
                Authorization: `Bearer ${user.githubAccessToken}`,
                Accept: "application/vnd.github+json",
            },
            params: {
                per_page: 100,
                sort: "updated",
            },
        });
        const repos = githubReposResponse.data;
        return {
            success: true,
            message: "Available GitHub repositories fetched successfully",
            data: repos.map((repo) => ({
                githubRepoId: String(repo.id),
                name: repo.name,
                owner: repo.owner.login,
                fullName: repo.full_name,
                description: repo.description,
                defaultBranch: repo.default_branch,
                private: repo.private,
            })),
        };
    });
    app.post("/users/:userId/repositories/import-selected", async (request, reply) => {
        const { userId } = request.params;
        const { repositories } = request.body;
        if (!repositories || repositories.length === 0) {
            return reply.status(400).send({
                success: false,
                message: "At least one repository is required",
            });
        }
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.githubAccessToken) {
            return reply.status(404).send({
                success: false,
                message: "GitHub-connected user not found",
            });
        }
        const syncedRepositories = [];
        for (const repo of repositories) {
            // I still attach repos to the authenticated GitHub user, not a manually typed owner.
            const repository = await database_1.prisma.repository.upsert({
                where: { fullName: repo.fullName },
                create: {
                    githubRepoId: repo.githubRepoId,
                    name: repo.name,
                    owner: repo.owner,
                    fullName: repo.fullName,
                    description: repo.description,
                    defaultBranch: repo.defaultBranch,
                    userId: user.id,
                },
                update: {
                    githubRepoId: repo.githubRepoId,
                    name: repo.name,
                    owner: repo.owner,
                    description: repo.description,
                    defaultBranch: repo.defaultBranch,
                    userId: user.id,
                },
            });
            syncedRepositories.push(repository);
        }
        return {
            success: true,
            message: "Selected GitHub repositories imported successfully",
            data: {
                importedCount: syncedRepositories.length,
                repositories: syncedRepositories,
            },
        };
    });
    app.get("/users/:userId/repositories/tracked", async (request, reply) => {
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
        const repositories = await database_1.prisma.repository.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
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
        return {
            success: true,
            message: "Tracked repositories fetched successfully",
            data: repositories,
        };
    });
    app.patch("/users/:userId/repositories/:repositoryId/untrack", async (request, reply) => {
        const { userId, repositoryId } = request.params;
        const repository = await database_1.prisma.repository.findFirst({
            where: {
                id: repositoryId,
                userId,
            },
        });
        if (!repository) {
            return reply.status(404).send({
                success: false,
                message: "Tracked repository not found for this user",
            });
        }
        // I detach the repo instead of deleting it so historical events/timeline data can remain available later.
        const updatedRepository = await database_1.prisma.repository.update({
            where: { id: repositoryId },
            data: { userId: null },
        });
        return {
            success: true,
            message: "Repository untracked successfully",
            data: updatedRepository,
        };
    });
    app.patch("/users/:userId/repositories/retrack", async (request, reply) => {
        const { userId } = request.params;
        const { fullName } = request.body;
        if (!fullName) {
            return reply.status(400).send({
                success: false,
                message: "fullName is required",
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
        const repository = await database_1.prisma.repository.findUnique({
            where: { fullName },
        });
        if (!repository) {
            return reply.status(404).send({
                success: false,
                message: "Repository does not exist in ArcHive yet. Import it first.",
            });
        }
        const updatedRepository = await database_1.prisma.repository.update({
            where: { id: repository.id },
            data: { userId },
        });
        return {
            success: true,
            message: "Repository retracked successfully",
            data: updatedRepository,
        };
    });
};
exports.githubSyncRoutes = githubSyncRoutes;
//# sourceMappingURL=github-sync.routes.js.map
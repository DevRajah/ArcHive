import { FastifyInstance } from "fastify";
import { prisma } from "@archive/database";
import axios from "axios";

type SyncRepositoryBody = {
    userId?: string;
    githubRepoId?: string;
    name: string;
    owner: string;
    fullName: string;
    description?: string;
    defaultBranch?: string;
};

export const githubSyncRoutes = async (app: FastifyInstance) => {
    app.post("/repositories/sync", async (request, reply) => {
        const {
            userId,
            githubRepoId,
            name,
            owner,
            fullName,
            description,
            defaultBranch,
        } = request.body as SyncRepositoryBody;

        if (!name || !owner || !fullName) {
            return reply.status(400).send({
                success: false,
                message: "name, owner and fullName are required",
            });
        }

        // I use upsert because syncing should create a repo if it is new,
        // but update it if ArcHive already knows about it.
        const repository = await prisma.repository.upsert({
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
        const { userId } = request.params as { userId: string };

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.githubAccessToken) {
            return reply.status(404).send({
                success: false,
                message: "GitHub-connected user not found",
            });
        }

        const githubReposResponse = await axios.get("https://api.github.com/user/repos", {
            headers: {
                Authorization: `Bearer ${user.githubAccessToken}`,
                Accept: "application/vnd.github+json",
            },
            params: {
                per_page: 100,
                sort: "updated",
            },
        });

        const githubRepos = githubReposResponse.data as Array<{
            id: number;
            name: string;
            full_name: string;
            description: string | null;
            default_branch: string;
            owner: {
                login: string;
            };
        }>;

        const syncedRepositories = [];

        for (const repo of githubRepos) {
            const repository = await prisma.repository.upsert({
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
        const { userId } = request.params as { userId: string };

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.githubAccessToken) {
            return reply.status(404).send({
                success: false,
                message: "GitHub-connected user not found",
            });
        }

        const githubReposResponse = await axios.get("https://api.github.com/user/repos", {
            headers: {
                Authorization: `Bearer ${user.githubAccessToken}`,
                Accept: "application/vnd.github+json",
            },
            params: {
                per_page: 100,
                sort: "updated",
            },
        });

        const repos = githubReposResponse.data as Array<{
            id: number;
            name: string;
            full_name: string;
            description: string | null;
            default_branch: string;
            private: boolean;
            owner: {
                login: string;
            };
        }>;

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
        const { userId } = request.params as { userId: string };
        const { repositories } = request.body as {
            repositories?: Array<{
                githubRepoId: string;
                name: string;
                owner: string;
                fullName: string;
                description?: string | null;
                defaultBranch: string;
            }>;
        };

        if (!repositories || repositories.length === 0) {
            return reply.status(400).send({
                success: false,
                message: "At least one repository is required",
            });
        }

        const user = await prisma.user.findUnique({
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
            const repository = await prisma.repository.upsert({
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
        const { userId } = request.params as { userId: string };

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return reply.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        const repositories = await prisma.repository.findMany({
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
        const { userId, repositoryId } = request.params as {
            userId: string;
            repositoryId: string;
        };

        const repository = await prisma.repository.findFirst({
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
        const updatedRepository = await prisma.repository.update({
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
        const { userId } = request.params as { userId: string };
        const { fullName } = request.body as { fullName?: string };

        if (!fullName) {
            return reply.status(400).send({
                success: false,
                message: "fullName is required",
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return reply.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        const repository = await prisma.repository.findUnique({
            where: { fullName },
        });

        if (!repository) {
            return reply.status(404).send({
                success: false,
                message: "Repository does not exist in ArcHive yet. Import it first.",
            });
        }

        const updatedRepository = await prisma.repository.update({
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
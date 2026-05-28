import { FastifyInstance } from "fastify";
import { prisma } from "@archive/database";

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
};
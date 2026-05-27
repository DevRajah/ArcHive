import { FastifyInstance } from "fastify";
import { prisma } from "@archive/database";

type CreateRepositoryBody = {
  name: string;
  owner: string;
  fullName: string;
  description?: string;
  defaultBranch?: string;
};

export const repositoryRoutes = async (app: FastifyInstance) => {
  app.post<{ Body: CreateRepositoryBody }>("/", async (request, reply) => {
    const { name, owner, fullName, description, defaultBranch } = request.body;

    if (!name || !owner || !fullName) {
      return reply.status(400).send({
        success: false,
        message: "name, owner and fullName are required",
      });
    }

    const existingRepository = await prisma.repository.findUnique({
      where: { fullName },
    });

    if (existingRepository) {
      return reply.status(409).send({
        success: false,
        message: "Repository already exists",
      });
    }

    const repository = await prisma.repository.create({
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
    const repositories = await prisma.repository.findMany({
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

  app.get<{ Params: { repositoryId: string } }>("/:repositoryId", async (request, reply) => {
  const { repositoryId } = request.params;

  const repository = await prisma.repository.findUnique({
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
};
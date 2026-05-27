import { FastifyInstance } from "fastify";
import { prisma } from "@archive/database";

type CreateArchitectureChangeBody = {
  changeType: string;
  detectedTechnology?: string;
  fileAffected?: string;
  summary: string;
};

export const architectureChangeRoutes = async (app: FastifyInstance) => {
  app.post<{ Params: { repositoryId: string }; Body: CreateArchitectureChangeBody }>(
    "/:repositoryId/architecture-changes",
    async (request, reply) => {
      const { repositoryId } = request.params;
      const { changeType, detectedTechnology, fileAffected, summary } = request.body;

      if (!changeType || !summary) {
        return reply.status(400).send({
          success: false,
          message: "changeType and summary are required",
        });
      }

      // I check the repository first so we do not create architecture history for a project ArcHive does not know.
      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId },
      });

      if (!repository) {
        return reply.status(404).send({
          success: false,
          message: "Repository not found",
        });
      }

      const architectureChange = await prisma.architectureChange.create({
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
    }
  );

  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/architecture-changes",
    async (request, reply) => {
      const { repositoryId } = request.params;

      // Same safety check here: a wrong repository ID should return 404, not an empty misleading list.
      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId },
      });

      if (!repository) {
        return reply.status(404).send({
          success: false,
          message: "Repository not found",
        });
      }

      const architectureChanges = await prisma.architectureChange.findMany({
        where: { repositoryId },
        orderBy: { createdAt: "desc" },
      });

      return {
        success: true,
        message: "Architecture changes fetched successfully",
        data: architectureChanges,
      };
    }
  );
};
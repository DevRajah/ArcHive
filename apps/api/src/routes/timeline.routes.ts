import { FastifyInstance } from "fastify";
import { prisma } from "@archive/database";

type CreateTimelineEntryBody = {
  relatedEventId?: string;
  title: string;
  summary: string;
  importanceScore?: number;
  generatedByAI?: boolean;
};

export const timelineRoutes = async (app: FastifyInstance) => {
  app.post<{ Params: { repositoryId: string }; Body: CreateTimelineEntryBody }>(
    "/:repositoryId/timeline",
    async (request, reply) => {
      const { repositoryId } = request.params;
      const {
        relatedEventId,
        title,
        summary,
        importanceScore,
        generatedByAI,
      } = request.body;

      if (!title || !summary) {
        return reply.status(400).send({
          success: false,
          message: "title and summary are required",
        });
      }

      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId },
      });

      if (!repository) {
        return reply.status(404).send({
          success: false,
          message: "Repository not found",
        });
      }

      if (relatedEventId) {
        const event = await prisma.engineeringEvent.findFirst({
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

      const timelineEntry = await prisma.timelineEntry.create({
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
    }
  );

  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/timeline",
    async (request, reply) => {
      const { repositoryId } = request.params;

      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId },
      });

      if (!repository) {
        return reply.status(404).send({
          success: false,
          message: "Repository not found",
        });
      }

      const timeline = await prisma.timelineEntry.findMany({
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
    }
  );
};
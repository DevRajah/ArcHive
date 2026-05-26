import { FastifyInstance } from "fastify";
import { prisma } from "@archive/database";
import { EngineeringEventType } from "@prisma/client";

type CreateEngineeringEventBody = {
  eventType: EngineeringEventType;
  source?: string;
  rawPayload: Record<string, unknown>;
  occurredAt?: string;
};

export const engineeringEventRoutes = async (app: FastifyInstance) => {
  app.post<{ Params: { repositoryId: string }; Body: CreateEngineeringEventBody }>(
    "/:repositoryId/events",
    async (request, reply) => {
      const { repositoryId } = request.params;
      const { eventType, source, rawPayload, occurredAt } = request.body;

      if (!eventType || !rawPayload) {
        return reply.status(400).send({
          success: false,
          message: "eventType and rawPayload are required",
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

      const event = await prisma.engineeringEvent.create({
        data: {
          repositoryId,
          eventType,
          source: source || "manual",
          rawPayload,
          occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
        },
      });

      return reply.status(201).send({
        success: true,
        message: "Engineering event created successfully",
        data: event,
      });
    }
  );

  app.get<{ Params: { repositoryId: string } }>(
    "/:repositoryId/events",
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

      const events = await prisma.engineeringEvent.findMany({
        where: { repositoryId },
        orderBy: { occurredAt: "desc" },
      });

      return {
        success: true,
        message: "Engineering events fetched successfully",
        data: events,
      };
    }
  );
};
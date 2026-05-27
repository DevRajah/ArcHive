import { FastifyInstance } from "fastify";
import { prisma } from "@archive/database";
import { EngineeringEventType } from "@prisma/client";
import { engineeringEventQueue } from "@archive/queue";

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

      // I queue the heavy processing instead of creating timeline entries inside the API request.
      // This keeps the API fast and lets the worker handle retries safely.
      await engineeringEventQueue.add(
        "process-engineering-event",
        {
          eventId: event.id,
          repositoryId: event.repositoryId,
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 3000,
          },
          removeOnComplete: 100,
          removeOnFail: 500,
        }
      );

      return reply.status(201).send({
        success: true,
        message: "Engineering event created and queued for processing",
        data: {
          event,
          queued: true,
        },
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
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

// This is ArcHive's first intelligence layer.
// For now, we generate simple timeline entries from event types.
// Later, the worker + AI layer will make this much smarter.
const timelineTemplateMap: Partial<
  Record<EngineeringEventType, { title: string; summary: string; importanceScore: number }>
> = {
  QUEUE_ADDED: {
    title: "Queue-based processing introduced",
    summary:
      "The repository introduced queue-based background processing, improving how long-running or asynchronous tasks are handled.",
    importanceScore: 5,
  },
  REDIS_ADDED: {
    title: "Redis infrastructure added",
    summary:
      "Redis was introduced, likely to support caching, queues, sessions, rate limiting, or real-time infrastructure.",
    importanceScore: 4,
  },
  DOCKER_ADDED: {
    title: "Docker support introduced",
    summary:
      "Docker configuration was added to improve local development, deployment consistency, and environment portability.",
    importanceScore: 4,
  },
  DATABASE_CHANGE: {
    title: "Database architecture changed",
    summary:
      "The repository recorded a database-related change, which may affect persistence, schema design, or data access patterns.",
    importanceScore: 4,
  },
};

const timelineTemplate = timelineTemplateMap[eventType];

let timelineEntry = null;

if (timelineTemplate) {
  timelineEntry = await prisma.timelineEntry.create({
    data: {
      repositoryId,
      relatedEventId: event.id,
      title: timelineTemplate.title,
      summary: timelineTemplate.summary,
      importanceScore: timelineTemplate.importanceScore,
      generatedByAI: false,
    },
  });
}

return reply.status(201).send({
  success: true,
  message: "Engineering event created successfully",
  data: {
    event,
    timelineEntry,
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
import { FastifyInstance } from "fastify";
import { prisma } from "@archive/database";
import { engineeringEventQueue } from "@archive/queue";
import { classifyEngineeringEventForDashboard } from "../utils/engineering-event-classifier";

const QUEUE_NAME = "engineering-event-processing";

const getJobStatus = (job: {
  finishedOn?: number;
  processedOn?: number;
  failedReason?: string;
}) => {
  if (job.failedReason) return "failed";
  if (job.finishedOn) return "processed";
  if (job.processedOn) return "active";
  return "waiting";
};

export const queueRoutes = async (app: FastifyInstance) => {
  app.get("/metrics", async () => {
    const counts = await engineeringEventQueue.getJobCounts(
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed"
    );

    return {
      success: true,
      message: "Queue metrics fetched successfully",
      data: {
        queueName: QUEUE_NAME,
        counts,
      },
    };
  });

  app.get("/recent-jobs", async () => {
    const jobs = await engineeringEventQueue.getJobs(
      ["waiting", "active", "completed", "failed", "delayed"],
      0,
      50,
      true
    );

    const mappedJobs = await Promise.all(
      jobs.map(async (job) => {
        const eventId = job.data?.eventId as string | undefined;
        const repositoryId = job.data?.repositoryId as string | undefined;

        const event = eventId
          ? await prisma.engineeringEvent.findUnique({
              where: { id: eventId },
              select: {
                id: true,
                eventType: true,
                rawPayload: true,
                repository: {
                  select: {
                    id: true,
                    name: true,
                    fullName: true,
                  },
                },
              },
            })
          : null;

        const repository = event?.repository
          ? event.repository
          : repositoryId
            ? await prisma.repository.findUnique({
                where: { id: repositoryId },
                select: {
                  id: true,
                  name: true,
                  fullName: true,
                },
              })
            : null;

        const classification = classifyEngineeringEventForDashboard({
          rawEventType: event?.eventType,
          rawPayload: event?.rawPayload as Record<string, any> | undefined,
          repositoryName: repository?.name || "Repository",
        });

        return {
          id: job.id,
          name: job.name,
          status: getJobStatus({
            finishedOn: job.finishedOn,
            processedOn: job.processedOn,
            failedReason: job.failedReason,
          }),
          attemptsMade: job.attemptsMade,
          failedReason: job.failedReason,
          timestamp: job.timestamp,
          processedOn: job.processedOn,
          finishedOn: job.finishedOn,
          queueName: QUEUE_NAME,

          data: {
            eventId,
            repositoryId,

            repositoryName: repository?.name || null,
            repositoryFullName: repository?.fullName || null,

            eventType: classification.eventType,
            eventTitle: classification.title,
          },
        };
      })
    );

    const recentJobs = mappedJobs
      // I sort again after enrichment so the dashboard always receives newest jobs first.
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    return {
      success: true,
      message: "Recent queue jobs fetched successfully",
      data: recentJobs,
    };
  });
};
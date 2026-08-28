import {
  FastifyInstance,
  FastifyReply,
} from "fastify";
import { prisma } from "@archive/database";

import {
  getRepositoryTimeline,
  getRepositoryTimelineSummary,
  refreshRepositoryTimeline,
  TimelineRepositoryNotFoundError,
} from "../services/timeline.service";

import type {
  TimelineEventType,
  TimelineSeverity,
  TimelineSortOrder,
} from "../types/timeline.types";

type RepositoryParams = {
  repositoryId: string;
};

type CreateTimelineEntryBody = {
  relatedEventId?: string;

  title: string;

  summary: string;

  importanceScore?: number;

  generatedByAI?: boolean;
};

type TimelineQuery = {
  page?: string;

  limit?: string;

  type?: TimelineEventType;

  severity?: TimelineSeverity;

  search?: string;

  from?: string;

  to?: string;

  sort?: "timestamp";

  order?: TimelineSortOrder;
};

/*
|--------------------------------------------------------------------------
| Query parsing
|--------------------------------------------------------------------------
*/

const parsePositiveInteger = (
  value: string | undefined,
  fallback: number,
): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (
    !Number.isFinite(parsed) ||
    parsed < 1
  ) {
    return fallback;
  }

  return parsed;
};

const supportedEventTypes: TimelineEventType[] = [
  "ENGINEERING_EVENT",
  "ARCHITECTURE_CHANGE",
  "INTELLIGENCE_SNAPSHOT",
  "ARCHITECTURE_ADVISOR",
  "HEALTH_TREND",
  "TIMELINE_ENTRY",
];

const supportedSeverities: TimelineSeverity[] = [
  "INFO",
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

const isSupportedEventType = (
  value: unknown,
): value is TimelineEventType => {
  return supportedEventTypes.includes(
    value as TimelineEventType,
  );
};

const isSupportedSeverity = (
  value: unknown,
): value is TimelineSeverity => {
  return supportedSeverities.includes(
    value as TimelineSeverity,
  );
};

const buildTimelineOptions = (
  query: TimelineQuery,
) => {
  return {
    page: parsePositiveInteger(
      query.page,
      1,
    ),

    limit: Math.min(
      parsePositiveInteger(
        query.limit,
        25,
      ),
      100,
    ),

    type: isSupportedEventType(query.type)
      ? query.type
      : undefined,

    severity: isSupportedSeverity(
      query.severity,
    )
      ? query.severity
      : undefined,

    search:
      query.search?.trim() || undefined,

    from:
      query.from?.trim() || undefined,

    to:
      query.to?.trim() || undefined,

    order:
      query.order === "asc"
        ? "asc"
        : "desc",
  } as const;
};

const sendTimelineError = (
  error: unknown,
  reply: FastifyReply,
) => {
  if (
    error instanceof
    TimelineRepositoryNotFoundError
  ) {
    return reply.status(404).send({
      success: false,
      message: "Repository not found",
    });
  }

  throw error;
};

export const timelineRoutes = async (
  app: FastifyInstance,
) => {
  /*
  |--------------------------------------------------------------------------
  | Create a manual Timeline entry
  |--------------------------------------------------------------------------
  |
  | Existing endpoint retained for internal tools, workers, AI-generated
  | summaries, or future administrative actions.
  |
  | POST /api/repositories/:repositoryId/timeline
  |--------------------------------------------------------------------------
  */

  app.post<{
    Params: RepositoryParams;
    Body: CreateTimelineEntryBody;
  }>(
    "/:repositoryId/timeline",
    async (request, reply) => {
      const { repositoryId } =
        request.params;

      const {
        relatedEventId,
        title,
        summary,
        importanceScore,
        generatedByAI,
      } = request.body;

      if (
        !title?.trim() ||
        !summary?.trim()
      ) {
        return reply.status(400).send({
          success: false,
          message:
            "title and summary are required",
        });
      }

      const repository =
        await prisma.repository.findUnique({
          where: {
            id: repositoryId,
          },
        });

      if (!repository) {
        return reply.status(404).send({
          success: false,
          message: "Repository not found",
        });
      }

      if (relatedEventId) {
        const event =
          await prisma.engineeringEvent.findFirst(
            {
              where: {
                id: relatedEventId,
                repositoryId,
              },
            },
          );

        if (!event) {
          return reply
            .status(404)
            .send({
              success: false,
              message:
                "Related engineering event not found for this repository",
            });
        }
      }

      const timelineEntry =
        await prisma.timelineEntry.create({
          data: {
            repositoryId,

            relatedEventId,

            title: title.trim(),

            summary: summary.trim(),

            /*
            | Use ?? rather than || so a deliberate value of 0 is not silently
            | replaced. We still clamp the accepted value to a safe range.
            */
            importanceScore: Math.min(
              10,
              Math.max(
                1,
                importanceScore ?? 1,
              ),
            ),

            generatedByAI:
              generatedByAI ?? false,
          },
        });

      return reply.status(201).send({
        success: true,
        message:
          "Timeline entry created successfully",
        data: timelineEntry,
      });
    },
  );

  /*
  |--------------------------------------------------------------------------
  | Get the unified Repository Timeline
  |--------------------------------------------------------------------------
  |
  | GET /api/repositories/:repositoryId/timeline
  |
  | Supported query parameters:
  |
  | page=1
  | limit=25
  | type=ENGINEERING_EVENT
  | severity=HIGH
  | search=redis
  | from=2026-07-01
  | to=2026-07-31
  | sort=timestamp
  | order=desc
  |--------------------------------------------------------------------------
  */

  app.get<{
    Params: RepositoryParams;
    Querystring: TimelineQuery;
  }>(
    "/:repositoryId/timeline",
    async (request, reply) => {
      const { repositoryId } =
        request.params;

      const options =
        buildTimelineOptions(
          request.query,
        );

      try {
        const timeline =
          await getRepositoryTimeline(
            repositoryId,
            options,
          );

        return reply.send({
          success: true,
          message:
            "Timeline fetched successfully",
          data: timeline,
        });
      } catch (error) {
        return sendTimelineError(
          error,
          reply,
        );
      }
    },
  );

  /*
  |--------------------------------------------------------------------------
  | Get Timeline summary only
  |--------------------------------------------------------------------------
  |
  | GET /api/repositories/:repositoryId/timeline/summary
  |--------------------------------------------------------------------------
  */

  app.get<{
    Params: RepositoryParams;
  }>(
    "/:repositoryId/timeline/summary",
    async (request, reply) => {
      const { repositoryId } =
        request.params;

      try {
        const summary =
          await getRepositoryTimelineSummary(
            repositoryId,
          );

        return reply.send({
          success: true,
          message:
            "Timeline summary fetched successfully",
          data: summary,
        });
      } catch (error) {
        return sendTimelineError(
          error,
          reply,
        );
      }
    },
  );

  /*
  |--------------------------------------------------------------------------
  | Refresh the unified Timeline
  |--------------------------------------------------------------------------
  |
  | POST /api/repositories/:repositoryId/timeline/refresh
  |
  | Refresh rebuilds the response from the latest evidence stored in the
  | repository's source tables. It does not create duplicate database rows.
  |--------------------------------------------------------------------------
  */

  app.post<{
    Params: RepositoryParams;
    Querystring: TimelineQuery;
  }>(
    "/:repositoryId/timeline/refresh",
    async (request, reply) => {
      const { repositoryId } =
        request.params;

      const options =
        buildTimelineOptions(
          request.query,
        );

      try {
        const timeline =
          await refreshRepositoryTimeline(
            repositoryId,
            options,
          );

        return reply.send({
          success: true,
          message:
            "Timeline refreshed successfully",
          data: timeline,
        });
      } catch (error) {
        return sendTimelineError(
          error,
          reply,
        );
      }
    },
  );
};
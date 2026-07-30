import { FastifyReply, FastifyRequest } from "fastify";

import { createReport } from "../services/reports/report.service";

/**
 * POST /api/reports/generate
 */
export async function generateReport(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = request.body as {
    userId: string;
    title: string;
    description?: string;
  };

  const response = await createReport(body);

  return reply.status(202).send(response);
}
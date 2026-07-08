import { FastifyReply } from "fastify";

export function successResponse<T>(
  reply: FastifyReply,
  message: string,
  data: T
) {
  return reply.send({
    success: true,
    message,
    data,
  });
}

export function errorResponse(
  reply: FastifyReply,
  statusCode: number,
  message: string
) {
  return reply.status(statusCode).send({
    success: false,
    message,
  });
}
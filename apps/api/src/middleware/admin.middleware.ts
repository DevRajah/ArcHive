import { FastifyReply, FastifyRequest } from "fastify";
import { isPlatformAdmin } from "../utils/admin";

export async function adminOnly(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as any;

  if (!user) {
    return reply.status(401).send({
      success: false,
      message: "Authentication required.",
    });
  }

  if (!isPlatformAdmin(user.githubUsername)) {
    return reply.status(403).send({
      success: false,
      message: "Administrator access required.",
    });
  }
}
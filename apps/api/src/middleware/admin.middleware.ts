import { FastifyReply, FastifyRequest } from "fastify";
import { errorResponse } from "../utils/http-response";
import { isPlatformAdmin } from "../utils/admin";

export async function adminOnly(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = (request as any).user as
    | {
        githubUsername?: string | null;
      }
    | undefined;

  if (!user) {
    return errorResponse(reply, 401, "Authentication required.");
  }

  if (!isPlatformAdmin(user.githubUsername)) {
    return errorResponse(reply, 403, "Administrator access required.");
  }
}
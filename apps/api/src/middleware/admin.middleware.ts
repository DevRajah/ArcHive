import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/http-response";
import { isPlatformAdmin } from "../utils/admin";

type AdminJwtPayload = {
  userId: string;
  username: string;
};

export async function adminOnly(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return errorResponse(reply, 401, "Authentication required.");
  }

  const token = authorization.replace("Bearer ", "").trim();

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-secret"
    ) as AdminJwtPayload;

    if (!decoded?.userId || !decoded?.username) {
      return errorResponse(reply, 401, "Invalid authentication token.");
    }

    if (!isPlatformAdmin(decoded.username)) {
      return errorResponse(reply, 403, "Administrator access required.");
    }

    (request as any).user = decoded;
  } catch {
    return errorResponse(reply, 401, "Invalid or expired authentication token.");
  }
}
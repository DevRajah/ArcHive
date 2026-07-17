import { FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

export type AuthenticatedUser = {
  userId: string;
  username: string;
};

type AuthenticationResult =
  | {
      authenticated: true;
      user: AuthenticatedUser;
    }
  | {
      authenticated: false;
      reason: "MISSING_TOKEN" | "INVALID_TOKEN";
    };

export const getAuthenticatedUser = (
  request: FastifyRequest
): AuthenticationResult => {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return {
      authenticated: false,
      reason: "MISSING_TOKEN",
    };
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    return {
      authenticated: false,
      reason: "MISSING_TOKEN",
    };
  }

  try {
    /*
     * This secret and fallback match the GitHub OAuth token issuer.
     * Both token creation and verification must use the same value.
     */
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-secret"
    ) as Partial<AuthenticatedUser>;

    if (!payload.userId || !payload.username) {
      return {
        authenticated: false,
        reason: "INVALID_TOKEN",
      };
    }

    return {
      authenticated: true,
      user: {
        userId: payload.userId,
        username: payload.username,
      },
    };
  } catch {
    return {
      authenticated: false,
      reason: "INVALID_TOKEN",
    };
  }
};
import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectRateLimitingTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "rate limit",
      "ratelimit",
      "express-rate-limit",
      "fastify-rate-limit",
      "throttle",
    ])
  ) {
    context.addTechnology(
      "Rate Limiting",
      "Detected request rate limiting.",
      20,
      "MEDIUM"
    );
  }
};
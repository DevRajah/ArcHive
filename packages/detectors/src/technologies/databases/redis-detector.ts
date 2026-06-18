import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectRedisTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "redis",
      "ioredis",
      "upstash",
      "redis_url",
      "cache ttl",
    ])
  ) {
    context.addTechnology(
      "Redis",
      "Detected Redis caching, queue, or key-value infrastructure.",
      20,
      "STRONG"
    );
  }
};
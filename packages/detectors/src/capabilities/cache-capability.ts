import { includesAny } from "../evidence/evidence-utils";
import { CapabilityContext } from "./types";

export const detectCacheCapability = (context: CapabilityContext) => {
  const {
  evidenceContext,
  addCapability,
} = context;

const {
  combinedText,
} = evidenceContext;

  if (
    includesAny(combinedText, [
      "redis",
      "memcached",
      "cache",
      "ttl",
      "cache invalidation",
      "eviction",
    ])
  ) {
    addCapability(
      "CACHE_INFRASTRUCTURE",
      85,
      "Repository contains caching or key-value infrastructure signals."
    );
  }
};
type InfrastructureDepthLevel =
  | "EARLY"
  | "MEDIUM"
  | "HIGH";

const INFRASTRUCTURE_CAPABILITY_KEYS = [
  "API_LAYER",
  "DATABASE_LAYER",
  "CACHE_INFRASTRUCTURE",
  "QUEUE_INFRASTRUCTURE",
  "REALTIME_SYSTEMS",
  "DEVOPS_INFRASTRUCTURE",
] as const;

/**
 * Measures how broadly a repository spans ArcHive's canonical
 * infrastructure capabilities.
 *
 * Future me:
 * This is intentionally a breadth score.
 *
 * It does not measure repository maturity, code quality, security,
 * production readiness, or complexity.
 */
export const calculateInfrastructureDepth = (
  capabilityKeys: Set<string>
): {
  score: number;
  level: InfrastructureDepthLevel;
  detected: string[];
  totalPossible: number;
} => {
  const detected =
    INFRASTRUCTURE_CAPABILITY_KEYS.filter(
      (key) => capabilityKeys.has(key)
    );

  const score = Math.round(
    (detected.length /
      INFRASTRUCTURE_CAPABILITY_KEYS.length) *
      100
  );

  const level: InfrastructureDepthLevel =
    score >= 70
      ? "HIGH"
      : score >= 40
        ? "MEDIUM"
        : "EARLY";

  return {
    score,
    level,
    detected: [...detected],
    totalPossible:
      INFRASTRUCTURE_CAPABILITY_KEYS.length,
  };
};
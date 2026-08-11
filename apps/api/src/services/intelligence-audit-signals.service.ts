import { Prisma } from "@prisma/client";

/**
 * Read a JSON value that should contain an array of strings.
 *
 * Future me:
 * RepositoryIntelligenceSnapshot stores canonical signal collections as
 * JSON arrays. Keep them as arrays throughout the read path.
 *
 * Do NOT convert these values to comma-separated strings and do not try to
 * reconstruct logical boundaries from arbitrary prose.
 */
export const readAuditStringArray = (
  value: Prisma.JsonValue
): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }

    const normalized = item.trim();

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(normalized);
  }

  return result;
};

/**
 * Extract canonical reasoning signals from the immutable intelligence
 * snapshot.
 *
 * Logical boundaries have already been established by the detector pipeline,
 * where reasoningSignals is string[].
 *
 * A signal such as:
 *
 * "Detected PostgreSQL, Prisma, and migration infrastructure"
 *
 * must remain ONE signal. We therefore never split on commas or another
 * punctuation character here.
 */
export const readAuditReasoningSignals = (
  intelligence: Prisma.JsonValue
): string[] => {
  if (
    !intelligence ||
    typeof intelligence !== "object" ||
    Array.isArray(intelligence)
  ) {
    return [];
  }

  const intelligenceRecord =
    intelligence as Record<string, unknown>;

  const signals =
    intelligenceRecord.signals;

  if (
    !signals ||
    typeof signals !== "object" ||
    Array.isArray(signals)
  ) {
    return [];
  }

  const signalRecord =
    signals as Record<string, unknown>;

  const reasoningSignals =
    signalRecord.reasoningSignals;

  if (!Array.isArray(reasoningSignals)) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of reasoningSignals) {
    if (typeof item !== "string") {
      continue;
    }

    const normalized = item.trim();

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(normalized);
  }

  return result;
};
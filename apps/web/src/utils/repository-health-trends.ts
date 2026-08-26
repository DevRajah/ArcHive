import type {
  RepositoryHealthChangeDirection,
  RepositoryHealthDirection,
  RepositoryHealthMetric,
  RepositoryHealthRiskLevel,
} from "@/types/repository-health-trends.types";

/**
 * Normalise a real health/risk score without destroying unavailable state.
 *
 * Important semantics:
 *
 * 0    = a legitimate measured score
 * null = the score is unavailable / not assessed
 *
 * Never turn null or undefined into zero.
 */
export function normalizeHealthScore(
  value: number,
): number;

export function normalizeHealthScore(
  value: null | undefined,
): null;

export function normalizeHealthScore(
  value: number | null | undefined,
): number | null;

export function normalizeHealthScore(
  value: number | null | undefined,
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  const normalized =
    Math.abs(value) <= 1
      ? value * 100
      : value;

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(normalized),
    ),
  );
}

export function normalizeHealthDelta(
  value: number | null | undefined,
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  const normalized =
    Math.abs(value) <= 1
      ? value * 100
      : value;

  return Number(
    normalized.toFixed(1),
  );
}

export function formatHealthDate(
  value: string | null | undefined,
) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "long",
      timeStyle: "short",
    },
  ).format(date);
}

export function formatCompactHealthDate(
  value: string | null | undefined,
) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

export function getHealthDirectionLabel(
  direction:
    | RepositoryHealthDirection
    | RepositoryHealthChangeDirection
    | string
    | null
    | undefined,
) {
  switch (
    direction?.toUpperCase()
  ) {
    case "IMPROVING":
    case "IMPROVED":
    case "INCREASED":
      return "Improving";

    case "DECLINING":
    case "DECLINED":
    case "DECREASED":
      return "Declining";

    case "STABLE":
    case "UNCHANGED":
      return "Stable";

    default:
      return "Unknown";
  }
}

export function getRiskLevelLabel(
  riskLevel:
    | RepositoryHealthRiskLevel
    | string
    | null
    | undefined,
) {
  switch (
    riskLevel?.toUpperCase()
  ) {
    case "CRITICAL":
      return "Critical Risk";

    case "HIGH":
      return "High Risk";

    case "MEDIUM":
      return "Medium Risk";

    case "LOW":
      return "Low Risk";

    case "UNASSESSED":
      return "Not Assessed";

    default:
      return "Risk Unknown";
  }
}

/**
 * Build a metric only from values that actually exist.
 *
 * Missing score remains null.
 * Missing previous score remains null.
 *
 * We only calculate our own delta when both current and previous
 * scores are genuinely available.
 */
export function createFallbackMetric(
  score: number | null | undefined,
  previousScore?: number | null,
  delta?: number | null,
): RepositoryHealthMetric {
  const normalizedScore =
    normalizeHealthScore(score);

  const normalizedPrevious =
    normalizeHealthScore(
      previousScore,
    );

  const resolvedDelta =
    delta !== null &&
    delta !== undefined
      ? normalizeHealthDelta(delta)
      : normalizedScore !== null &&
          normalizedPrevious !== null
        ? normalizedScore -
          normalizedPrevious
        : null;

  return {
    score: normalizedScore,
    previousScore:
      normalizedPrevious,
    delta: resolvedDelta,
  };
}

export function getSnapshotDate(
  snapshot: {
    recordedAt?: string;
    generatedAt?: string;
    createdAt?: string;
    capturedAt?: string;
  },
) {
  return (
    snapshot.recordedAt ??
    snapshot.generatedAt ??
    snapshot.createdAt ??
    snapshot.capturedAt ??
    new Date().toISOString()
  );
}
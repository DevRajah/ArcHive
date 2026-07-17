import { Prisma } from "@prisma/client";

import type {
  IntelligenceDiffDirection,
  IntelligenceScoreChange,
  IntelligenceSignalChange,
} from "../types/intelligence-diff.types";

type SnapshotComparableValues = {
  repositoryTypes: string[];
  technologies: string[];
  architectureDomains: string[];
  capabilities: string[];

  confidenceScore: number | null;
  maturityScore: number | null;
  architectureScore: number | null;
  capabilityScore: number | null;
  engineeringQualityScore: number | null;
  productionReadinessScore: number | null;

  recommendations: RecommendationState[];
};

type RecommendationState = {
  key: string;
  title: string;
  status: string | null;
};

type RecommendationLifecycleChanges = {
  added: string[];
  resolved: string[];
  removed: string[];
};

const normalizeString = (value: string) => value.trim();

const uniqueSorted = (values: string[]) => {
  return Array.from(
    new Set(values.map(normalizeString).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
};

const isRecord = (
  value: unknown
): value is Record<string, unknown> => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
};

const readString = (
  record: Record<string, unknown>,
  keys: string[]
) => {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
};

export const readStringArrayFromJson = (
  value: Prisma.JsonValue
): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return uniqueSorted(
    value.filter(
      (item): item is string => typeof item === "string"
    )
  );
};

export const readCapabilitiesFromJson = (
  value: Prisma.JsonValue
): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const capabilities = value.flatMap((item) => {
    if (typeof item === "string") {
      return [item];
    }

    if (!isRecord(item)) {
      return [];
    }

    const capabilityName = readString(item, [
      "key",
      "name",
      "label",
      "capability",
      "title",
    ]);

    return capabilityName ? [capabilityName] : [];
  });

  return uniqueSorted(capabilities);
};

/*
 * Recommendation reports can evolve without forcing the diff engine to know
 * every report implementation detail. This extractor supports arrays as well
 * as nested report objects and looks for recommendation-shaped records.
 */
export const readRecommendationsFromJson = (
  value: Prisma.JsonValue
): RecommendationState[] => {
  const recommendations = new Map<string, RecommendationState>();

  const visit = (current: unknown) => {
    if (Array.isArray(current)) {
      current.forEach(visit);
      return;
    }

    if (!isRecord(current)) {
      return;
    }

    const title = readString(current, [
      "title",
      "recommendation",
      "label",
    ]);

    const explicitKey = readString(current, [
      "recommendationKey",
      "key",
      "id",
      "code",
    ]);

    const description = readString(current, ["description"]);
    const status = readString(current, ["status"]);

    const resemblesRecommendation =
      Boolean(title) &&
      Boolean(explicitKey || description || status);

    if (resemblesRecommendation && title) {
      const key = explicitKey || title.toLowerCase();

      recommendations.set(key, {
        key,
        title,
        status: status?.toUpperCase() || null,
      });
    }

    Object.values(current).forEach(visit);
  };

  visit(value);

  return Array.from(recommendations.values()).sort((a, b) =>
    a.title.localeCompare(b.title)
  );
};

export const compareStringCollections = (
  previousValues: string[],
  currentValues: string[]
): IntelligenceSignalChange => {
  const previous = new Set(uniqueSorted(previousValues));
  const current = new Set(uniqueSorted(currentValues));

  return {
    added: Array.from(current)
      .filter((value) => !previous.has(value))
      .sort((a, b) => a.localeCompare(b)),

    removed: Array.from(previous)
      .filter((value) => !current.has(value))
      .sort((a, b) => a.localeCompare(b)),

    unchanged: Array.from(current)
      .filter((value) => previous.has(value))
      .sort((a, b) => a.localeCompare(b)),
  };
};

const calculateDirection = (
  previous: number | null,
  current: number | null
): IntelligenceDiffDirection => {
  if (previous === null || current === null) {
    return null;
  }

  if (current > previous) {
    return "UP";
  }

  if (current < previous) {
    return "DOWN";
  }

  return "UNCHANGED";
};

const createScoreSummary = ({
  label,
  previous,
  current,
  direction,
}: {
  label: string;
  previous: number | null;
  current: number | null;
  direction: IntelligenceDiffDirection;
}) => {
  if (previous === null || current === null) {
    return `${label} could not be compared across both snapshots.`;
  }

  if (direction === "UP") {
    return `${label} increased from ${previous} to ${current}.`;
  }

  if (direction === "DOWN") {
    return `${label} decreased from ${previous} to ${current}.`;
  }

  return `${label} remained unchanged at ${current}.`;
};

const createScoreChange = ({
  label,
  previous,
  current,
}: {
  label: string;
  previous: number | null;
  current: number | null;
}): IntelligenceScoreChange | null => {
  /*
   * A score is omitted only when neither snapshot contains a value.
   * This prevents empty placeholder rows from reaching the frontend.
   */
  if (previous === null && current === null) {
    return null;
  }

  const direction = calculateDirection(previous, current);

  return {
    label,
    previous,
    current,
    direction,
    summary: createScoreSummary({
      label,
      previous,
      current,
      direction,
    }),
  };
};

export const compareRecommendations = (
  previousRecommendations: RecommendationState[],
  currentRecommendations: RecommendationState[]
): RecommendationLifecycleChanges => {
  const previousByKey = new Map(
    previousRecommendations.map((recommendation) => [
      recommendation.key,
      recommendation,
    ])
  );

  const currentByKey = new Map(
    currentRecommendations.map((recommendation) => [
      recommendation.key,
      recommendation,
    ])
  );

  const added: string[] = [];
  const resolved: string[] = [];
  const removed: string[] = [];

  for (const [key, current] of currentByKey) {
    const previous = previousByKey.get(key);

    if (!previous) {
      added.push(current.title);
      continue;
    }

    if (
      current.status === "RESOLVED" &&
      previous.status !== "RESOLVED"
    ) {
      resolved.push(current.title);
    }
  }

  for (const [key, previous] of previousByKey) {
    if (!currentByKey.has(key)) {
      removed.push(previous.title);
    }
  }

  return {
    added: uniqueSorted(added),
    resolved: uniqueSorted(resolved),
    removed: uniqueSorted(removed),
  };
};

export const buildSnapshotComparison = ({
  previous,
  current,
}: {
  previous: SnapshotComparableValues;
  current: SnapshotComparableValues;
}) => {
  const signalChanges = {
    technologies: compareStringCollections(
      previous.technologies,
      current.technologies
    ),

    architectureDomains: compareStringCollections(
      previous.architectureDomains,
      current.architectureDomains
    ),

    repositoryTypes: compareStringCollections(
      previous.repositoryTypes,
      current.repositoryTypes
    ),

    capabilities: compareStringCollections(
      previous.capabilities,
      current.capabilities
    ),
  };

  const recommendationChanges = compareRecommendations(
    previous.recommendations,
    current.recommendations
  );

  const possibleScoreChanges = [
    createScoreChange({
      label: "Intelligence confidence",
      previous: previous.confidenceScore,
      current: current.confidenceScore,
    }),

    createScoreChange({
      label: "Maturity score",
      previous: previous.maturityScore,
      current: current.maturityScore,
    }),

    createScoreChange({
      label: "Architecture score",
      previous: previous.architectureScore,
      current: current.architectureScore,
    }),

    createScoreChange({
      label: "Capability score",
      previous: previous.capabilityScore,
      current: current.capabilityScore,
    }),

    createScoreChange({
      label: "Engineering quality",
      previous: previous.engineeringQualityScore,
      current: current.engineeringQualityScore,
    }),

    createScoreChange({
      label: "Production readiness",
      previous: previous.productionReadinessScore,
      current: current.productionReadinessScore,
    }),

    createScoreChange({
      label: "Recommendation count",
      previous: previous.recommendations.length,
      current: current.recommendations.length,
    }),

    createScoreChange({
      label: "Technology count",
      previous: previous.technologies.length,
      current: current.technologies.length,
    }),

    createScoreChange({
      label: "Architecture-domain count",
      previous: previous.architectureDomains.length,
      current: current.architectureDomains.length,
    }),
  ];

  const scoreChanges = possibleScoreChanges.filter(
    (
      change
    ): change is IntelligenceScoreChange => change !== null
  );

  return {
    signalChanges,
    recommendationChanges,
    scoreChanges,
  };
};

export const hasMeaningfulComparisonChanges = ({
  signalChanges,
  recommendationChanges,
  scoreChanges,
}: ReturnType<typeof buildSnapshotComparison>) => {
  const hasSignalChanges = Object.values(signalChanges).some(
    (change) =>
      change.added.length > 0 || change.removed.length > 0
  );

  const hasRecommendationChanges =
    recommendationChanges.added.length > 0 ||
    recommendationChanges.resolved.length > 0 ||
    recommendationChanges.removed.length > 0;

  const hasScoreChanges = scoreChanges.some(
    (change) =>
      change.direction === "UP" || change.direction === "DOWN"
  );

  return (
    hasSignalChanges ||
    hasRecommendationChanges ||
    hasScoreChanges
  );
};
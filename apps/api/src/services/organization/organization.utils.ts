import type { Prisma } from "@prisma/client";
import { prisma } from "@archive/database";

/**
 * This shared include configuration tells Prisma exactly which
 * repository relationships Organization Intelligence needs.
 *
 * Keeping the query and its TypeScript type connected prevents
 * included relationships from incorrectly becoming `never`.
 */
const organizationRepositoryInclude = {
  intelligenceSnapshots: {
    orderBy: {
      createdAt: "desc",
    },
  },

  architectureAdvisorSnapshots: {
    orderBy: {
      generatedAt: "desc",
    },
  },

  engineeringRecommendations: {
    orderBy: {
      createdAt: "desc",
    },
  },

  events: {
    orderBy: {
      occurredAt: "desc",
    },
  },

  architectureChanges: {
    orderBy: {
      createdAt: "desc",
    },
  },

  timelineEntries: {
    orderBy: {
      createdAt: "desc",
    },
  },
} satisfies Prisma.RepositoryInclude;

/**
 * Prisma now generates the complete repository type directly
 * from the same include configuration used by the database query.
 *
 * This means fields such as `events`, `intelligenceSnapshots`,
 * and `architectureAdvisorSnapshots` are correctly typed as arrays.
 */
export type OrganizationRepository =
  Prisma.RepositoryGetPayload<{
    include: typeof organizationRepositoryInclude;
  }>;

/**
 * Loads every tracked repository belonging to one ArcHive user,
 * together with the intelligence required by organization services.
 */
export const loadOrganizationRepositories = async (
  userId: string,
): Promise<OrganizationRepository[]> => {
  if (!userId.trim()) {
    throw new Error(
      "A user ID is required to load organization repositories.",
    );
  }

  return prisma.repository.findMany({
    where: {
      userId,
      isTracked: true,
    },

    include: organizationRepositoryInclude,

    orderBy: {
      name: "asc",
    },
  });
};

/**
 * Returns the newest repository intelligence snapshot.
 *
 * Snapshots were loaded in descending creation order, so index zero
 * is always the newest available record.
 */
export const latestSnapshot = (
  repository: OrganizationRepository,
) => {
  return repository.intelligenceSnapshots[0] ?? null;
};

/**
 * Returns the newest Architecture Advisor snapshot.
 *
 * Advisor snapshots were loaded in descending generation order.
 */
export const latestAdvisor = (
  repository: OrganizationRepository,
) => {
  return repository.architectureAdvisorSnapshots[0] ?? null;
};

/**
 * Calculates an average from a collection of valid scores.
 *
 * Null is returned when no scores exist, allowing the frontend to
 * distinguish missing intelligence from a genuine score of zero.
 */
export const average = (
  values: number[],
): number | null => {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce(
    (sum, value) => sum + value,
    0,
  );

  return Number((total / values.length).toFixed(1));
};

/**
 * Removes null and undefined values from a score collection.
 */
export const collectScores = (
  values: Array<number | null | undefined>,
): number[] => {
  return values.filter(
    (value): value is number =>
      value !== null && value !== undefined,
  );
};

/**
 * Converts an Architecture Advisor risk score into the risk level
 * used by the Organization Dashboard.
 */
export const getRiskLevel = (
  score: number,
): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" => {
  if (score >= 80) {
    return "CRITICAL";
  }

  if (score >= 60) {
    return "HIGH";
  }

  if (score >= 30) {
    return "MEDIUM";
  }

  return "LOW";
};

/**
 * Returns true only when an Architecture Advisor snapshot explicitly says
 * there is enough repository evidence for a reliable risk judgement.
 *
 * Future me:
 * A stored Advisor snapshot is not the same thing as an assessed repository.
 * Missing or malformed evidenceSummary must therefore fail closed.
 */
export const hasSufficientAdvisorRiskEvidence = (
  evidenceSummary: unknown,
): boolean => {
  if (
    !evidenceSummary ||
    typeof evidenceSummary !== "object" ||
    Array.isArray(evidenceSummary)
  ) {
    return false;
  }

  return (
    "evidenceSufficient" in evidenceSummary &&
    evidenceSummary.evidenceSufficient === true
  );
};

/**
 * Converts a repository risk score into a simpler health status.
 *
 * Lower risk represents a healthier repository.
 */
export const getHealthStatus = (
  score: number,
): "HEALTHY" | "WARNING" | "CRITICAL" => {
  if (score < 30) {
    return "HEALTHY";
  }

  if (score < 70) {
    return "WARNING";
  }

  return "CRITICAL";
};
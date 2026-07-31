export interface RepositoryHighlight {
  repositoryId: string | null;
  name: string;
  score: number;
  riskLevel: string | null;
}

export interface RepositoryHighlights {
  strongest: RepositoryHighlight[];
  needsAttention: RepositoryHighlight[];
}

type OrganizationDashboard = Record<string, any>;

const toSafeNumber = (
  value: unknown,
): number => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
};

const normaliseRepository = (
  repository: unknown,
): RepositoryHighlight | null => {
  if (
    !repository ||
    typeof repository !== "object"
  ) {
    return null;
  }

  const record =
    repository as Record<
      string,
      unknown
    >;

  const name =
    record.name ??
    record.repositoryName ??
    record.fullName;

  if (
    typeof name !== "string" ||
    !name.trim()
  ) {
    return null;
  }

  return {
    repositoryId:
      typeof record.id === "string"
        ? record.id
        : typeof record.repositoryId ===
            "string"
          ? record.repositoryId
          : null,

    name: name.trim(),

    score: toSafeNumber(
      record.score ??
        record.healthScore ??
        record.architectureScore ??
        record.overallScore,
    ),

    riskLevel:
      typeof record.riskLevel ===
      "string"
        ? record.riskLevel
        : typeof record.severity ===
            "string"
          ? record.severity
          : null,
  };
};

/**
 * Selects the strongest repositories and those requiring attention.
 */
export const buildRepositoryHighlights = (
  dashboard: OrganizationDashboard,
): RepositoryHighlights => {
  const rankings =
    Array.isArray(
      dashboard.rankings,
    )
      ? dashboard.rankings
      : [];

  const repositories =
    rankings
      .map(
        normaliseRepository,
      )
      .filter(
        (
          repository,
        ): repository is RepositoryHighlight =>
          repository !== null,
      );

  const strongest =
    [...repositories]
      .sort(
        (first, second) =>
          second.score -
          first.score,
      )
      .slice(0, 5);

  const needsAttention =
    [...repositories]
      .sort(
        (first, second) =>
          first.score -
          second.score,
      )
      .slice(0, 5);

  return {
    strongest,
    needsAttention,
  };
};
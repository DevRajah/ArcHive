type SnapshotLike = {
  primaryRepositoryType: string | null;
  repositoryTypes: unknown;
  technologies: unknown;
  architectureDomains: unknown;
  capabilities: unknown;
  intelligence: unknown;
};

type ArchitectureChangeLike = {
  reasoningSignals: string | null;
};

const readStringArray = (
  value: unknown,
): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (item): item is string =>
            typeof item === "string",
        )
        .map((item) =>
          item.trim(),
        )
        .filter(Boolean),
    ),
  );
};

type CanonicalCapability = {
  key: string;
  confidence?: number;
  reason?: string;
};

/**
 * Read structured capability records from persisted JSON safely.
 *
 * Future me:
 * Any capability returned from this helper must have a real string key.
 * Downstream semantic engines rely on capability keys as canonical
 * identifiers and should not need to handle undefined keys.
 */
const readCapabilities = (
  value: unknown,
): CanonicalCapability[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (
        item,
      ): item is Record<string, unknown> =>
        Boolean(
          item &&
          typeof item === "object" &&
          !Array.isArray(item),
        ),
    )
    .filter(
      (item) =>
        typeof item.key === "string" &&
        item.key.trim().length > 0,
    )
    .map((item) => ({
      key:
        (item.key as string).trim(),

      confidence:
        typeof item.confidence === "number"
          ? item.confidence
          : undefined,

      reason:
        typeof item.reason === "string"
          ? item.reason
          : undefined,
    }));
};

/**
 * Returns the latest canonical current-state repository intelligence.
 *
 * Future me:
 * Current repository identity, technologies, domains, capabilities, and
 * engineering signals must come from RepositoryIntelligenceSnapshot.
 *
 * ArchitectureChange is historical evidence. It may still be used as a
 * fallback for old snapshots or for history/evolution context, but it must
 * not redefine current repository truth.
 */
export const extractCanonicalRepositoryIntelligenceSignals = ({
  latestSnapshot,
  architectureChanges = [],
}: {
  latestSnapshot: SnapshotLike;
  architectureChanges?: ArchitectureChangeLike[];
}) => {
  const repositoryIntelligence =
    latestSnapshot.intelligence as any;

  const snapshotRepositoryTypes =
    readStringArray(
      latestSnapshot.repositoryTypes,
    );

  if (
    latestSnapshot.primaryRepositoryType &&
    !snapshotRepositoryTypes.includes(
      latestSnapshot.primaryRepositoryType,
    )
  ) {
    snapshotRepositoryTypes.unshift(
      latestSnapshot.primaryRepositoryType,
    );
  }

  const snapshotTechnologies =
    readStringArray(
      latestSnapshot.technologies,
    );

  const snapshotDomains =
    readStringArray(
      latestSnapshot.architectureDomains,
    );

  const nestedRepositoryTypes =
    readStringArray(
      repositoryIntelligence?.identity
        ?.repositoryTypes,
    );

  const nestedTechnologies =
    readStringArray(
      repositoryIntelligence?.signals
        ?.technologies,
    );

  const nestedDomains =
    readStringArray(
      repositoryIntelligence?.signals
        ?.architectureDomains,
    );

  const nestedEngineeringSignals =
    readStringArray(
      repositoryIntelligence?.signals
        ?.engineeringSignals,
    );

  const nestedReasoningSignals =
    readStringArray(
      repositoryIntelligence?.signals
        ?.reasoningSignals,
    );

  const nestedCapabilities =
    readCapabilities(
      repositoryIntelligence?.signals
        ?.capabilities,
    );

  const snapshotCapabilities =
    readCapabilities(
      latestSnapshot.capabilities,
    );

  const historicalReasoningSignals =
    Array.from(
      new Set(
        architectureChanges
          .flatMap(
            (change) =>
              change.reasoningSignals?.split(
                " | ",
              ) || [],
          )
          .map((signal) =>
            signal.trim(),
          )
          .filter(Boolean),
      ),
    );

  return {
    repositoryTypes:
      nestedRepositoryTypes.length > 0
        ? nestedRepositoryTypes
        : snapshotRepositoryTypes,

    technologies:
      nestedTechnologies.length > 0
        ? nestedTechnologies
        : snapshotTechnologies,

    domains:
      nestedDomains.length > 0
        ? nestedDomains
        : snapshotDomains,

    engineeringSignals:
      nestedEngineeringSignals,

    reasoningSignals:
      nestedReasoningSignals.length > 0
        ? nestedReasoningSignals
        : historicalReasoningSignals,

    capabilities:
      nestedCapabilities.length > 0
        ? nestedCapabilities
        : snapshotCapabilities,

    repositoryIntelligence,
  };
};
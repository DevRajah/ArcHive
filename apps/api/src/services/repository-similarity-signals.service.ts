type SnapshotLike = {
  primaryRepositoryType: string | null;
  repositoryTypes: unknown;
  architectureDomains: unknown;
  technologies: unknown;
  capabilities: unknown;
};

const readStringArray = (
  value: unknown
): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (
            item
          ): item is string =>
            typeof item === "string"
        )
        .map((item) =>
          item.trim()
        )
        .filter(Boolean)
    )
  );
};

const readCapabilityKeys = (
  value: unknown
): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const keys = value
    .map((capability) => {
      if (
        !capability ||
        typeof capability !== "object" ||
        Array.isArray(capability)
      ) {
        return null;
      }

      const record =
        capability as Record<
          string,
          unknown
        >;

      return typeof record.key ===
        "string"
        ? record.key.trim()
        : null;
    })
    .filter(
      (
        key
      ): key is string =>
        Boolean(key)
    );

  return Array.from(
    new Set(keys)
  );
};

/**
 * Convert the latest canonical intelligence snapshot into the compact
 * structural signal model used by repository-to-repository analysis.
 *
 * Future me:
 * This helper should be reused by Related Repositories and Repository Compare.
 * Do not let those endpoints independently reconstruct current intelligence
 * from ArchitectureChange rows.
 */
export const extractCanonicalRepositorySignals = (
  snapshot: SnapshotLike
) => {
  const repositoryTypes =
    readStringArray(
      snapshot.repositoryTypes
    );

  if (
    snapshot.primaryRepositoryType &&
    !repositoryTypes.includes(
      snapshot.primaryRepositoryType
    )
  ) {
    repositoryTypes.unshift(
      snapshot.primaryRepositoryType
    );
  }

  return {
    repositoryTypes,

    domains:
      readStringArray(
        snapshot.architectureDomains
      ),

    technologies:
      readStringArray(
        snapshot.technologies
      ),

    capabilities:
      readCapabilityKeys(
        snapshot.capabilities
      ),
  };
};
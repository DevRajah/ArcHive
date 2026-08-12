type RepositorySimilarityInput = {
  sourceRepositoryTypes: string[];
  sourceDomains: string[];
  sourceTechnologies: string[];
  sourceCapabilities?: string[];

  targetRepositoryTypes: string[];
  targetDomains: string[];
  targetTechnologies: string[];
  targetCapabilities?: string[];
};

const genericRepositoryTypes = new Set([
  "JAVASCRIPT_TYPESCRIPT_PROJECT",
  "FRONTEND_APPLICATION",
  "PYTHON_PROJECT",
  "GENERAL_REPOSITORY",
]);

const highValueRepositoryTypes = new Set([
  "FINTECH_PLATFORM",
  "DEVTOOL_PLATFORM",
  "OBSERVABILITY_PLATFORM",
  "SECURITY_PLATFORM",
  "ENGINEERING_INTELLIGENCE_PLATFORM",
  "AI_ML_PROJECT",
  "DATA_ENGINEERING_PROJECT",
  "INFRASTRUCTURE_REPOSITORY",
  "MOBILE_APPLICATION",
  "COLLABORATION_PLATFORM",
  "ENERGY_PLATFORM",
  "SMART_TRANSPORT_PLATFORM",
]);

/**
 * Normalise enum-like engineering signals.
 *
 * Future me:
 * Similarity should not fail just because one pipeline returned
 * "api_layer" and another returned "API_LAYER".
 *
 * We deliberately do not perform fuzzy matching here. Similarity must remain
 * deterministic and explainable.
 */
const normalizeStructuralSignal = (value: string) =>
  value.trim().toUpperCase();

/**
 * Technologies are product/library names rather than enums.
 *
 * Case differences such as "Node.js" vs "node.js" should not prevent a match,
 * but we preserve the source repository's original value in the response so
 * the API remains readable.
 */
const normalizeTechnology = (value: string) =>
  value.trim().toLowerCase();

/**
 * Remove duplicates according to the same normalisation rules used for
 * comparison.
 */
const uniqueStructuralSignals = (values: string[]) => {
  const seen = new Set<string>();

  return values.filter((value) => {
    const normalized = normalizeStructuralSignal(value);

    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
};

const uniqueTechnologies = (values: string[]) => {
  const seen = new Set<string>();

  return values.filter((value) => {
    const normalized = normalizeTechnology(value);

    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
};

const findSharedStructuralSignals = (
  source: string[],
  target: string[]
) => {
  const normalizedTargets = new Set(
    target.map(normalizeStructuralSignal)
  );

  return uniqueStructuralSignals(source).filter((value) =>
    normalizedTargets.has(
      normalizeStructuralSignal(value)
    )
  );
};

const findSharedTechnologies = (
  source: string[],
  target: string[]
) => {
  const normalizedTargets = new Set(
    target.map(normalizeTechnology)
  );

  return uniqueTechnologies(source).filter((value) =>
    normalizedTargets.has(
      normalizeTechnology(value)
    )
  );
};

/**
 * Sørensen-Dice overlap.
 *
 * Why use proportional overlap?
 *
 * The old model only counted shared signals. That meant sharing two out of
 * two technologies and sharing two out of twenty technologies received the
 * same technology contribution.
 *
 * Dice measures how much of BOTH repositories actually overlaps.
 */
const diceSimilarity = (
  source: string[],
  target: string[],
  sharedCount: number
) => {
  const totalSignals =
    source.length + target.length;

  if (totalSignals === 0) {
    return 0;
  }

  return (
    (2 * sharedCount) /
    totalSignals
  );
};

export const calculateRepositorySimilarity = ({
  sourceRepositoryTypes,
  sourceDomains,
  sourceTechnologies,
  sourceCapabilities = [],

  targetRepositoryTypes,
  targetDomains,
  targetTechnologies,
  targetCapabilities = [],
}: RepositorySimilarityInput) => {
  const normalizedSourceRepositoryTypes =
    uniqueStructuralSignals(
      sourceRepositoryTypes
    );

  const normalizedTargetRepositoryTypes =
    uniqueStructuralSignals(
      targetRepositoryTypes
    );

  const normalizedSourceDomains =
    uniqueStructuralSignals(
      sourceDomains
    );

  const normalizedTargetDomains =
    uniqueStructuralSignals(
      targetDomains
    );

  const normalizedSourceCapabilities =
    uniqueStructuralSignals(
      sourceCapabilities
    );

  const normalizedTargetCapabilities =
    uniqueStructuralSignals(
      targetCapabilities
    );

  const normalizedSourceTechnologies =
    uniqueTechnologies(
      sourceTechnologies
    );

  const normalizedTargetTechnologies =
    uniqueTechnologies(
      targetTechnologies
    );

  const sharedRepositoryTypes =
    findSharedStructuralSignals(
      normalizedSourceRepositoryTypes,
      normalizedTargetRepositoryTypes
    );

  const sharedDomains =
    findSharedStructuralSignals(
      normalizedSourceDomains,
      normalizedTargetDomains
    );

  const sharedTechnologies =
    findSharedTechnologies(
      normalizedSourceTechnologies,
      normalizedTargetTechnologies
    );

  const sharedCapabilities =
    findSharedStructuralSignals(
      normalizedSourceCapabilities,
      normalizedTargetCapabilities
    );

  /**
   * Repository identity deserves special treatment.
   *
   * Matching two specific product/platform classifications is much more
   * meaningful than both repositories merely being TypeScript projects.
   */
  const sharedHighValueRepositoryTypes =
    sharedRepositoryTypes.filter((type) =>
      highValueRepositoryTypes.has(
        normalizeStructuralSignal(type)
      )
    );

  const sharedGenericRepositoryTypes =
    sharedRepositoryTypes.filter((type) =>
      genericRepositoryTypes.has(
        normalizeStructuralSignal(type)
      )
    );

  const sharedOtherRepositoryTypes =
    sharedRepositoryTypes.filter(
      (type) =>
        !highValueRepositoryTypes.has(
          normalizeStructuralSignal(type)
        ) &&
        !genericRepositoryTypes.has(
          normalizeStructuralSignal(type)
        )
    );

  /**
   * Identity contribution.
   *
   * Keep this bounded. Multiple legacy/generic classifications should never
   * allow repository type count alone to dominate the entire result.
   */
  const repositoryTypeScore = Math.min(
    25,
    sharedHighValueRepositoryTypes.length * 20 +
      sharedOtherRepositoryTypes.length * 10 +
      sharedGenericRepositoryTypes.length * 4
  );

  /**
   * Structural similarity is based on proportional overlap.
   *
   * Maximum contributions:
   *
   * Repository identity: 25
   * Architecture domains: 25
   * Capabilities:         30
   * Technologies:        20
   *
   * Total:               100
   *
   * Capabilities receive the largest weight because they describe what the
   * repository actually does. Technologies provide supporting implementation
   * evidence rather than defining repository identity on their own.
   */
  const domainOverlap = diceSimilarity(
    normalizedSourceDomains,
    normalizedTargetDomains,
    sharedDomains.length
  );

  const capabilityOverlap = diceSimilarity(
    normalizedSourceCapabilities,
    normalizedTargetCapabilities,
    sharedCapabilities.length
  );

  const technologyOverlap = diceSimilarity(
    normalizedSourceTechnologies,
    normalizedTargetTechnologies,
    sharedTechnologies.length
  );

  const domainScore =
    domainOverlap * 25;

  const capabilityScore =
    capabilityOverlap * 30;

  const technologyScore =
    technologyOverlap * 20;

  const similarityScore = Math.min(
    100,
    Math.round(
      repositoryTypeScore +
        domainScore +
        capabilityScore +
        technologyScore
    )
  );

  const similarityLevel =
    similarityScore >= 70
      ? "HIGH"
      : similarityScore >= 40
        ? "MEDIUM"
        : "LOW";

  const hasSharedSignals =
    sharedRepositoryTypes.length > 0 ||
    sharedDomains.length > 0 ||
    sharedCapabilities.length > 0 ||
    sharedTechnologies.length > 0;

  const reason = hasSharedSignals
    ? `Shared ${sharedRepositoryTypes.length} repository type(s), ${sharedDomains.length} architecture domain(s), ${sharedCapabilities.length} capability signal(s), and ${sharedTechnologies.length} technology signal(s).`
    : "No strong semantic overlap detected.";

  return {
    similarityScore,
    similarityLevel,
    reason,

    /**
     * Existing properties remain untouched.
     *
     * capabilities is additive, so existing frontend consumers remain
     * compatible.
     */
    sharedSignals: {
      repositoryTypes:
        sharedRepositoryTypes,

      domains:
        sharedDomains,

      technologies:
        sharedTechnologies,

      capabilities:
        sharedCapabilities,
    },

    /**
     * Additive scoring evidence makes the final score auditable.
     */
    scoreBreakdown: {
      repositoryTypeScore,
      domainScore:
        Math.round(domainScore),
      capabilityScore:
        Math.round(capabilityScore),
      technologyScore:
        Math.round(technologyScore),
    },

    overlap: {
      domains:
        Number(domainOverlap.toFixed(3)),

      capabilities:
        Number(
          capabilityOverlap.toFixed(3)
        ),

      technologies:
        Number(
          technologyOverlap.toFixed(3)
        ),
    },
  };
};
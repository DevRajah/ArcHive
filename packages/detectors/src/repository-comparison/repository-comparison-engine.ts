import {
  RepositoryComparison,
  RepositoryComparisonInput,
} from "./types";

/**
 * Repository identities vary significantly in semantic importance.
 *
 * Sharing FINTECH_PLATFORM or DEVTOOL_PLATFORM tells us much more about
 * two repositories than both simply being generic JavaScript projects.
 */
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
 * Normalize structured intelligence before comparison.
 *
 * We intentionally normalize casing and whitespace only.
 *
 * Future me:
 * Do not introduce fuzzy matching here.
 *
 * "Redis" and "redis" are the same signal.
 * "PostgreSQL" and "MongoDB" are not.
 *
 * Similarity must remain deterministic and explainable.
 */
const normalize = (value: string) =>
  value.trim().toUpperCase();

/**
 * Build a normalized lookup while retaining the original source value.
 *
 * That means comparison is case-insensitive, while API evidence remains
 * human-readable.
 */
const buildNormalizedMap = (
  values: string[]
) => {
  const map = new Map<
    string,
    string
  >();

  for (const value of values) {
    const trimmed = value.trim();

    if (!trimmed) {
      continue;
    }

    const key = normalize(trimmed);

    if (!map.has(key)) {
      map.set(key, trimmed);
    }
  }

  return map;
};

const shared = (
  source: string[],
  target: string[]
) => {
  const sourceMap =
    buildNormalizedMap(source);

  const targetKeys = new Set(
    Array.from(
      buildNormalizedMap(
        target
      ).keys()
    )
  );

  return Array.from(
    sourceMap.entries()
  )
    .filter(([key]) =>
      targetKeys.has(key)
    )
    .map(([, value]) => value);
};

const difference = (
  source: string[],
  target: string[]
) => {
  const sourceMap =
    buildNormalizedMap(source);

  const targetKeys = new Set(
    Array.from(
      buildNormalizedMap(
        target
      ).keys()
    )
  );

  return Array.from(
    sourceMap.entries()
  )
    .filter(
      ([key]) =>
        !targetKeys.has(key)
    )
    .map(([, value]) => value);
};

/**
 * Sørensen-Dice overlap.
 *
 * Why use this instead of raw shared-count scoring?
 *
 * Two repositories sharing 2 of 2 technologies should be considered much
 * closer than two repositories sharing the same 2 technologies when each
 * contains 20 different technology signals.
 *
 * Dice naturally accounts for the size of both signal sets.
 */
const calculateOverlap = (
  source: string[],
  target: string[],
  sharedValues: string[]
) => {
  const sourceSize =
    buildNormalizedMap(source).size;

  const targetSize =
    buildNormalizedMap(target).size;

  if (
    sourceSize === 0 &&
    targetSize === 0
  ) {
    return 0;
  }

  return (
    (2 * sharedValues.length) /
    (sourceSize + targetSize)
  );
};

/**
 * Repository type similarity deserves special treatment because repository
 * identity carries stronger semantic meaning than individual technologies.
 *
 * A shared product/platform identity therefore receives a bounded identity
 * contribution, with high-value identities carrying more weight than generic
 * project classifications.
 */
const calculateRepositoryTypeScore = (
  sharedRepositoryTypes: string[],
  repositoryTypeOverlap: number
) => {
  if (
    sharedRepositoryTypes.length === 0
  ) {
    return 0;
  }

  const hasHighValueType =
    sharedRepositoryTypes.some(
      (type) =>
        highValueRepositoryTypes.has(
          normalize(type)
        )
    );

  const hasNonGenericType =
    sharedRepositoryTypes.some(
      (type) => {
        const normalized =
          normalize(type);

        return (
          !genericRepositoryTypes.has(
            normalized
          ) &&
          !highValueRepositoryTypes.has(
            normalized
          )
        );
      }
    );

  /**
   * Maximum repository identity contribution: 25 points.
   *
   * High-value platform/product identity gets the full weight.
   * Other specific identities get a moderate weight.
   * Generic identities intentionally contribute less.
   */
  const maximumContribution =
    hasHighValueType
      ? 25
      : hasNonGenericType
        ? 18
        : 8;

  return Math.round(
    repositoryTypeOverlap *
      maximumContribution
  );
};

const getSimilarityLevel = (
  score: number
): RepositoryComparison["similarityLevel"] => {
  if (score >= 70) {
    return "HIGH";
  }

  if (score >= 40) {
    return "MEDIUM";
  }

  return "LOW";
};

export const compareRepositories = ({
  source,
  target,
}: RepositoryComparisonInput): RepositoryComparison => {
  /**
   * ============================================================
   * SHARED CANONICAL INTELLIGENCE
   * ============================================================
   */

  const sharedRepositoryTypes =
    shared(
      source.repositoryTypes,
      target.repositoryTypes
    );

  const sharedArchitectureDomains =
    shared(
      source.architectureDomains,
      target.architectureDomains
    );

  const sharedCapabilities =
    shared(
      source.capabilities,
      target.capabilities
    );

  const sharedTechnologies =
    shared(
      source.technologies,
      target.technologies
    );

  /**
   * Engineering signals are retained for API compatibility and explanation,
   * but they are not included in the canonical similarity score.
   *
   * Current structured capability/domain/technology evidence is stronger than
   * older free-form engineering signal strings.
   */
  const sharedEngineeringSignals =
    shared(
      source.engineeringSignals ?? [],
      target.engineeringSignals ?? []
    );

  /**
   * ============================================================
   * NORMALIZED OVERLAP
   * ============================================================
   */

  const repositoryTypeOverlap =
    calculateOverlap(
      source.repositoryTypes,
      target.repositoryTypes,
      sharedRepositoryTypes
    );

  const architectureDomainOverlap =
    calculateOverlap(
      source.architectureDomains,
      target.architectureDomains,
      sharedArchitectureDomains
    );

  const capabilityOverlap =
    calculateOverlap(
      source.capabilities,
      target.capabilities,
      sharedCapabilities
    );

  const technologyOverlap =
    calculateOverlap(
      source.technologies,
      target.technologies,
      sharedTechnologies
    );

  /**
   * ============================================================
   * WEIGHTED SIMILARITY MODEL
   * ============================================================
   *
   * Maximum score:
   *
   * Repository identity     25
   * Architecture domains    25
   * Capabilities            30
   * Technologies            20
   * --------------------------
   * Total                  100
   *
   * Capabilities receive the highest structural weight because they describe
   * what the repository actually implements.
   *
   * Architecture domains describe where those capabilities live.
   *
   * Technologies provide useful implementation overlap but receive less
   * weight because common tools such as TypeScript or Docker alone should
   * never make two unrelated repositories appear strongly related.
   */

  const repositoryTypeScore =
    calculateRepositoryTypeScore(
      sharedRepositoryTypes,
      repositoryTypeOverlap
    );

  const architectureDomainScore =
    Math.round(
      architectureDomainOverlap *
        25
    );

  const capabilityScore =
    Math.round(
      capabilityOverlap * 30
    );

  const technologyScore =
    Math.round(
      technologyOverlap * 20
    );

  const score = Math.min(
    100,
    repositoryTypeScore +
      architectureDomainScore +
      capabilityScore +
      technologyScore
  );

  /**
   * ============================================================
   * DIFFERENCE INTELLIGENCE
   * ============================================================
   */

  const sourceOnlyTypes =
    difference(
      source.repositoryTypes,
      target.repositoryTypes
    );

  const targetOnlyTypes =
    difference(
      target.repositoryTypes,
      source.repositoryTypes
    );

  const sourceOnlyTechnologies =
    difference(
      source.technologies,
      target.technologies
    );

  const targetOnlyTechnologies =
    difference(
      target.technologies,
      source.technologies
    );

  const sourceOnlyCapabilities =
    difference(
      source.capabilities,
      target.capabilities
    );

  const targetOnlyCapabilities =
    difference(
      target.capabilities,
      source.capabilities
    );

  const sourceOnlyDomains =
    difference(
      source.architectureDomains,
      target.architectureDomains
    );

  const targetOnlyDomains =
    difference(
      target.architectureDomains,
      source.architectureDomains
    );

  const keyDifferences: string[] = [];

  if (sourceOnlyTypes.length) {
    keyDifferences.push(
      `${source.name} has unique repository identities: ${sourceOnlyTypes.join(", ")}.`
    );
  }

  if (targetOnlyTypes.length) {
    keyDifferences.push(
      `${target.name} has unique repository identities: ${targetOnlyTypes.join(", ")}.`
    );
  }

  if (sourceOnlyCapabilities.length) {
    keyDifferences.push(
      `${source.name} has capabilities not strongly detected in ${target.name}: ${sourceOnlyCapabilities
        .slice(0, 6)
        .join(", ")}.`
    );
  }

  if (targetOnlyCapabilities.length) {
    keyDifferences.push(
      `${target.name} has capabilities not strongly detected in ${source.name}: ${targetOnlyCapabilities
        .slice(0, 6)
        .join(", ")}.`
    );
  }

  if (sourceOnlyDomains.length) {
    keyDifferences.push(
      `${source.name} contains architecture domains not strongly detected in ${target.name}: ${sourceOnlyDomains
        .slice(0, 6)
        .join(", ")}.`
    );
  }

  if (targetOnlyDomains.length) {
    keyDifferences.push(
      `${target.name} contains architecture domains not strongly detected in ${source.name}: ${targetOnlyDomains
        .slice(0, 6)
        .join(", ")}.`
    );
  }

  if (
    sourceOnlyTechnologies.length
  ) {
    keyDifferences.push(
      `${source.name} uses technologies not strongly detected in ${target.name}: ${sourceOnlyTechnologies
        .slice(0, 6)
        .join(", ")}.`
    );
  }

  if (
    targetOnlyTechnologies.length
  ) {
    keyDifferences.push(
      `${target.name} uses technologies not strongly detected in ${source.name}: ${targetOnlyTechnologies
        .slice(0, 6)
        .join(", ")}.`
    );
  }

  if (
    typeof source.healthScore ===
      "number" &&
    typeof target.healthScore ===
      "number"
  ) {
    const healthGap = Math.abs(
      source.healthScore -
        target.healthScore
    );

    if (healthGap >= 15) {
      const stronger =
        source.healthScore >
        target.healthScore
          ? source.name
          : target.name;

      keyDifferences.push(
        `${stronger} currently has a stronger repository health score by ${healthGap} point(s).`
      );
    }
  }

  /**
   * ============================================================
   * RECOMMENDATIONS
   * ============================================================
   */

  const recommendations: string[] = [];

  if (score >= 70) {
    recommendations.push(
      "These repositories share strong engineering overlap and may benefit from shared architecture patterns, reusable infrastructure, or common documentation."
    );
  } else if (score >= 40) {
    recommendations.push(
      "These repositories share meaningful engineering overlap, but their architecture or product purpose differs enough to compare them selectively."
    );
  } else {
    recommendations.push(
      "These repositories appear meaningfully different, so comparison should focus on transferable engineering practices rather than direct architectural similarity."
    );
  }

  if (
    sharedTechnologies.some(
      (technology) =>
        normalize(technology) ===
        "DOCKER"
    )
  ) {
    recommendations.push(
      "Both repositories show Docker usage, so deployment and local development workflows can be compared."
    );
  }

  if (
    sharedTechnologies.some(
      (technology) => {
        const normalized =
          normalize(technology);

        return (
          normalized === "BULLMQ" ||
          normalized === "KAFKA"
        );
      }
    )
  ) {
    recommendations.push(
      "Both repositories show asynchronous processing infrastructure, so queue monitoring, retry behaviour, and worker patterns can be compared."
    );
  }

  if (
    sharedCapabilities.some(
      (capability) =>
        normalize(capability) ===
        "API_LAYER"
    )
  ) {
    recommendations.push(
      "Both repositories expose API-layer capabilities, making them suitable for API design and service-boundary comparison."
    );
  }

  if (
    sharedCapabilities.some(
      (capability) =>
        normalize(capability) ===
        "QUEUE_INFRASTRUCTURE"
    )
  ) {
    recommendations.push(
      "Both repositories implement queue infrastructure, so background processing, retry policies, and failure handling can be compared."
    );
  }

  if (
    sharedCapabilities.some(
      (capability) =>
        normalize(capability) ===
        "REALTIME_SYSTEMS"
    )
  ) {
    recommendations.push(
      "Both repositories contain realtime-system capabilities, making event delivery and live-update architecture useful comparison areas."
    );
  }

  return {
    similarityScore: score,

    similarityLevel:
      getSimilarityLevel(score),

    sharedSignals: {
      repositoryTypes:
        sharedRepositoryTypes,

      technologies:
        sharedTechnologies,

      architectureDomains:
        sharedArchitectureDomains,

      capabilities:
        sharedCapabilities,

      engineeringSignals:
        sharedEngineeringSignals,
    },

    scoreBreakdown: {
      repositoryTypeScore,
      architectureDomainScore,
      capabilityScore,
      technologyScore,
    },

    overlap: {
      repositoryTypes:
        Number(
          repositoryTypeOverlap.toFixed(
            3
          )
        ),

      architectureDomains:
        Number(
          architectureDomainOverlap.toFixed(
            3
          )
        ),

      capabilities:
        Number(
          capabilityOverlap.toFixed(3)
        ),

      technologies:
        Number(
          technologyOverlap.toFixed(3)
        ),
    },

    keyDifferences,
    recommendations,
  };
};
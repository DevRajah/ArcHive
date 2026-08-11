import type {
  DependencyImpactLevel,
} from "../types/dependency-intelligence.types";

const clampScore = (score: number) => {
  return Math.max(
    0,
    Math.min(100, Math.round(score))
  );
};

/**
 * Convert portfolio impact into its presentation tier.
 *
 * Future me:
 * This describes engineering blast radius / portfolio exposure.
 * It does NOT describe whether a technology itself is dangerous,
 * insecure, unstable, or otherwise "risky".
 */
export const getImpactLevel = (
  score: number
): DependencyImpactLevel => {
  if (score >= 71) {
    return "CRITICAL";
  }

  if (score >= 46) {
    return "HIGH";
  }

  if (score >= 21) {
    return "MEDIUM";
  }

  return "LOW";
};

/**
 * Return the lower bound of a Wilson score interval.
 *
 * Raw coverage alone treats:
 *
 * 3 / 3
 *
 * and:
 *
 * 100 / 100
 *
 * as equally strong evidence because both are 100%.
 *
 * Wilson allows ArcHive to preserve the observed coverage while recognising
 * that a larger sample provides stronger evidence for portfolio-wide
 * exposure.
 */
const calculateWilsonLowerBound = (
  successes: number,
  total: number,
  z = 1.96
) => {
  if (
    total <= 0 ||
    successes <= 0
  ) {
    return 0;
  }

  const boundedSuccesses =
    Math.min(successes, total);

  const proportion =
    boundedSuccesses / total;

  const zSquared =
    z * z;

  const denominator =
    1 + zSquared / total;

  const centre =
    proportion +
    zSquared / (2 * total);

  const margin =
    z *
    Math.sqrt(
      (proportion *
        (1 - proportion)) /
        total +
        zSquared /
          (4 * total * total)
    );

  return Math.max(
    0,
    (centre - margin) /
      denominator
  );
};

/**
 * Preserve observed portfolio coverage as the dominant signal while
 * applying a modest sample-confidence adjustment.
 *
 * 70% = actual observed portfolio exposure
 * 30% = confidence-adjusted exposure
 *
 * ArcHive is analysing the user's real portfolio rather than estimating
 * some unknown external population, so the observed percentage should
 * remain the stronger component.
 */
const calculateConfidenceAdjustedCoverage = (
  repositoryCount: number,
  totalRepositories: number
) => {
  if (totalRepositories <= 0) {
    return 0;
  }

  const boundedRepositoryCount =
    Math.max(
      0,
      Math.min(
        repositoryCount,
        totalRepositories
      )
    );

  const observedCoverage =
    boundedRepositoryCount /
    totalRepositories;

  const confidenceCoverage =
    calculateWilsonLowerBound(
      boundedRepositoryCount,
      totalRepositories
    );

  return (
    observedCoverage * 0.7 +
    confidenceCoverage * 0.3
  );
};

type DependencyScoreInput = {
  repositoryCount: number;
  totalRepositories: number;

  connectedTechnologyCount: number;
  totalTechnologies: number;

  architectureDomainCount: number;
  capabilityCount: number;
};

/**
 * Centrality measures how deeply embedded a technology is across the
 * portfolio.
 *
 * Repository coverage remains the strongest signal, followed by graph
 * connectivity and architecture/capability breadth.
 */
export const calculateCentralityScore = ({
  repositoryCount,
  totalRepositories,
  connectedTechnologyCount,
  totalTechnologies,
  architectureDomainCount,
  capabilityCount,
}: DependencyScoreInput) => {
  const repositoryCoverage =
    calculateConfidenceAdjustedCoverage(
      repositoryCount,
      totalRepositories
    );

  const connectionCoverage =
    totalTechnologies > 1
      ? Math.min(
          connectedTechnologyCount /
            (totalTechnologies - 1),
          1
        )
      : 0;

  const architectureDepth =
    Math.min(
      architectureDomainCount / 8,
      1
    );

  const capabilityDepth =
    Math.min(
      capabilityCount / 10,
      1
    );

  return clampScore(
    repositoryCoverage * 45 +
      connectionCoverage * 30 +
      architectureDepth * 15 +
      capabilityDepth * 10
  );
};

/**
 * Impact estimates the potential engineering blast radius of changing,
 * removing, migrating, or losing a technology.
 *
 * High impact means broad exposure. It does not mean the technology is bad
 * or inherently risky.
 */
export const calculateImpactScore = ({
  repositoryCount,
  totalRepositories,
  connectedTechnologyCount,
  totalTechnologies,
  architectureDomainCount,
  capabilityCount,
}: DependencyScoreInput) => {
  const repositoryReach =
    calculateConfidenceAdjustedCoverage(
      repositoryCount,
      totalRepositories
    );

  const ecosystemReach =
    totalTechnologies > 1
      ? Math.min(
          connectedTechnologyCount /
            (totalTechnologies - 1),
          1
        )
      : 0;

  const domainReach =
    Math.min(
      architectureDomainCount / 8,
      1
    );

  const capabilityReach =
    Math.min(
      capabilityCount / 10,
      1
    );

  return clampScore(
    repositoryReach * 50 +
      ecosystemReach * 25 +
      domainReach * 15 +
      capabilityReach * 10
  );
};

/**
 * Estimate how much impact a specific repository contributes to the
 * technology's overall portfolio exposure.
 *
 * Future me:
 * This is a local repository-density score. It is separate from the
 * portfolio-wide impact score and should remain independently testable.
 */
export const calculateRepositoryImpactContribution = ({
  relatedTechnologyCount,
  architectureDomainCount,
  capabilityCount,
  isTracked,
}: {
  relatedTechnologyCount: number;
  architectureDomainCount: number;
  capabilityCount: number;
  isTracked: boolean;
}) => {
  return clampScore(
    relatedTechnologyCount * 5 +
      architectureDomainCount * 12 +
      capabilityCount * 8 +
      (isTracked ? 10 : 0)
  );
};
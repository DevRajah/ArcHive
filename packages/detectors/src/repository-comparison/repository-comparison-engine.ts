import {
  RepositoryComparison,
  RepositoryComparisonInput,
} from "./types";

const shared = (source: string[], target: string[]) => {
  return Array.from(new Set(source.filter((item) => target.includes(item))));
};

const difference = (source: string[], target: string[]) => {
  return Array.from(new Set(source.filter((item) => !target.includes(item))));
};

const getSimilarityLevel = (
  score: number
): RepositoryComparison["similarityLevel"] => {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
};

export const compareRepositories = ({
  source,
  target,
}: RepositoryComparisonInput): RepositoryComparison => {
  const sharedRepositoryTypes = shared(
    source.repositoryTypes,
    target.repositoryTypes
  );

  const sharedTechnologies = shared(source.technologies, target.technologies);

  const sharedArchitectureDomains = shared(
    source.architectureDomains,
    target.architectureDomains
  );

  const sharedEngineeringSignals = shared(
    source.engineeringSignals,
    target.engineeringSignals
  );

  const score = Math.min(
    100,
    sharedRepositoryTypes.length * 25 +
      sharedArchitectureDomains.length * 12 +
      sharedTechnologies.length * 8 +
      sharedEngineeringSignals.length * 5
  );

  const sourceOnlyTypes = difference(
    source.repositoryTypes,
    target.repositoryTypes
  );

  const targetOnlyTypes = difference(
    target.repositoryTypes,
    source.repositoryTypes
  );

  const sourceOnlyTechnologies = difference(
    source.technologies,
    target.technologies
  );

  const targetOnlyTechnologies = difference(
    target.technologies,
    source.technologies
  );

  const keyDifferences: string[] = [];

  if (sourceOnlyTypes.length) {
    keyDifferences.push(
      `${source.name} has unique repository identities: ${sourceOnlyTypes.join(
        ", "
      )}.`
    );
  }

  if (targetOnlyTypes.length) {
    keyDifferences.push(
      `${target.name} has unique repository identities: ${targetOnlyTypes.join(
        ", "
      )}.`
    );
  }

  if (sourceOnlyTechnologies.length) {
    keyDifferences.push(
      `${source.name} uses technologies not strongly detected in ${
        target.name
      }: ${sourceOnlyTechnologies.slice(0, 6).join(", ")}.`
    );
  }

  if (targetOnlyTechnologies.length) {
    keyDifferences.push(
      `${target.name} uses technologies not strongly detected in ${
        source.name
      }: ${targetOnlyTechnologies.slice(0, 6).join(", ")}.`
    );
  }

  if (
    typeof source.healthScore === "number" &&
    typeof target.healthScore === "number"
  ) {
    const healthGap = Math.abs(source.healthScore - target.healthScore);

    if (healthGap >= 15) {
      const stronger =
        source.healthScore > target.healthScore ? source.name : target.name;

      keyDifferences.push(
        `${stronger} currently has a stronger repository health score by ${healthGap} point(s).`
      );
    }
  }

  const recommendations: string[] = [];

  if (score >= 70) {
    recommendations.push(
      "These repositories share strong engineering overlap and may benefit from shared architecture patterns, reusable infrastructure, or common documentation."
    );
  } else if (score >= 40) {
    recommendations.push(
      "These repositories share some useful engineering overlap, but their architecture and purpose differ enough to compare them carefully."
    );
  } else {
    recommendations.push(
      "These repositories appear meaningfully different, so comparison should focus on transferable engineering practices rather than direct similarity."
    );
  }

  if (sharedTechnologies.includes("Docker")) {
    recommendations.push(
      "Both repositories show Docker usage, so deployment and local development workflows can be standardized."
    );
  }

  if (sharedTechnologies.includes("BullMQ") || sharedTechnologies.includes("Kafka")) {
    recommendations.push(
      "Both repositories show asynchronous processing signals, so queue monitoring and retry patterns can be compared."
    );
  }

  if (sharedArchitectureDomains.includes("API_LAYER")) {
    recommendations.push(
      "Both repositories expose API-layer architecture, making them suitable for API design and service boundary comparison."
    );
  }

  return {
    similarityScore: score,
    similarityLevel: getSimilarityLevel(score),
    sharedSignals: {
      repositoryTypes: sharedRepositoryTypes,
      technologies: sharedTechnologies,
      architectureDomains: sharedArchitectureDomains,
      engineeringSignals: sharedEngineeringSignals,
    },
    keyDifferences,
    recommendations,
  };
};
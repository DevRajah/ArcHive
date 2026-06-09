type RepositorySimilarityInput = {
  sourceRepositoryTypes: string[];
  sourceDomains: string[];
  sourceTechnologies: string[];

  targetRepositoryTypes: string[];
  targetDomains: string[];
  targetTechnologies: string[];
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

export const calculateRepositorySimilarity = ({
  sourceRepositoryTypes,
  sourceDomains,
  sourceTechnologies,
  targetRepositoryTypes,
  targetDomains,
  targetTechnologies,
}: RepositorySimilarityInput) => {
  const sharedRepositoryTypes = sourceRepositoryTypes.filter((type) =>
    targetRepositoryTypes.includes(type)
  );

  const sharedDomains = sourceDomains.filter((domain) =>
    targetDomains.includes(domain)
  );

  const sharedTechnologies = sourceTechnologies.filter((technology) =>
    targetTechnologies.includes(technology)
  );

  const repositoryTypeScore = sharedRepositoryTypes.reduce((total, type) => {
    if (highValueRepositoryTypes.has(type)) return total + 30;
    if (genericRepositoryTypes.has(type)) return total + 8;

    return total + 15;
  }, 0);

  const domainScore = sharedDomains.length * 15;
  const technologyScore = sharedTechnologies.length * 5;

  const similarityScore = Math.min(
    100,
    repositoryTypeScore + domainScore + technologyScore
  );

  const similarityLevel =
    similarityScore >= 70
      ? "HIGH"
      : similarityScore >= 40
        ? "MEDIUM"
        : "LOW";

  const reason =
    sharedRepositoryTypes.length > 0 ||
    sharedDomains.length > 0 ||
    sharedTechnologies.length > 0
      ? `Shared ${sharedRepositoryTypes.length} repository type(s), ${sharedDomains.length} architecture domain(s), and ${sharedTechnologies.length} technology signal(s).`
      : "No strong semantic overlap detected.";

  return {
    similarityScore,
    similarityLevel,
    reason,
    sharedSignals: {
      repositoryTypes: sharedRepositoryTypes,
      domains: sharedDomains,
      technologies: sharedTechnologies,
    },
  };
};